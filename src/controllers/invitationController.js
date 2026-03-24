const invitationService = require('../services/invitationService');

const getAll = async (req, res) => {
	try {
		const data = await invitationService.getAll(req.query);
		return res.status(200).json({ success: true, message: 'Get invitation list successfully', data });
	} catch (error) {
		return res.status(error.status || 500).json({ success: false, message: error.message || 'Failed to get invitation list' });
	}
};

const getById = async (req, res) => {
	try {
		const data = await invitationService.getById(req.params.id);
		return res.status(200).json({ success: true, message: 'Get invitation successfully', data });
	} catch (error) {
		return res.status(error.status || 500).json({ success: false, message: error.message || 'Failed to get invitation' });
	}
};

const create = async (req, res) => {
	try {
		const data = await invitationService.create(req.body, req.user?.id);
		return res.status(201).json({ success: true, message: 'Create invitation successfully', data });
	} catch (error) {
		return res.status(error.status || 500).json({ success: false, message: error.message || 'Failed to create invitation' });
	}
};

const update = async (req, res) => {
	try {
		const data = await invitationService.update(req.params.id, req.body, req.user?.id);
		return res.status(200).json({ success: true, message: 'Update invitation successfully', data });
	} catch (error) {
		return res.status(error.status || 500).json({ success: false, message: error.message || 'Failed to update invitation' });
	}
};

const remove = async (req, res) => {
	try {
		await invitationService.remove(req.params.id);
		return res.status(200).json({ success: true, message: 'Delete invitation successfully' });
	} catch (error) {
		return res.status(error.status || 500).json({ success: false, message: error.message || 'Failed to delete invitation' });
	}
};

module.exports = { getAll, getById, create, update, remove };
