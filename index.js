const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Expert Engagement Reservation System API' });
});

app.post('/api/engagement-requests', async (req, res) => {
  try {
    console.log('Received data:', req.body);
    // Process the data, save to database, etc.
    res.status(201).json({ message: 'Engagement request received successfully' });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
