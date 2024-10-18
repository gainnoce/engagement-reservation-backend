const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Add this line to import the EngagementRequest model
const EngagementRequest = require('./EngagementRequest');

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
  writeConcern: {
    w: 'majority',
    j: true,
    wtimeout: 1000
  }
})
.then(() => console.log('MongoDB connected to', mongoose.connection.name))
.catch(err => console.error('MongoDB connection error:', err));

// Admin routes
app.get('/admin/engagements', async (req, res) => {
  try {
    const engagements = await EngagementRequest.find();
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

app.get('/api/all-engagement-requests', async (req, res) => {
  try {
    const requests = await EngagementRequest.find();
    console.log('Retrieved all engagement requests:', requests);
    res.json(requests);
  } catch (error) {
    console.error('Error retrieving engagement requests:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/engagement-requests', async (req, res) => {
  try {
    console.log('Received engagement request:', req.body);
    const request = new EngagementRequest(req.body);
    console.log('Attempting to save request to database...');
    const newRequest = await request.save();
    console.log('Request saved successfully:', newRequest);
    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
