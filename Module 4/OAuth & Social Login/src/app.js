require('dotenv').config();
const express = require('express');
const { passport } = require('./auth/passport');
const authRoutes = require('./routes/auth');
const postsRouter = require('./routes/posts');
const requireAuth = require('./middleware/requireAuth');

const app = express();
app.use(express.json());
app.use(passport.initialize());

app.use('/auth', authRoutes);
app.use('/posts', requireAuth, postsRouter);

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => console.log(`OAuth assignment API listening on ${port}`));
}

module.exports = app;
