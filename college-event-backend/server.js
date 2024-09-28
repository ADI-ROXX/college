// server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOADS_FOLDER || 'uploads')));

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });

// Routes
const eventsRouter = require('./routes/events');
const billsRouter = require('./routes/bills');

// Mount routers
app.use('/api/events', eventsRouter);
app.use('/api/events/:eventName/bills', billsRouter);

app.delete('/api/delete/:eventName', async (req, res) => {
  const { eventName } = req.params;

  try {
    const collections = await db.listCollections({}, { nameOnly: true }).toArray();
    const collectionNames = collections.map(col => col.name);

    if (!collectionNames.includes(eventName)) {
      return res.status(404).json({ msg: 'Event not found.' });
    }

    await db.collection(eventName).drop();

    res.status(200).json({ msg: `Event '${eventName}' deleted successfully.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Internal server error.' });
  }
});



// Root Endpoint
app.get('/', (req, res) => {
  res.send('College Events App Backend is running.');
});

app.get('/status', (req, res) => {
  res.status(200).json({ status: 'OK' });
});
// Start the server
const PORT = process.env.PORT || 5080;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
