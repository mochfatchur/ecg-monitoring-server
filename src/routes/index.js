import express from 'express';

const router = express.Router();

// Example route
router.get('/', (req, res) => {
  res.send('Hello, Express with ES6 Modules!');
});

export default router;
