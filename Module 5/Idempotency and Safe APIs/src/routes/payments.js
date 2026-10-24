'use strict';
// routes/payments.js
// Idempotent POST /payments: one real charge per Idempotency-Key.

const router = require('express').Router();
const { charges, idempotency, nextChargeId } = require('../store');

router.post('/', (req, res) => {
  const key = req.headers['idempotency-key'];

  // A key is required to safely identify retries of the same operation.
  if (typeof key !== 'string' || key.trim() === '') {
    return res.status(400).json({
      error: {
        code: 'IDEMPOTENCY_KEY_REQUIRED',
        message: 'Idempotency-Key header is required',
      },
    });
  }

  // Replay the original status and body without repeating the side effect.
  if (idempotency.has(key)) {
    const saved = idempotency.get(key);
    return res.status(saved.status).json(saved.body);
  }

  // This is the first request for this key: create exactly one charge.
  const amount = req.body && req.body.amount;
  const charge = { id: nextChargeId(), amount, status: 'charged' };
  charges.push(charge);

  const status = 201;
  const body = { id: charge.id, amount: charge.amount, status: charge.status };
  idempotency.set(key, { status, body });

  return res.status(status).json(body);
});

module.exports = router;
