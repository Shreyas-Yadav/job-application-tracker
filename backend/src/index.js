require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initSchema } = require('./db');
const applicationsRouter = require('./routes/applications');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/applications', applicationsRouter);

async function start() {
  try {
    await initSchema();
    app.listen(PORT, () => {
      console.log(`Backend running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start:', err);
    process.exit(1);
  }
}

start();
