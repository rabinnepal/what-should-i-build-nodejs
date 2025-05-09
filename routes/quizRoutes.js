const express = require('express');
const { body } = require('express-validator');
const { submitQuiz } = require('../controllers/quizController');
const protect = require('../middleware/protect');

const router = express.Router();

// Submit quiz route (optional auth)
router.post(
  '/suggest',
  [
    body('answers')
      .isObject()
      .withMessage('Answers must be an object'),
    body('filters')
      .isObject()
      .withMessage('Filters must be an object'),
    body('filters.difficulty')
      .optional()
      .isIn(['easy', 'medium', 'hard'])
      .withMessage('Invalid difficulty level'),
    body('filters.vibe')
      .optional()
      .isIn(['creative', 'useful', 'silly'])
      .withMessage('Invalid vibe'),
    body('filters.tech')
      .optional()
      .isString()
      .withMessage('Tech must be a string'),
    body('filters.time')
      .optional()
      .isString()
      .withMessage('Time must be a string')
  ],
  submitQuiz
);

module.exports = router; 