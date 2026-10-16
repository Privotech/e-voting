const express = require('express');
const router = express.Router();
const path = require('path');
const auth = require('../middleware/authMiddleware');
const pgService = require('../src/db/pgService');

router.get('/', auth, async (req, res) => {
  try {
    const voter = await pgService.getVoterById(req.voter.id) || await pgService.getVoterByNIN(req.voter.id);
    if (!voter) return res.status(404).json({ message: 'Voter not found in PostgreSQL DB' });
    const { password, ...rest } = voter;
    return res.json(rest);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.post('/validate', async (req, res) => {
  try {
    const { nin, dob, state } = req.body;

    if (!nin || !dob || !state) {
      return res.status(400).json({
        success: false,
        message: 'Please provide NIN, date of birth, and state.'
      });
    }

    const pgRes = await pgService.validateVoter({ nin, dob, state });
    if (!pgRes.success) {
      return res.status(400).json(pgRes);
    }
    return res.json(pgRes);
  } catch (error) {
    console.error('Voter validation error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while validating voter.'
    });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { fullName, nin, dob, state, email, password } = req.body;

    if (!nin || nin.length !== 11) {
      return res.status(400).json({
        success: false,
        message: 'NIN must be exactly 11 digits.'
      });
    }

    if (!fullName || !dob || !state) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields.'
      });
    }

    const existing = await pgService.getVoterByNIN(nin);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'This NIN is already registered.'
      });
    }
    await pgService.registerVoter({
      nin,
      name: fullName,
      dob,
      email: email || `${nin}@evoting.local`,
      password: password || '123456',
      state
    });

    res.json({
      success: true,
      message: 'Registration successful! You can now login to vote.'
    });
  } catch (error) {
    console.error('Register voter error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during registration.'
    });
  }
});

router.get('/status/:nin', async (req, res) => {
  try {
    const { nin } = req.params;
    const voter = await pgService.getVoterByNIN(nin);

    if (!voter) {
      return res.status(404).json({
        success: false,
        message: 'Voter not found in registry.'
      });
    }

    res.json({
      success: true,
      nin: voter.nin,
      hasVoted: voter.hasVoted || false,
      votedAt: voter.votedAt || null,
      receiptToken: voter.receiptToken || null
    });
  } catch (error) {
    console.error('Check voter status error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while checking voter status.'
    });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const voter = await pgService.getVoterById(req.params.id) || await pgService.getVoterByNIN(req.params.id);
    if (!voter) return res.status(404).json({ success: false, message: 'Voter not found' });
    if (!req.voter.isAdmin) return res.status(403).json({ success: false, message: 'Access denied: Not an administrator' });
    const { password, ...rest } = voter;
    return res.json({
      success: true,
      hasVoted: voter.hasVoted,
      votedAt: voter.votedAt,
      voter: rest
    });
  } catch (error) {
    console.error('Get voter status error:', error);
    res.status(500).json({ success: false, message: 'An error occurred while fetching voter status.' });
  }
});

module.exports = router;
