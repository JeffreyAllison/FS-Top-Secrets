const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const Secret = require('../models/Secret');

module.exports = Router().get('/', authenticate, async (req, res) => {
  try {
    const Secrets = await Secret.getAllSecrets();
    res.json(Secrets);
  } catch (e) {
    next(e);
  }
});
