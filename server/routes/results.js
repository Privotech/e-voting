const express = require('express');
const router = express.Router();
const pgService = require('../src/db/pgService');
const store = require('../store');

router.post('/toggle-visibility', (req, res) => {
  store.resultsVisible = !store.resultsVisible;
  res.json({ success: true, visible: store.resultsVisible });
});

router.post('/set-visibility', (req, res) => {
  const { visible } = req.body;
  if (typeof visible !== 'boolean') {
    return res.status(400).json({ success: false, message: 'Please provide a boolean value for visibility.' });
  }
  store.resultsVisible = visible;
  res.json({ success: true, visible: store.resultsVisible });
});

router.get('/visibility', (req, res) => {
  res.json({ success: true, visible: store.resultsVisible });
});

router.get('/position/:position', async (req, res) => {
  try {
    const { position } = req.params;

    if (!store.resultsVisible) {
      return res.status(403).json({ success: false, message: 'Results are not yet visible.' });
    }

    const candidates = await pgService.getCandidates(position);
    const results = candidates.map(candidate => ({
      id: candidate.id,
      name: candidate.name,
      party: candidate.party,
      partyShort: candidate.partyShort,
      photo: candidate.photo,
      votes: candidate.voteCount || 0
    }));

    return res.json({ success: true, position, results });
  } catch (error) {
    console.error('Get position results error:', error);
    res.status(500).json({ success: false, message: 'An error occurred while fetching results.' });
  }
});

router.get('/comprehensive', async (req, res) => {
  try {
    if (!store.resultsVisible) {
      return res.status(403).json({ success: false, message: 'Results are not yet visible.' });
    }

    const positions = ['president', 'governor', 'senator', 'houseOfReps'];
    const results = {};
    const pgRes = await pgService.getResults();

    for (const pos of positions) {
      results[pos] = (pgRes.results[pos] || []).map(candidate => ({
        id: candidate.id,
        name: candidate.name,
        party: candidate.party,
        partyShort: candidate.partyShort,
        photo: candidate.photo,
        votes: candidate.voteCount || 0
      }));
    }

    return res.json({
      success: true,
      results,
      turnout: pgRes.stats,
      isVisible: store.resultsVisible,
      totalVotesCount: pgRes.stats.totalVoted
    });
  } catch (error) {
    console.error('Get comprehensive results error:', error);
    res.status(500).json({ success: false, message: 'An error occurred while fetching comprehensive results.' });
  }
});

router.get('/turnout', async (req, res) => {
  try {
    const pgRes = await pgService.getResults();
    return res.json({ success: true, turnout: pgRes.stats });
  } catch (error) {
    console.error('Get turnout error:', error);
    res.status(500).json({ success: false, message: 'An error occurred while fetching turnout statistics.' });
  }
});

module.exports = router;
