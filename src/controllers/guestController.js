const guestService = require('../services/guestService');

const getAll = async (req, res) => {
	try {
		const data = await guestService.getAll(req.query);
		return res.status(200).json({ success: true, message: 'Get guest list successfully', data });
	} catch (error) {
		return res.status(error.status || 500).json({ success: false, message: error.message || 'Failed to get guest list' });
	}
};

const getById = async (req, res) => {
	try {
		const data = await guestService.getById(req.params.id);
		return res.status(200).json({ success: true, message: 'Get guest successfully', data });
	} catch (error) {
		return res.status(error.status || 500).json({ success: false, message: error.message || 'Failed to get guest' });
	}
};

const create = async (req, res) => {
	try {
		const data = await guestService.create(req.body, req.user?.id);
		return res.status(201).json({ success: true, message: 'Create guest successfully', data });
	} catch (error) {
		return res.status(error.status || 500).json({ success: false, message: error.message || 'Failed to create guest' });
	}
};

const update = async (req, res) => {
	try {
		const data = await guestService.update(req.params.id, req.body, req.user?.id);
		return res.status(200).json({ success: true, message: 'Update guest successfully', data });
	} catch (error) {
		return res.status(error.status || 500).json({ success: false, message: error.message || 'Failed to update guest' });
	}
};

const remove = async (req, res) => {
	try {
		await guestService.remove(req.params.id);
		return res.status(200).json({ success: true, message: 'Delete guest successfully' });
	} catch (error) {
		return res.status(error.status || 500).json({ success: false, message: error.message || 'Failed to delete guest' });
	}
};

module.exports = { getAll, getById, create, update, remove };
