// ============================================
// BACKEND - server.js
// ============================================

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'super_secret_key_replace';

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
  ssl: {
    rejectUnauthorized: false
  }
});




// Initialize database tables
const initDB = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
  CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  organization VARCHAR(255),
  role VARCHAR(100),
  carbon_coins INTEGER DEFAULT 0,
  total_contributions INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  data_points_verified INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Correct ALTER TABLE syntax (each ADD COLUMN separate)
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS home_address TEXT;

ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS home_latitude DECIMAL(10, 8);

ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS home_longitude DECIMAL(11, 8);

ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS selected_grid_id INTEGER;

CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  points INTEGER NOT NULL,
  deadline TIMESTAMP,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sensor_data (
  id SERIAL PRIMARY KEY,
  grid_id VARCHAR(50),
  location VARCHAR(255),
  salinity DECIMAL(5,2),
  temperature DECIMAL(5,2),
  soil_ph DECIMAL(3,1),
  water_level DECIMAL(5,2),
  survival_rate DECIMAL(5,2),
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ph_trends (
  id SERIAL PRIMARY KEY,
  grid_id VARCHAR(50),
  month VARCHAR(20),
  ph_value DECIMAL(3,1),
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tree_height (
  id SERIAL PRIMARY KEY,
  grid_id VARCHAR(50),
  month VARCHAR(20),
  height_cm INTEGER,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS carbon_sequestration (
  id SERIAL PRIMARY KEY,
  grid_id VARCHAR(50),
  month VARCHAR(20),
  carbon_kg DECIMAL(10,2),
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  activity_text TEXT NOT NULL,
  activity_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS grids (
  id SERIAL PRIMARY KEY,
  grid_id VARCHAR(50) UNIQUE,
  geometry JSONB
);

    `);
    console.log('Database tables initialized');
  } catch (err) {
    console.error('Database initialization error:', err);
  } finally {
    client.release();
  }
};

initDB();

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// ============================================
// AUTHENTICATION ROUTES
// ============================================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, organization, role } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    // Check if user exists
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (name, email, password, organization, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, organization, role, carbon_coins',
      [name, email, hashedPassword, organization || '', role || 'Contributor']
    );

    const user = result.rows[0];

    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        organization: user.organization,
        role: user.role,
        carbonCoins: user.carbon_coins
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        organization: user.organization,
        role: user.role,
        carbonCoins: user.carbon_coins,
        totalContributions: user.total_contributions,
        tasksCompleted: user.tasks_completed,
        dataPointsVerified: user.data_points_verified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// USER ROUTES
// ============================================
// Save home location
// Update user location
app.post('/api/user/update-location', authenticateToken, async (req, res) => {
  try {
    const { address, latitude, longitude } = req.body;

    await pool.query(
      `UPDATE users 
       SET home_address=$1, home_latitude=$2, home_longitude=$3
       WHERE id=$4`,
      [address, latitude, longitude, req.user.id]
    );

    res.json({ message: 'Location updated successfully' });
  } catch (err) {
    console.error('Location update error:', err);
    res.status(500).json({ error: 'Failed to update location' });
  }
});
  // Select grid
app.post('/api/user/select-grid', authenticateToken, async (req, res) => {
  try {
    const { gridId } = req.body;

    await pool.query(
      `UPDATE users SET selected_grid_id=$1 WHERE id=$2`,
      [gridId, req.user.id]
    );

    res.json({ message: 'Grid selection saved' });
  } catch (err) {
    console.error('Select grid error:', err);
    res.status(500).json({ error: 'Failed to select grid' });
  }
});


// Get user profile
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
      id,
      name,
      email,
      organization,
      role,
      carbon_coins,
      total_contributions,
      tasks_completed,
      data_points_verified,
      home_address,
      home_latitude AS home_lat,
      home_longitude AS home_lng,
      selected_grid_id
      FROM users 
      WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    
    // Get user rank
    const rankResult = await pool.query(
      'SELECT COUNT(*) + 1 as rank FROM users WHERE carbon_coins > (SELECT carbon_coins FROM users WHERE id = $1)',
      [req.user.id]
    );

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      organization: user.organization,
      role: user.role,
      carbonCoins: user.carbon_coins,
      totalContributions: user.total_contributions,
      tasksCompleted: user.tasks_completed,
      dataPointsVerified: user.data_points_verified,
      rank: parseInt(rankResult.rows[0].rank)
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user activities
app.get('/api/user/activities', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT activity_text, activity_type, created_at FROM activities WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
      [req.user.id]
    );

    const activities = result.rows.map(activity => ({
      text: activity.activity_text,
      type: activity.activity_type,
      time: getTimeAgo(new Date(activity.created_at))
    }));

    res.json(activities);
  } catch (error) {
    console.error('Activities error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// DASHBOARD ROUTES
// ============================================

// Get latest sensor data
app.get('/api/dashboard/sensor-data', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM sensor_data ORDER BY recorded_at DESC LIMIT 1'
    );

    if (result.rows.length === 0) {
      return res.json({
        gridId: 'BC-2024-001',
        location: 'Sundarbans Delta',
        salinity: '12 ppt',
        temperature: '28°C',
        soilPh: '6.8',
        waterLevel: '1.2m',
        survivalRate: 94
      });
    }

    const data = result.rows[0];
    res.json({
      gridId: data.grid_id,
      location: data.location,
      salinity: `${data.salinity} ppt`,
      temperature: `${data.temperature}°C`,
      soilPh: data.soil_ph.toString(),
      waterLevel: `${data.water_level}m`,
      survivalRate: parseFloat(data.survival_rate)
    });
  } catch (error) {
    console.error('Sensor data error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get pH trends
app.get('/api/dashboard/ph-trends', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT month, ph_value FROM ph_trends ORDER BY id ASC LIMIT 6'
    );

    if (result.rows.length === 0) {
      return res.json({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        data: [6.5, 6.6, 6.7, 6.8, 6.8, 6.9]
      });
    }

    res.json({
      labels: result.rows.map(row => row.month),
      data: result.rows.map(row => parseFloat(row.ph_value))
    });
  } catch (error) {
    console.error('pH trends error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get tree height data
app.get('/api/dashboard/tree-height', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT month, height_cm FROM tree_height ORDER BY id ASC LIMIT 6'
    );

    if (result.rows.length === 0) {
      return res.json({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        data: [45, 52, 61, 68, 75, 83]
      });
    }

    res.json({
      labels: result.rows.map(row => row.month),
      data: result.rows.map(row => row.height_cm)
    });
  } catch (error) {
    console.error('Tree height error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get carbon sequestration data
app.get('/api/dashboard/carbon-sequestration', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT month, carbon_kg FROM carbon_sequestration ORDER BY id ASC LIMIT 6'
    );

    if (result.rows.length === 0) {
      return res.json({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        data: [120, 145, 178, 205, 242, 280]
      });
    }

    res.json({
      labels: result.rows.map(row => row.month),
      data: result.rows.map(row => parseFloat(row.carbon_kg))
    });
  } catch (error) {
    console.error('Carbon sequestration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// TASKS ROUTES
// ============================================

// Get user tasks
app.get('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tasks WHERE user_id = $1 ORDER BY completed ASC, deadline ASC',
      [req.user.id]
    );

    const tasks = result.rows.map(task => ({
      id: task.id,
      title: task.title,
      points: task.points,
      deadline: getDeadlineText(new Date(task.deadline)),
      completed: task.completed
    }));

    const pending = tasks.filter(t => !t.completed);
    const completed = tasks.filter(t => t.completed);

    res.json({ pending, completed });
  } catch (error) {
    console.error('Tasks error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Complete task
app.post('/api/tasks/:id/complete', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const taskResult = await pool.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = taskResult.rows[0];

    if (task.completed) {
      return res.status(400).json({ error: 'Task already completed' });
    }

    await pool.query(
      'UPDATE tasks SET completed = TRUE, completed_at = NOW() WHERE id = $1',
      [id]
    );

    await pool.query(
      'UPDATE users SET carbon_coins = carbon_coins + $1, tasks_completed = tasks_completed + 1, total_contributions = total_contributions + 1 WHERE id = $2',
      [task.points, req.user.id]
    );

    await pool.query(
      'INSERT INTO activities (user_id, activity_text, activity_type) VALUES ($1, $2, $3)',
      [req.user.id, `Completed task: ${task.title}`, 'task_completion']
    );

    res.json({ message: 'Task completed successfully' });
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// LEADERBOARD ROUTES
// ============================================

// Get leaderboard
app.get('/api/leaderboard', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, carbon_coins, ROW_NUMBER() OVER (ORDER BY carbon_coins DESC) as rank FROM users ORDER BY carbon_coins DESC LIMIT 20'
    );

    const leaderboard = result.rows.map(user => ({
      rank: parseInt(user.rank),
      name: user.name,
      points: user.carbon_coins,
      isCurrentUser: user.id === req.user.id
    }));

    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/grids', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, grid_id, geometry FROM grids ORDER BY id ASC'
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Grids error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
// Calculate distance
app.post('/api/grids/calculate-distance', authenticateToken, async (req, res) => {
  try {
    const { gridId } = req.body;

    const grid = await pool.query(
      'SELECT geometry FROM grids WHERE grid_id=$1',
      [gridId]
    );

    const user = await pool.query(
      'SELECT home_latitude, home_longitude FROM users WHERE id=$1',
      [req.user.id]
    );

    if (!grid.rows.length || !user.rows.length) {
      return res.status(400).json({ error: 'User or grid missing' });
    }

    const coords = grid.rows[0].geometry?.coordinates?.[0]?.[0];
    if (!coords) return res.status(400).json({ error: 'Invalid grid geometry' });

    const gridLng = coords[0];
    const gridLat = coords[1];

    const { home_latitude: lat1, home_longitude: lon1 } = user.rows[0];

    // Haversine Formula
    const R = 6371;
    const dLat = (gridLat - lat1) * (Math.PI / 180);
    const dLon = (gridLng - lon1) * (Math.PI / 180);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(gridLat * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;

    const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    res.json({ distance });
  } catch (err) {
    console.error('Distance calculation error:', err);
    res.status(500).json({ error: 'Failed to calculate distance' });
  }
});


// ============================================
// UTILITY FUNCTIONS
// ============================================

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
}

function getDeadlineText(deadline) {
  const now = new Date();
  const diff = deadline - now;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days < 0) return `${Math.abs(days)} days ago`;
  if (days === 0) return 'today';
  if (days === 1) return '1 day left';
  if (days < 7) return `${days} days left`;
  return `${Math.floor(days / 7)} week${days >= 14 ? 's' : ''} left`;
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

