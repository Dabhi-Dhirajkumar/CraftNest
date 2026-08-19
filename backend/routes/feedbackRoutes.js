const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Anyone logged in can submit feedback
router.post('/', verifyToken, feedbackController.submitFeedback);
// get personal feedback
router.get('/my', verifyToken, feedbackController.getMyFeedback);
// Only Admin can view all feedback
router.get('/', verifyToken, isAdmin, feedbackController.getAllFeedback);
// Admin replies to feedback
router.put('/:id/reply', verifyToken, isAdmin, feedbackController.replyFeedback);

module.exports = router;
