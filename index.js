const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not set in the environment variables');
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  retryWrites: true,
  w: 'majority'
})
.then(() => console.log('MongoDB connected to sample_mflix'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Admin routes
app.get('/admin/engagements', async (req, res) => {
  try {
    // TODO: Fetch engagements from the database
    const engagements = []; // This should be replaced with actual data from your database
    res.json(engagements);
  } catch (error) {
    console.error('Error fetching engagements:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/admin/experts', async (req, res) => {
  try {
    // TODO: Fetch experts from the database
    const experts = []; // This should be replaced with actual data from your database
    res.json(experts);
  } catch (error) {
    console.error('Error fetching experts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Expert Engagement Reservation System API' });
});

app.get('/test', (req, res) => {
  res.json({ message: 'Test route working' });
});

app.post('/api/engagement-requests', async (req, res) => {
  try {
    console.log('Received data:', req.body);
    // TODO: Process the data, save to database, etc.
    res.status(201).json({ message: 'Engagement request received successfully' });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
