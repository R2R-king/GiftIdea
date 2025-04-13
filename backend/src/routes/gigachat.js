import express from 'express';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import https from 'https';
import { sendChatRequest, testGigaChat, getGigaChatToken } from '../services/gigachat.js';

const router = express.Router();

// GigaChat credentials - these should be stored securely in environment variables
const CLIENT_ID = process.env.GIGACHAT_CLIENT_ID || 'your-client-id';
const CLIENT_SECRET = process.env.GIGACHAT_CLIENT_SECRET || 'your-client-secret';

// Create the authorization string by encoding CLIENT_ID:CLIENT_SECRET in base64
const authString = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

// Create an axios instance with SSL verification disabled
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
});

// Debug route to check if the server is working
router.get('/status', (req, res) => {
  res.json({ 
    status: 'ok',
    credentials: {
      clientId: CLIENT_ID ? CLIENT_ID.substring(0, 5) + '...' : 'Not set',
      clientSecret: CLIENT_SECRET ? 'Set (hidden)' : 'Not set'
    }
  });
});

/**
 * Route to get GigaChat API token
 * This route acts as a proxy to hide credentials from the frontend
 */
router.post('/token', async (req, res) => {
  try {
    console.log('Token request received');
    
    // Generate a unique request ID
    const requestId = uuidv4();
    console.log(`Request ID: ${requestId}`);
    
    console.log('Making request to GigaChat token endpoint...');
    
    // Make the request to GigaChat's token endpoint
    const response = await axiosInstance({
      method: 'POST',
      url: 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'RqUID': requestId,
        'Authorization': `Basic ${authString}`,
      },
      data: 'scope=GIGACHAT_API_PERS'
    });
    
    console.log('Token received successfully');
    
    // Return the token data to the client
    res.json(response.data);
  } catch (error) {
    console.error('Error getting GigaChat token:', error.message);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received. Request:', error.request);
    }
    
    // Return appropriate error message
    res.status(error.response?.status || 500).json({
      error: 'Failed to get GigaChat token',
      details: error.response?.data || error.message
    });
  }
});

/**
 * Route to proxy chat completions requests to GigaChat
 * This allows monitoring and logging of requests if needed
 */
router.post('/chat', async (req, res) => {
  try {
    console.log('Chat request received');
    
    // Get token from the request headers
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      console.error('No token provided');
      return res.status(401).json({ error: 'No token provided' });
    }
    
    console.log('Making request to GigaChat chat completions endpoint...');
    
    // Forward the request to GigaChat
    const response = await axiosInstance({
      method: 'POST',
      url: 'https://gigachat.devices.sberbank.ru/api/v1/chat/completions',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      data: req.body
    });
    
    console.log('Chat response received successfully');
    
    // Return the response from GigaChat
    res.json(response.data);
  } catch (error) {
    console.error('Error with chat completion:', error.message);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } else if (error.request) {
      console.error('No response received. Request:', error.request);
    }
    
    // If token expired (401), inform the client to refresh token
    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'Token expired', refreshToken: true });
    }
    
    // Return appropriate error message
    res.status(error.response?.status || 500).json({
      error: 'Chat completion failed',
      details: error.response?.data || error.message
    });
  }
});

/**
 * Route to handle streaming responses from GigaChat
 * This implementation simulates streaming by making a regular request and
 * returning the full response. In a production app, you would use
 * Server-Sent Events (SSE) or WebSockets for true streaming.
 */
router.post('/stream', async (req, res) => {
  try {
    console.log('Stream request received');
    
    // Get token from the request headers
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      console.error('No token provided');
      return res.status(401).json({ error: 'No token provided' });
    }
    
    // Make a regular request without streaming
    // This is a simplification - in production, use actual streaming
    const requestData = {
      ...req.body,
      stream: false // Override stream parameter
    };
    
    console.log('Making request to GigaChat chat completions endpoint for streaming...');
    
    const response = await axiosInstance({
      method: 'POST',
      url: 'https://gigachat.devices.sberbank.ru/api/v1/chat/completions',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      data: requestData
    });
    
    console.log('Stream response received successfully');
    
    // Return the complete response to the client
    // The client will simulate streaming in the frontend
    res.json(response.data);
  } catch (error) {
    console.error('Error with streaming chat completion:', error.message);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } else if (error.request) {
      console.error('No response received. Request:', error.request);
    }
    
    // If token expired (401), inform the client to refresh token
    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'Token expired', refreshToken: true });
    }
    
    // Return appropriate error message
    res.status(error.response?.status || 500).json({
      error: 'Streaming chat completion failed',
      details: error.response?.data || error.message
    });
  }
});

// Тестовый эндпоинт для проверки статуса
router.get('/test', async (req, res) => {
  try {
    const result = await testGigaChat();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Эндпоинт для прямой отправки сообщений без токена
router.post('/direct', async (req, res) => {
  try {
    const { messages, model } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }
    
    const response = await sendChatRequest(messages, model || 'GigaChat-Max');
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 