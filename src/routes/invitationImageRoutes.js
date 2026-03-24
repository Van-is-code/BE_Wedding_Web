const express = require('express');
const multer = require('multer');
const { authenticate } = require('../middlewares/auth');
const invitationImageController = require('../controllers/invitationImageController');

const router = express.Router();
const upload = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 20 * 1024 * 1024
	}
});

router.use(authenticate);

router.get('/', invitationImageController.getAll);
router.get('/:id', invitationImageController.getById);
router.post('/', upload.single('image'), invitationImageController.create);
router.put('/:id', upload.single('image'), invitationImageController.update);
router.patch('/:id', upload.single('image'), invitationImageController.update);
router.delete('/:id', invitationImageController.remove);

module.exports = router;
