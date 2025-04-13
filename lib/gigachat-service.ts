import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { v4 as uuidv4 } from 'uuid';

// Global warnings disabled
// @ts-ignore
console.ignoredYellowBox = ['Warning: ...'];
// @ts-ignore
console.disableYellowBox = true;

export type GigaChatMessage = {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
};

export type GigaChatResponse = {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

class GigaChatService {
  // Set the backend URL based on platform
  private backendUrl = Platform.OS === 'web' 
    ? 'http://localhost:4000' 
    : 'http://172.20.10.9:4000'; // Updated with current IP address and port
  
  constructor() {
    console.log('GigaChat service initialized with backend URL:', this.backendUrl);
  }
  
  /**
   * Send messages to GigaChat API via our backend
   */
  public async sendMessage(messages: GigaChatMessage[]): Promise<GigaChatResponse> {
    try {
      console.log('Sending message to backend');
      
      const chatResponse = await fetch(`${this.backendUrl}/api/gigachat/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages,
          temperature: 0.7,
          max_tokens: 1500,
        }),
      });
      
      if (!chatResponse.ok) {
        const errorText = await chatResponse.text();
        console.error('Chat API error:', errorText);
        throw new Error(`Backend error (${chatResponse.status}): ${errorText}`);
      }
      
      const responseData = await chatResponse.json();
      console.log('Response received successfully');
      
      return responseData;
    } catch (error) {
      console.error('Error sending message to backend:', error);
      throw error;
    }
  }
  
  /**
   * Stream messages from GigaChat API via our backend
   */
  public async streamMessage(
    messages: GigaChatMessage[],
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      console.log('Requesting streaming response from backend');
      
      // Create a connection to our backend streaming endpoint
      const response = await fetch(`${this.backendUrl}/api/gigachat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages,
          temperature: 0.7,
          max_tokens: 1500,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Stream API error:', errorText);
        throw new Error(`Backend stream error (${response.status}): ${errorText}`);
      }
      
      // Get a reader from the response body
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader');
      }
      
      const decoder = new TextDecoder();
      let receivedText = '';
      
      // Read the stream chunk by chunk
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        // Check if the chunk is a data event from SSE
        const chunkLines = chunk.split('\n\n');
        
        for (const line of chunkLines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            // Ignore '[DONE]' marker which indicates end of stream
            if (data !== '[DONE]') {
              try {
                onChunk(data);
                receivedText += data;
              } catch (e) {
                console.error('Error processing chunk:', e);
              }
            }
          }
        }
      }
      
      console.log('Stream completed successfully');
      onComplete();
    } catch (error) {
      console.error('Error in stream message:', error);
      onError(error instanceof Error ? error : new Error(String(error)));
    }
  }
  
  /**
   * Check backend connectivity
   */
  public async checkBackendStatus(): Promise<boolean> {
    try {
      const response = await fetch(`${this.backendUrl}/api/status`);
      return response.ok;
    } catch (error) {
      console.error('Backend connectivity check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const gigaChatService = new GigaChatService();
export default gigaChatService; 