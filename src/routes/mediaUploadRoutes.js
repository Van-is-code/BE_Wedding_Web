const express = require('express');
const multer = require('multer');
const { authenticate } = require('../middlewares/auth');
const mediaUploadController = require('../controllers/mediaUploadController');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024
  }
});

router.get('/', mediaUploadController.listMedia);
router.get('/one', mediaUploadController.getMediaByPublicId);
router.post('/', upload.single('file'), mediaUploadController.createMedia);
router.put('/one', upload.single('file'), mediaUploadController.updateMedia);
router.patch('/one', upload.single('file'), mediaUploadController.updateMedia);
router.delete('/one', mediaUploadController.deleteMedia);

router.post('/image', upload.single('image'), mediaUploadController.uploadImage);
router.post('/video', upload.single('video'), mediaUploadController.uploadMusic);
router.post('/music', upload.single('music'), mediaUploadController.uploadMusic);
router.post('/music/local', authenticate, upload.single('music'), mediaUploadController.uploadMusicLocal);

module.exports = router;
