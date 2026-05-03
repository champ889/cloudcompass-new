const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();
const filePath = path.join(__dirname, '../data/networking.json');

router.get('/', async (req, res) => {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(data);
    const { category } = req.query;
    if (category && parsed.categories[category]) {
      return res.json({ [category]: parsed.categories[category] });
    }
    res.json(parsed);
  } catch (err) {
    if (err.code === 'ENOENT') return res.status(404).json({ error: 'Networking data not found' });
    console.error('Error reading networking data:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
