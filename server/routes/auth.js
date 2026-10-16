const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const pgService = require('../src/db/pgService');

const registerSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  nin: Joi.string().length(16).required(),
  dob: Joi.string().required(),
  state: Joi.string().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

router.post('/register', async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { name, email, password, nin, dob, state } = req.body;

  try {
    const existingEmail = await pgService.getVoterByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ message: 'Voter with that email already exists' });
    }
    const existingNin = await pgService.getVoterByNIN(nin);
    if (existingNin) {
      return res.status(400).json({ message: 'Voter with that NIN already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newVoter = await pgService.registerVoter({
      nin,
      name,
      dob,
      email,
      password: hashedPassword,
      state
    });

    const payload = {
      voter: {
        id: newVoter.id || newVoter.nin,
        isAdmin: newVoter.isAdmin
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.post('/login', async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { email, password } = req.body;

  try {
    const voter = await pgService.getVoterByEmail(email);
    if (!voter) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, voter.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = {
      voter: {
        id: voter.id || voter.nin,
        isAdmin: voter.isAdmin,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
