const express = require('express');
const messageCheckinController = require('../controllers/messageCheckinController');

const router = express.Router();

router.get('/', messageCheckinController.getAll);
router.get('/invitation/:invitation_id', messageCheckinController.getAllByInvitationId);
router.get('/:id', messageCheckinController.getById);
router.post('/', messageCheckinController.create);
router.put('/:id', messageCheckinController.update);
router.patch('/:id', messageCheckinController.update);
router.delete('/:id', messageCheckinController.remove);

module.exports = router;
