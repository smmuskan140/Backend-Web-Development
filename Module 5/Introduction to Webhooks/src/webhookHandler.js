'use strict';

const crypto = require('node:crypto');
const { handleEvent } = require('./eventHandlers');

const _processedIds = new Set();

function verifySignature(rawBody, signature, secret) {
  if (!Buffer.isBuffer(rawBody) || typeof signature !== 'string' || !secret) {
    return false;
  }

  const match = /^sha256=([a-fA-F0-9]{64})$/.exec(signature);
  if (!match) return false;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest();

  const received = Buffer.from(match[1], 'hex');

  if (received.length !== expected.length) return false;
  return crypto.timingSafeEqual(expected, received);
}

async function handleWebhook(req, res) {
  const signature = req.headers['x-webhook-signature'];
  const secret = process.env.WEBHOOK_SECRET;

  if (!verifySignature(req.body, signature, secret)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  let event;
  try {
    event = JSON.parse(req.body.toString('utf8'));
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  if (!event || typeof event.id !== 'string' || event.id.length === 0) {
    return res.status(400).json({ error: 'Missing event id' });
  }

  if (_processedIds.has(event.id)) {
    return res.status(200).json({ status: 'already_processed' });
  }

  _processedIds.add(event.id);
  res.status(200).json({ status: 'received' });

  setImmediate(() => {
    Promise.resolve(handleEvent(event)).catch((error) => {
      console.error('[webhook] event processing failed:', error);
    });
  });
}

module.exports = { handleWebhook, _processedIds };
