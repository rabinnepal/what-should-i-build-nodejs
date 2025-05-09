const express = require('express');
const { body } = require('express-validator');
const { createIdea, getIdeas, getIdea, voteIdea } = require('../controllers/ideaController');
const protect = require('../middleware/protect');

const router = express.Router();

// Create idea route (protected)
router.post(
  '/',
  protect,
  [
    body('title')
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('Title must be between 3 and 100 characters'),
    body('description')
      .trim()
      .isLength({ min: 10 })
      .withMessage('Description must be at least 10 characters long'),
    body('tags')
      .isArray()
      .withMessage('Tags must be an array')
  ],
  createIdea
);

// Get ideas route
router.get('/', getIdeas);

// Get single idea route
router.get('/:id', getIdea);

// Vote on idea route (protected)
router.post(
  '/:id/vote',
  protect,
  [
    body('vote')
      .isInt({ min: -1, max: 1 })
      .withMessage('Vote must be -1, 0, or 1')
  ],
  voteIdea
);

module.exports = router; 