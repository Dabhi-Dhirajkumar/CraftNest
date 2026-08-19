const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/noticeController');
const { verifyToken, isFacultyOrAdmin } = require('../middleware/authMiddleware');

router.get('/', verifyToken, noticeController.getAllNotices);
// Only Faculty & Admin can perform CRUD on notices
router.post('/', verifyToken, isFacultyOrAdmin, noticeController.createNotice);
router.put('/:id', verifyToken, isFacultyOrAdmin, noticeController.updateNotice);
router.delete('/:id', verifyToken, isFacultyOrAdmin, noticeController.deleteNotice);

module.exports = router;
