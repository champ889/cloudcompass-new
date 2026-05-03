require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const networkingRouter = require('./routes/networking');
const kubernetesRouter = require('./routes/kubernetes');

const app = express();
const PORT = process.env.PORT || 5001;
const isProd = process.env.NODE_ENV === 'production';

// Middleware
if (!isProd) app.use(cors());
app.use(express.json());
app.use('/icons', express.static(path.join(__dirname, 'icons')));

// API routes
app.use('/api/networking', networkingRouter);
app.use('/api/kubernetes', kubernetesRouter);

// Frontend serving
const frontendDist = isProd
  ? path.join(__dirname, '../frontend/dist')
  : path.join(__dirname, '../frontend');

const frontendIndex = isProd
  ? path.join(__dirname, '../frontend/dist/index.html')
  : path.join(__dirname, '../frontend/index.html');

app.use(express.static(frontendDist));

app.use((req, res) => {
  res.sendFile(frontendIndex);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} [${isProd ? 'production' : 'development'}]`);
});
