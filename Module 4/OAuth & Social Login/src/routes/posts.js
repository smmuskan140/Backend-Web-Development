const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  return res.status(200).json({ posts: [], userId: req.user.id });
});

module.exports = router;
