const express = require('express');
const { authenticate } = require('../middlewares/auth');
const invitationController = require('../controllers/invitationController');

const router = express.Router();

router.use(authenticate);

router.get('/', invitationController.getAll);
router.get('/slug/:invitation_slug', invitationController.getBySlug);
router.get('/:id', invitationController.getById);
router.post('/', invitationController.create);
router.put('/:id', invitationController.update);
router.patch('/:id', invitationController.update);
router.delete('/:id', invitationController.remove);

module.exports = router;
