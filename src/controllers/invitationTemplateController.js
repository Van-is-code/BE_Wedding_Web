const invitationTemplateService = require('../services/invitationTemplateService');

const getAll = async (req, res) => {
	try {
		const data = await invitationTemplateService.getAll(req.query);
		return res.status(200).json({ success: true, message: 'Get invitation_template list successfully', data });
	} catch (error) {
		return res.status(error.status || 500).json({ success: false, message: error.message || 'Failed to get invitation_template list' });
	}
};

const getById = async (req, res) => {
	try {
		const data = await invitationTemplateService.getById(req.params.id);
		return res.status(200).json({ success: true, message: 'Get invitation_template successfully', data });
	} catch (error) {
		return res.status(error.status || 500).json({ success: false, message: error.message || 'Failed to get invitation_template' });
	}
};

const create = async (req, res) => {
	try {
		const data = await invitationTemplateService.create(req.body);
		return res.status(201).json({ success: true, message: 'Create invitation_template successfully', data });
	} catch (error) {
		return res.status(error.status || 500).json({ success: false, message: error.message || 'Failed to create invitation_template' });
	}
};

const update = async (req, res) => {
	try {
		const data = await invitationTemplateService.update(req.params.id, req.body);
		return res.status(200).json({ success: true, message: 'Update invitation_template successfully', data });
	} catch (error) {
		return res.status(error.status || 500).json({ success: false, message: error.message || 'Failed to update invitation_template' });
	}
};

const remove = async (req, res) => {
	try {
		await invitationTemplateService.remove(req.params.id);
		return res.status(200).json({ success: true, message: 'Delete invitation_template successfully' });
	} catch (error) {
		return res.status(error.status || 500).json({ success: false, message: error.message || 'Failed to delete invitation_template' });
	}
};

module.exports = { getAll, getById, create, update, remove };
