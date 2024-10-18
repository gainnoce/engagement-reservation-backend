const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const EngagementRequest = require('./EngagementRequest');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not set in the environment variables');
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  writeConcern: {
    w: 'majority',
    j: true,
    wtimeout: 1000
  }
})
.then(() => console.log('MongoDB connected to', mongoose.connection.name))
.catch(err => console.error('MongoDB connection error:', err));

// Welcome route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Expert Engagement Reservation System API' });
});

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Test route working' });
});

// Get all engagement requests
app.get('/api/engagement-requests', async (req, res) => {
  try {
    const requests = await EngagementRequest.find();
    console.log('Retrieved all engagement requests:', requests);
    res.json(requests);
  } catch (error) {
    console.error('Error retrieving engagement requests:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Create a new engagement request
app.post('/api/engagement-requests', async (req, res) => {
  try {
    console.log('Received engagement request:', JSON.stringify(req.body, null, 2));
    const request = new EngagementRequest(req.body);
    console.log('Attempting to save request to database...');
    const newRequest = await request.save();
    console.log('Request saved successfully:', JSON.stringify(newRequest, null, 2));
    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error processing request:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Internal server error', error: error.message, stack: error.stack });
  }
});

// Admin routes
app.get('/admin/engagements', async (req, res) => {
  try {
    const engagements = await EngagementRequest.find();
    res.json(engagements);
  } catch (error) {
    console.error('Error fetching engagements:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

app.get('/admin/experts', async (req, res) => {
  try {
    // TODO: Implement fetching experts from the database
    const experts = []; // Replace with actual data from your database
    res.json(experts);
  } catch (error) {
    console.error('Error fetching experts:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
