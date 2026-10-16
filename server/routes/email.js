const express = require('express');
const router = express.Router();
const { sendReceiptEmail } = require('../services/emailService');

// POST /api/email/send-receipt
router.post('/send-receipt', async (req, res) => {
  try {
    const { email, receiptToken, voterNIN, voterName } = req.body;

    if (!email || !receiptToken) {
      return res.status(400).json({
        success: false,
        message: 'Please provide recipient email and receipt token.'
      });
    }

    const result = await sendReceiptEmail({
      email,
      receiptToken,
      voterNIN: voterNIN || '12345678901',
      voterName: voterName || 'Voter',
      timestamp: new Date().toLocaleString() + ' WAT'
    });

    res.json({
      success: true,
      message: `Official voting receipt sent successfully to ${email}`,
      details: result
    });
  } catch (error) {
    console.error('Send email route error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send email receipt.'
    });
  }
});

module.exports = router;
