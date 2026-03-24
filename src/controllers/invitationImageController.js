const invitationImageService = require('../services/invitationImageService');

const getAll = async (req, res) => {
	try {
		const data = await invitationImageService.getAll(req.query);
		return res.status(200).json({ success: true, message: 'Get invitation_image list successfully', data });
	} catch (error) {
		return res.status(error.status || 500).json({ success: false, message: error.message || 'Failed to get invitation_image list' });
	}
};

const getById = async (req, res) => {
	try {
		const data = await invitationImageService.getById(req.params.id);
		return res.status(200).json({ success: true, message: 'Get invitation_image successfully', data });
	} catch (error) {
		return res.status(error.status || 500).json({ success: false, message: error.message || 'Failed to get invitation_image' });
	}
};

const create = async (req, res) => {
	try {
		const data = await invitationImageService.create(req.body, req.user?.id, req.file);
		return res.status(201).json({ success: true, message: 'Create invitation_image successfully', data });
	} catch (error) {
		return res.status(error.status || 500).json({ success: false, message: error.message || 'Failed to create invitation_image' });
	}
};

const update = async (req, res) => {
	try {
		const data = await invitationImageService.update(req.params.id, req.body, req.user?.id, req.file);
		return res.status(200).json({ success: true, message: 'Update invitation_image successfully', data });
	} catch (error) {
		return res.status(error.status || 500).json({ success: false, message: error.message || 'Failed to update invitation_image' });
	}
};

const remove = async (req, res) => {
	try {
		await invitationImageService.remove(req.params.id);
		return res.status(200).json({ success: true, message: 'Delete invitation_image successfully' });
	} catch (error) {
		return res.status(error.status || 500).json({ success: false, message: error.message || 'Failed to delete invitation_image' });
	}
};

module.exports = { getAll, getById, create, update, remove };
