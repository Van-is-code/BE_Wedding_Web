const express = require('express');
const { authenticate } = require('../middlewares/auth');
const guestController = require('../controllers/guestController');

const router = express.Router();

router.use(authenticate);

router.get('/', guestController.getAll);
router.get('/:id', guestController.getById);
router.post('/', guestController.create);
router.put('/:id', guestController.update);
router.patch('/:id', guestController.update);
router.delete('/:id', guestController.remove);

module.exports = router;
