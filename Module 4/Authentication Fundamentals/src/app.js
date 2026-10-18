require('dotenv').config();
const express = require('express');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error.status === 400 || error.status === 409) {
    return res.status(error.status).json({
      error: {
        code: error.code || (error.status === 409 ? 'EMAIL_ALREADY_EXISTS' : 'VALIDATION_ERROR'),
        message: error.message
      }
    });
  }
  console.error(error.message);
  return res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Internal server error' }
  });
});

const port = Number(process.env.PORT || 3000);
if (require.main === module) {
  app.listen(port, () => console.log(`API listening on ${port}`));
}

module.exports = app;
