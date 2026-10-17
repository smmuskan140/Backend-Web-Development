const express = require('express');

const initialPosts = [
  { id: 1, title: 'Getting started with APIs', body: 'A predictable API contract helps every client.', likes: 0 },
  { id: 2, title: 'Pagination that scales', body: 'Lists should explain how clients continue.', likes: 0 },
  { id: 3, title: 'Safe error handling', body: 'Public errors should never expose internals.', likes: 0 },
  { id: 4, title: 'Resource-oriented routes', body: 'Let HTTP methods express the action.', likes: 0 },
  { id: 5, title: 'Consistent responses', body: 'Use one success envelope across endpoints.', likes: 0 }
];

let posts = [];

function resetData() {
  posts = initialPosts.map((post) => ({ ...post }));
}
resetData();

function success(res, data, status = 200) {
  return res.status(status).json({ data });
}

function notFound(res, message = 'Post not found') {
  return res.status(404).json({ error: { code: 'NOT_FOUND', message } });
}

function createApp() {
  const app = express();
  app.use(express.json());

  // Resource collection: GET /posts and POST /posts.
  app.get('/posts', (req, res) => {
    const parsedPage = Number.parseInt(req.query.page, 10);
    const parsedLimit = Number.parseInt(req.query.limit, 10);
    const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    const requestedLimit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 2;
    const limit = Math.min(requestedLimit, 100);
    const total = posts.length;
    const pages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    return res.json({
      data: posts.slice(start, start + limit).map((post) => ({ ...post })),
      meta: { page, limit, total, pages }
    });
  });

  app.get('/posts/:id', (req, res) => {
    const post = posts.find((item) => item.id === Number(req.params.id));
    if (!post) return notFound(res);
    return success(res, { ...post });
  });

  app.post('/posts', (req, res) => {
    const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
    const body = typeof req.body?.body === 'string' ? req.body.body.trim() : '';
    if (!title || !body) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Both title and body are required' }
      });
    }
    const nextId = posts.reduce((max, post) => Math.max(max, post.id), 0) + 1;
    const post = { id: nextId, title, body, likes: 0 };
    posts.push(post);
    return success(res, { ...post }, 201);
  });

  // A like is a resource created under its parent post.
  app.post('/posts/:id/likes', (req, res) => {
    const post = posts.find((item) => item.id === Number(req.params.id));
    if (!post) return notFound(res);
    post.likes += 1;
    return success(res, { postId: post.id, likes: post.likes }, 201);
  });

  // Safe demo endpoint: simulate an internal failure without leaking details.
  app.get('/internal-failure', (req, res) => {
    const internalError = new Error('Simulated private implementation detail');
    console.error('Internal demo failure:', internalError);
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' }
    });
  });

  app.use((req, res) => {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Route not found' }
    });
  });

  app.use((err, req, res, next) => {
    console.error('Unhandled API error:', err);
    if (res.headersSent) return next(err);
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' }
    });
  });

  return app;
}

if (require.main === module) {
  const app = createApp();
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`API listening on port ${port}`));
}

module.exports = { createApp, resetData };
