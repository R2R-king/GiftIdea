import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
const router = express.Router();

// Mock user database for demonstration
// In a real app, you'd use your User model and database
const users = [
  {
    id: 1,
    username: 'demo',
    email: 'demo@example.com',
    // Password: password123
    password: '$2a$10$X7P1RXFHzIsCKIMzrEF9OOkJZ3TTIib8alYSKl5lSI9AohkYP/O96',
    roles: ['ROLE_USER'],
    firstName: 'Demo',
    lastName: 'User',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    phone: '+7 (999) 123-45-67',
    bio: 'Я демо-пользователь для тестирования приложения.'
  }
];

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ 
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles
    }, 'your_jwt_secret', { expiresIn: '24h' });

    // Return user information with token
    return res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      avatar: user.avatar || '',
      roles: user.roles,
      token: token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Registration endpoint
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, roles } = req.body;

    // Check if username exists
    if (users.some(u => u.username === username)) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    // Check if email exists
    if (users.some(u => u.email === email)) {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user (in a real app, save to database)
    const newUser = {
      id: users.length + 1,
      username,
      email,
      password: hashedPassword,
      roles: roles || ['ROLE_USER'],
      firstName: '',
      lastName: '',
      avatar: 'https://via.placeholder.com/100',
      phone: '',
      bio: ''
    };

    // Add to mock database
    users.push(newUser);

    return res.status(200).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Token validation endpoint
router.post('/validate-token', (req, res) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify token
    jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Find user by ID from token
      const user = users.find(u => u.id === decoded.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Return user information
      return res.status(200).json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        avatar: user.avatar || '',
        roles: user.roles
      });
    });
  } catch (error) {
    console.error('Token validation error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile
router.get('/profile', (req, res) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify token
    jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Find user by ID from token
      const user = users.find(u => u.id === decoded.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Return user profile
      return res.status(200).json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        avatar: user.avatar || '',
        phone: user.phone || '',
        bio: user.bio || '',
        roles: user.roles
      });
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', (req, res) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify token
    jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Find user by ID from token
      const userIndex = users.findIndex(u => u.id === decoded.id);
      if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update user profile fields
      const { firstName, lastName, avatar, phone, bio, email } = req.body;
      
      // Validate email uniqueness if changed
      if (email && email !== users[userIndex].email) {
        if (users.some((u, idx) => idx !== userIndex && u.email === email)) {
          return res.status(400).json({ message: 'Email is already in use' });
        }
        users[userIndex].email = email;
      }
      
      // Update other fields if provided
      if (firstName !== undefined) users[userIndex].firstName = firstName;
      if (lastName !== undefined) users[userIndex].lastName = lastName;
      if (avatar !== undefined) users[userIndex].avatar = avatar;
      if (phone !== undefined) users[userIndex].phone = phone;
      if (bio !== undefined) users[userIndex].bio = bio;

      // Return updated user profile
      return res.status(200).json({
        id: users[userIndex].id,
        username: users[userIndex].username,
        email: users[userIndex].email,
        firstName: users[userIndex].firstName || '',
        lastName: users[userIndex].lastName || '',
        avatar: users[userIndex].avatar || '',
        phone: users[userIndex].phone || '',
        bio: users[userIndex].bio || '',
        roles: users[userIndex].roles
      });
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router; 