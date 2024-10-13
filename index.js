const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
