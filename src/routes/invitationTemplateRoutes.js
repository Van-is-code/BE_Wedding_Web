const express = require('express');
const { authenticate } = require('../middlewares/auth');
const invitationTemplateController = require('../controllers/invitationTemplateController');

const router = express.Router();

router.use(authenticate);

router.get('/', invitationTemplateController.getAll);
router.get('/:id', invitationTemplateController.getById);
router.post('/', invitationTemplateController.create);
router.put('/:id', invitationTemplateController.update);
router.patch('/:id', invitationTemplateController.update);
router.delete('/:id', invitationTemplateController.remove);

module.exports = router;
