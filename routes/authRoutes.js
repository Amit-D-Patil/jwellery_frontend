
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { readFile, writeFile } from 'fs/promises';

const router = express.Router();
const USERS_FILE = './data/users.json';

// Register a new user
// router.post('/register', async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     if (!username || !password) {
//       return res.status(400).json({ message: 'Username and password are required' });
//     }

//     // const usersData = await readFile(USERS_FILE, 'utf-8');
//     // const users = JSON.parse(usersData);

//     // if (users.find(user => user.username === username)) {
//     //   return res.status(400).json({ message: 'User already exists' });
//     // }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     console.log({ username, password: hashedPassword });

//     // await writeFile(USERS_FILE, JSON.stringify(users, null, 2));

//     res.status(201).json({ message: 'User registered successfully' });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });
const users = [
  {
    "username": "nkop",
    "password": "$2b$10$qMJM9P9PlVcG2jeuETTe4OSVykorJt8Qyqe1Dh1UBi0Z50ae8b8Y6"
  },
  {
    username: 'admin',
    password: '$2b$10$8EEOmy050inyO8yDf48QSuDPqjiMePWG2hHtq9EwN.JXNY/HYIpZS'
  }
]
// Login a user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }


    const user = users.find(user => user.username === username);

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token, user: { username: user.username } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


import { authenticateToken } from '../middleware/auth.js';

// create /verify route to verify JWT token it will be a get route that takes token as bearer token in header
router.get('/verify', authenticateToken, async (req, res) => {
  try {
    const user = users.find(u => u.username === req.user.username);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return the user object, similar to login
    res.json({ user: { username: user.username } });

  } catch (error) {
    res.status(500).json({ message: 'Server error during verification' });
  }
});

export default router;
