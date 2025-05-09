const express = require('express');
const { body } = require('express-validator');
const { searchByVector } = require('../controllers/embeddingController');
const protect = require('../middleware/protect');

const router = express.Router();

// Search by vector route (protected)
router.post(
  '/search',
  protect,
  [
    body('answersVector')
      .isArray()
      .withMessage('Answers vector must be an array')
      .custom((value) => {
        if (!value.every(num => typeof num === 'number')) {
          throw new Error('All elements must be numbers');
        }
        return true;
      })
  ],
  searchByVector
);

module.exports = router; 