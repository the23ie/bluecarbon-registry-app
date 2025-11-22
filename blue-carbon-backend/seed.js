// ============================================
// seed.js - Database Seeding Script
// ============================================

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
});

async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('Starting database seeding...');

    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = [
      { name: 'Sarah Chen', email: 'sarah@example.com', password: hashedPassword, organization: 'Ocean Conservancy', role: 'Lead Researcher', points: 2450 },
      { name: 'Michael Torres', email: 'michael@example.com', password: hashedPassword, organization: 'Blue Carbon Initiative', role: 'Field Officer', points: 2180 },
      { name: 'Priya Sharma', email: 'priya@example.com', password: hashedPassword, organization: 'Coastal Protection Agency', role: 'Data Analyst', points: 1920 },
      { name: 'James Wilson', email: 'james@example.com', password: hashedPassword, organization: 'Marine Institute', role: 'Verifier', points: 1650 },
      { name: 'Emma Rodriguez', email: 'emma@example.com', password: hashedPassword, organization: 'Carbon Registry', role: 'Coordinator', points: 1180 },
      { name: 'Alex Kim', email: 'alex@example.com', password: hashedPassword, organization: 'Environmental Trust', role: 'Researcher', points: 980 },
    ];

    console.log('Creating users...');
    for (const user of users) {
      await client.query(
        `INSERT INTO users (name, email, password, organization, role, carbon_coins, total_contributions, tasks_completed, data_points_verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (email) DO NOTHING`,
        [user.name, user.email, user.password, user.organization, user.role, user.points, 
         Math.floor(user.points / 25), Math.floor(user.points / 50), Math.floor(user.points / 10)]
      );
    }

    // Get user IDs
    const userResult = await client.query('SELECT id, name FROM users ORDER BY carbon_coins DESC');
    const userIds = userResult.rows;

    // Seed sensor data
    console.log('Seeding sensor data...');
    await client.query(`
      INSERT INTO sensor_data (grid_id, location, salinity, temperature, soil_ph, water_level, survival_rate)
      VALUES 
        ('BC-2024-001', 'Sundarbans Delta', 12.5, 28.3, 6.8, 1.2, 94.0),
        ('BC-2024-002', 'Mekong Delta', 11.8, 29.1, 6.9, 1.5, 91.5),
        ('BC-2024-003', 'Amazon Delta', 10.2, 27.8, 7.1, 1.8, 96.2)
      ON CONFLICT DO NOTHING
    `);

    // Seed pH trends
    console.log('Seeding pH trends...');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const phValues = [6.5, 6.6, 6.7, 6.8, 6.8, 6.9];
    
    for (let i = 0; i < months.length; i++) {
      await client.query(
        `INSERT INTO ph_trends (grid_id, month, ph_value)
         VALUES ($1, $2, $3)`,
        ['BC-2024-001', months[i], phValues[i]]
      );
    }

    // Seed tree height data
    console.log('Seeding tree height data...');
    const heights = [45, 52, 61, 68, 75, 83];
    
    for (let i = 0; i < months.length; i++) {
      await client.query(
        `INSERT INTO tree_height (grid_id, month, height_cm)
         VALUES ($1, $2, $3)`,
        ['BC-2024-001', months[i], heights[i]]
      );
    }

    // Seed carbon sequestration data
    console.log('Seeding carbon sequestration data...');
    const carbonValues = [120, 145, 178, 205, 242, 280];
    
    for (let i = 0; i < months.length; i++) {
      await client.query(
        `INSERT INTO carbon_sequestration (grid_id, month, carbon_kg)
         VALUES ($1, $2, $3)`,
        ['BC-2024-001', months[i], carbonValues[i]]
      );
    }

    // Seed tasks for each user
    console.log('Seeding tasks...');
    const taskTemplates = [
      { title: 'Upload sensor logs', points: 50, days: 2 },
      { title: 'Verify data points', points: 75, days: 5 },
      { title: 'Field data collection', points: 100, days: 7 },
      { title: 'Manual tree count verification', points: 80, days: 3 },
      { title: 'Water quality testing', points: 90, days: 4 },
      { title: 'Drone imagery upload', points: 150, days: 10 },
    ];

    for (const user of userIds) {
      // Add 3 pending tasks
      for (let i = 0; i < 3; i++) {
        const task = taskTemplates[i];
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + task.days);
        
        await client.query(
          `INSERT INTO tasks (user_id, title, points, deadline, completed)
           VALUES ($1, $2, $3, $4, $5)`,
          [user.id, task.title, task.points, deadline, false]
        );
      }

      // Add 2 completed tasks
      for (let i = 3; i < 5; i++) {
        const task = taskTemplates[i];
        const completedDate = new Date();
        completedDate.setDate(completedDate.getDate() - (7 - i));
        
        await client.query(
          `INSERT INTO tasks (user_id, title, points, deadline, completed, completed_at)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [user.id, task.title, task.points, completedDate, true, completedDate]
        );
      }
    }

    // Seed activities
    console.log('Seeding activities...');
    const activities = [
      { text: 'Completed field data collection', type: 'task_completion', hoursAgo: 2 },
      { text: 'Verified 15 data points', type: 'verification', hoursAgo: 24 },
      { text: 'Uploaded sensor logs', type: 'upload', hoursAgo: 48 },
    ];

    for (const user of userIds) {
      for (const activity of activities) {
        const createdAt = new Date();
        createdAt.setHours(createdAt.getHours() - activity.hoursAgo);
        
        await client.query(
          `INSERT INTO activities (user_id, activity_text, activity_type, created_at)
           VALUES ($1, $2, $3, $4)`,
          [user.id, activity.text, activity.type, createdAt]
        );
      }
    }

    console.log('Database seeding completed successfully!');
    console.log('\nSample user credentials:');
    console.log('Email: sarah@example.com | Password: password123');
    console.log('Email: michael@example.com | Password: password123');
    console.log('\nAll users have the same password: password123');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

seedDatabase();

