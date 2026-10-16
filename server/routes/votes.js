const express = require('express');
const router = express.Router();
const pgService = require('../src/db/pgService');

router.post('/', async (req, res) => {
  const { voterNIN, selections } = req.body;

  if (!voterNIN || !selections) {
    return res.status(400).json({
      success: false,
      message: 'Please provide voter NIN and selections.'
    });
  }

  const pgRes = await pgService.castBallot({ voterNIN, selections });
  if (!pgRes.success) {
    return res.status(400).json(pgRes);
  }
  return res.json(pgRes);
});

router.get('/receipt/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const vote = await pgService.getVoteByReceiptToken(token);
    if (!vote) {
      return res.status(404).json({ success: false, message: 'Vote receipt token not found in PostgreSQL DB.' });
    }
    return res.json({
      success: true,
      vote: {
        selections: {
          president: vote.president,
          governor: vote.governor,
          senator: vote.senator,
          houseOfReps: vote.houseOfReps
        },
        timestamp: vote.timestamp
      }
    });
  } catch (error) {
    console.error('Get vote by receipt error:', error);
    res.status(500).json({ success: false, message: 'An error occurred while fetching vote.' });
  }
});

module.exports = router;
