import express from 'express'
import cors from 'cors'
import compression from 'compression'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import sqlite3 from 'sqlite3'
import nodemailer from 'nodemailer'
import { v4 as uuidv4 } from 'uuid'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const JWT_SECRET = process.env.JWT_SECRET || 'nexus_spectacle_secret_key'
const __dirname = dirname(fileURLToPath(import.meta.url))

// Middleware
app.use(cors())
// Phase 13: Compression for smaller API responses
app.use(compression())
app.use(express.json())

// Serve static files from the React app build folder (for production)
const clientBuildPath = join(__dirname, '..', 'dist')
app.use(express.static(clientBuildPath, {
  maxAge: '1y',
  immutable: true,
  setHeaders: (res, path) => {
    // Cache videos for 1 year
    if (path.match(/\.(mp4|webm|ogg)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
      res.setHeader('Accept-Ranges', 'bytes')
    }
    // Cache images for 1 year
    if (path.match(/\.(jpg|jpeg|png|gif|svg|webp|ico)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    }
    // Cache JS/CSS for 1 year (hashed filenames)
    if (path.match(/\.(js|css)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    }
  }
}))

// Initialize SQLite database
const db = new sqlite3.Database('./nexus.db', (err) => {
  if (err) {
    console.error('Error opening database:', err)
  } else {
    console.log('Connected to SQLite database')
  }
})

// Create tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    provider TEXT DEFAULT 'email',
    provider_id TEXT,
    email_verified INTEGER DEFAULT 0,
    verification_token TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)

  // Preorders table
  db.run(`CREATE TABLE IF NOT EXISTS preorders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    variant_id TEXT NOT NULL,
    variant_name TEXT NOT NULL,
    price TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`)

  // Visitor tracking table
  db.run(`CREATE TABLE IF NOT EXISTS visitors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    variant_id TEXT,
    visited_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)

  // Magic links table
  db.run(`CREATE TABLE IF NOT EXISTS magic_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    used INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)
})

// Email transporter (configure with your email service)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'your_email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your_password'
  }
})

// Helper function to send emails
const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER || 'NEXUS <noreply@nexus.com>',
      to,
      subject,
      html
    })
    console.log('Email sent:', info.messageId)
    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

// ============ AUTHENTICATION ROUTES ============

// Register with email/password
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' })
    }

    // Check if user exists
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }
      if (row) {
        return res.status(400).json({ error: 'User already exists. Please login.' })
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)
      const verificationToken = uuidv4()

      // Insert user
      db.run(
        'INSERT INTO users (name, email, password, verification_token) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, verificationToken],
        async function(err) {
          if (err) {
            return res.status(500).json({ error: 'Error creating user' })
          }

          // Send verification email
          const verificationLink = `http://${req.get('host')}/api/auth/verify/${verificationToken}`
          const emailSent = await sendEmail(
            email,
            'Verify your NEXUS account',
            `<h1>Welcome to NEXUS</h1><p>Click <a href="${verificationLink}">here</a> to verify your email.</p>`
          )

          // Generate JWT
          const token = jwt.sign(
            { userId: this.lastID, email },
            JWT_SECRET,
            { expiresIn: '7d' }
          )

          res.status(201).json({
            message: 'User created successfully',
            token,
            user: { id: this.lastID, name, email, email_verified: 0 }
          })
        }
      )
    })
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

// Login with email/password
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    db.get(
      'SELECT id, name, email, password, email_verified FROM users WHERE email = ?',
      [email],
      (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' })
        }
        if (!row) {
          return res.status(401).json({ error: 'Invalid credentials' })
        }

        // Verify password
        bcrypt.compare(password, row.password, (err, isMatch) => {
          if (err || !isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' })
          }

          // Generate JWT
          const token = jwt.sign(
            { userId: row.id, email: row.email },
            JWT_SECRET,
            { expiresIn: '7d' }
          )

          res.json({
            message: 'Login successful',
            token,
            user: {
              id: row.id,
              name: row.name,
              email: row.email,
              email_verified: row.email_verified
            }
          })
        })
      }
    )
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

// Social login (Google/Facebook)
app.post('/api/auth/social', (req, res) => {
  try {
    const { name, email, provider, provider_id } = req.body

    if (!email || !provider || !provider_id) {
      return res.status(400).json({ error: 'Email, provider, and provider_id are required' })
    }

    // Check if user exists
    db.get(
      'SELECT id, name, email, email_verified FROM users WHERE email = ? AND provider = ?',
      [email, provider],
      (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' })
        }

        let userId
        let userName = name

        if (row) {
          // User exists
          userId = row.id
          userName = row.name
        } else {
          // Create new user
          db.run(
            'INSERT INTO users (name, email, provider, provider_id, email_verified) VALUES (?, ?, ?, ?, ?)',
            [name, email, provider, provider_id, 1],
            function(err) {
              if (err) {
                return res.status(500).json({ error: 'Error creating user' })
              }
              userId = this.lastID
            }
          )
        }

        // Generate JWT
        const token = jwt.sign(
          { userId, email },
          JWT_SECRET,
          { expiresIn: '7d' }
        )

        res.json({
          message: 'Social login successful',
          token,
          user: { id: userId, name: userName, email, email_verified: 1 }
        })
      }
    )
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

// Request magic link
app.post('/api/auth/magic-link', async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }

    const token = uuidv4()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Save magic link
    db.run(
      'INSERT INTO magic_links (email, token, expires_at) VALUES (?, ?, ?)',
      [email, token, expiresAt.toISOString()],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Error creating magic link' })
        }

        // Send magic link email
        const magicLink = `http://${req.get('host')}/api/auth/verify-magic/${token}`
        const emailSent = sendEmail(
          email,
          'Your NEXUS Magic Link',
          `<h1>Sign in to NEXUS</h1><p>Click <a href="${magicLink}">here</a> to sign in. This link expires in 15 minutes.</p>`
        )

        res.json({
          message: 'Magic link sent to your email',
          email
        })
      }
    )
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

// Verify magic link
app.get('/api/auth/verify-magic/:token', (req, res) => {
  const { token } = req.params

  db.get(
    'SELECT email, expires_at, used FROM magic_links WHERE token = ?',
    [token],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }
      if (!row) {
        return res.status(400).json({ error: 'Invalid magic link' })
      }
      if (row.used) {
        return res.status(400).json({ error: 'Magic link already used' })
      }
      if (new Date(row.expires_at) < new Date()) {
        return res.status(400).json({ error: 'Magic link expired' })
      }

      // Mark as used
      db.run('UPDATE magic_links SET used = 1 WHERE token = ?', [token])

      // Check if user exists
      db.get(
        'SELECT id, name, email FROM users WHERE email = ?',
        [row.email],
        (err, user) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' })
          }

          let userId
          let userName

          if (user) {
            userId = user.id
            userName = user.name
          } else {
            // Create user if not exists
            db.run(
              'INSERT INTO users (name, email, email_verified) VALUES (?, ?, ?)',
              [row.email.split('@')[0], row.email, 1],
              function(err) {
                if (err) {
                  return res.status(500).json({ error: 'Error creating user' })
                }
                userId = this.lastID
                userName = row.email.split('@')[0]
              }
            )
          }

          // Generate JWT
          const jwtToken = jwt.sign(
            { userId, email: row.email },
            JWT_SECRET,
            { expiresIn: '7d' }
          )

          res.json({
            message: 'Magic link verified',
            token: jwtToken,
            user: { id: userId, name: userName, email: row.email, email_verified: 1 }
          })
        }
      )
    }
  )
})

// Verify email
app.get('/api/auth/verify/:token', (req, res) => {
  const { token } = req.params

  db.get(
    'SELECT id FROM users WHERE verification_token = ?',
    [token],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }
      if (!row) {
        return res.status(400).json({ error: 'Invalid verification token' })
      }

      db.run(
        'UPDATE users SET email_verified = 1, verification_token = NULL WHERE id = ?',
        [row.id],
        (err) => {
          if (err) {
            return res.status(500).json({ error: 'Error verifying email' })
          }
          res.json({ message: 'Email verified successfully' })
        }
      )
    }
  )
})

// ============ PREORDER ROUTES ============

// Create preorder
app.post('/api/preorders', authenticateToken, (req, res) => {
  try {
    const { variant_id, variant_name, price } = req.body
    const userId = req.user.userId

    if (!variant_id || !variant_name || !price) {
      return res.status(400).json({ error: 'Variant details are required' })
    }

    db.run(
      'INSERT INTO preorders (user_id, variant_id, variant_name, price) VALUES (?, ?, ?, ?)',
      [userId, variant_id, variant_name, price],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Error creating preorder' })
        }
        res.status(201).json({
          message: 'Preorder created successfully',
          preorder_id: this.lastID
        })
      }
    )
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

// Get user preorders
app.get('/api/preorders', authenticateToken, (req, res) => {
  const userId = req.user.userId

  db.all(
    'SELECT * FROM preorders WHERE user_id = ? ORDER BY created_at DESC',
    [userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }
      res.json({ preorders: rows })
    }
  )
})

// ============ VISITOR TRACKING ============

// Track visitor
app.post('/api/visitors', (req, res) => {
  try {
    const { name, email, variant_id } = req.body

    db.run(
      'INSERT INTO visitors (name, email, variant_id) VALUES (?, ?, ?)',
      [name || null, email || null, variant_id || null],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' })
        }
        res.status(201).json({ message: 'Visitor tracked', id: this.lastID })
      }
    )
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

// Get all visitors (for admin)
app.get('/api/visitors', (req, res) => {
  db.all(
    'SELECT * FROM visitors ORDER BY visited_at DESC',
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }
      res.json({ visitors: rows })
    }
  )
})

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' })
    }
    req.user = user
    next()
  })
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'NEXUS API is running' })
})

// Serve React app for all other routes (for production)
app.get('*', (req, res) => {
  res.sendFile(join(clientBuildPath, 'index.html'))
})

// Start server
app.listen(PORT, () => {
  console.log(`NEXUS API server running on port ${PORT}`)
  console.log(`Serving frontend from: ${clientBuildPath}`)
})
