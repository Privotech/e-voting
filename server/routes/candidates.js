const express = require('express');
const router = express.Router();
const pgService = require('../src/db/pgService');

router.get('/', async (req, res) => {
  try {
    const candidates = await pgService.getCandidates();
    return res.json({ success: true, candidates });
  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching candidates.'
    });
  }
});

router.get('/position/:position', async (req, res) => {
  try {
    const { position } = req.params;
    const candidates = await pgService.getCandidates(position);
    return res.json({ success: true, candidates });
  } catch (error) {
    console.error('Get candidates by position error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching candidates.'
    });
  }
});

router.post('/initialize', async (req, res) => {
  try {
    const candidates = req.body.candidates || [];
    if (!candidates.length) {
      return res.status(400).json({ success: false, message: 'No candidates provided.' });
    }
    await pgService.initializeCandidates(candidates);
    return res.status(201).json({
      success: true,
      message: 'Candidates initialized successfully'
    });
  } catch (error) {
    console.error('Initialize candidates error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while initializing candidates.'
    });
  }
});

module.exports = router;
