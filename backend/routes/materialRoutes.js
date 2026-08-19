const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, materialController.getMaterials);
router.post('/', verifyToken, materialController.addMaterial);
router.delete('/:id', verifyToken, materialController.deleteMaterial);

module.exports = router;
