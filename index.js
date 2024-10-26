const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const EngagementRequest = require('./EngagementRequest');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
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
.then(() => {
  console.log('MongoDB connected to', mongoose.connection.name);
  console.log('Connected to database:', mongoose.connection.db.databaseName);
})
.catch(err => console.error('MongoDB connection error:', err));

// Debug logging middleware
app.use((req, res, next) => {
  console.log('Request received:', {
    method: req.method,
    path: req.url,
    body: req.body
  });
  next();
});

// Welcome route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to the Expert Engagement Reservation System API',
    endpoints: {
      test: '/api/test',
      engagements: '/api/engagement-requests'
    }
  });
});

// Test route - moved under /api prefix
app.get('/api/test', (req, res) => {
  res.json({ message: 'API Test route working' });
});

// Routes for engagement requests
app.get('/api/engagement-requests', async (req, res) => {
  try {
    console.log('Fetching engagement requests...');
    const requests = await EngagementRequest.find();
    console.log('Number of requests found:', requests.length);
    res.json(requests);
  } catch (error) {
    console.error('Error retrieving engagement requests:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

app.get('/api/engagement-requests/:id', async (req, res) => {
  try {
    console.log('Fetching engagement request:', req.params.id);
    const request = await EngagementRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Engagement request not found' });
    }
    res.json(request);
  } catch (error) {
    console.error('Error retrieving engagement request:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

app.post('/api/engagement-requests', async (req, res) => {
  try {
    console.log('Received engagement request:', req.body);
    const request = new EngagementRequest(req.body);
    const newRequest = await request.save();
    console.log('Request saved successfully. ID:', newRequest._id);
    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

app.put('/api/engagement-requests/:id', async (req, res) => {
  try {
    console.log('Update request received for ID:', req.params.id);
    console.log('Update data:', req.body);

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid engagement ID format' });
    }

    const updatedRequest = await EngagementRequest.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: 'Engagement request not found' });
    }

    console.log('Update successful:', updatedRequest);
    res.json(updatedRequest);
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Admin routes
app.get('/api/admin/engagements', async (req, res) => {
  try {
    const engagements = await EngagementRequest.find();
    res.json(engagements);
  } catch (error) {
    console.error('Error fetching engagements:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Error handler for unmatched routes
app.use((req, res) => {
  console.log('404 - Route not found:', req.method, req.url);
  res.status(404).json({
    error: 'Route not found',
    method: req.method,
    url: req.url
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Available routes:');
  console.log('- GET  /');
  console.log('- GET  /api/test');
  console.log('- GET  /api/engagement-requests');
  console.log('- POST /api/engagement-requests');
  console.log('- GET  /api/engagement-requests/:id');
  console.log('- PUT  /api/engagement-requests/:id');
});
