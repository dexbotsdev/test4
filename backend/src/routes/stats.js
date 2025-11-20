const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');


console.log('Resolved DATA_PATH:', DATA_PATH);


let cachedStats = null;

function calculateStats(callback) {
  fs.readFile(DATA_PATH, (err, raw) => {
    if (err) return callback(err);

    const items = JSON.parse(raw);
    // Intentional heavy CPU calculation
    const stats = {
      total: items.length,
      averagePrice: items.reduce((acc, cur) => acc + cur.price, 0) / items.length
    };

    cachedStats = stats;
    if (callback) callback(null, stats);
  });
}

// Initial calculation
calculateStats(err => {
  if (err) {
    console.error('Error calculating initial stats:', err);
  }
});

// Watch for file changes
fs.watchFile(DATA_PATH, (curr, prev) => {
  if (curr.mtime !== prev.mtime) {
    console.log('Data file changed, recalculating stats...');
    calculateStats(err => {
      if (err) {
        console.error('Error recalculating stats:', err);
      }
    });
  }
});

// GET /api/stats
router.get('/', (req, res, next) => {
  if (cachedStats) {
    return res.json(cachedStats);
  }
  // Fallback for initial calculation
  calculateStats((err, stats) => {
    if (err) return next(err);
    res.json(stats);
  });
});

module.exports = router;