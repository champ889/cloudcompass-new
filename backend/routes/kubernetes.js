const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();
const filePath = path.join(__dirname, '../data/kubernetes.json');

router.get('/', async (req, res) => {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    if (err.code === 'ENOENT') return res.status(404).json({ error: 'Kubernetes data not found' });
    console.error('Error reading kubernetes data:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
