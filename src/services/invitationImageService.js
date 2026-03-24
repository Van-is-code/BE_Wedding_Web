const { randomUUID } = require('crypto');
const fs = require('fs');
const path = require('path');
const { sequelize, InvitationImage, Invitation } = require('../models');

const resourceName = 'InvitationImage';

const getNowValue = (attribute) => {
	const now = new Date();
	const typeKey = attribute?.type?.key;
	return typeKey === 'STRING' || typeKey === 'TEXT' ? now.toISOString() : now;
};

const getAll = async (query = {}) => {
	const page = Number.parseInt(query.page, 10) || 1;
	const limit = Number.parseInt(query.limit, 10) || 20;
	const offset = (page - 1) * limit;
	const filters = { ...query };
	delete filters.page;
	delete filters.limit;

	const findOptions = { where: filters, limit, offset };
	if (InvitationImage.rawAttributes.created_at) {
		findOptions.order = [['created_at', 'DESC']];
	}

	const { count, rows } = await InvitationImage.findAndCountAll(findOptions);
	return {
		items: rows,
		pagination: {
			total: count,
			page,
			limit,
			totalPages: Math.ceil(count / limit)
		}
	};
};

const getById = async (id) => {
	const item = await InvitationImage.findByPk(id);
	if (!item) {
		const error = new Error(`${resourceName} not found`);
		error.status = 404;
		throw error;
	}
	return item;
};

const buildInvitationImagePath = ({ invitationId, originalName }) => {
	const ext = path.extname(originalName || '').toLowerCase() || '.jpg';
	const safeExt = ext.length <= 10 ? ext : '.jpg';
	const fileName = `${Date.now()}-${randomUUID()}${safeExt}`;
	const folderPath = path.join(process.cwd(), 'uploads', 'images', invitationId);
	fs.mkdirSync(folderPath, { recursive: true });
	const absolutePath = path.join(folderPath, fileName);
	const relativePath = path.posix.join('uploads', 'images', invitationId, fileName);
	return { absolutePath, relativePath };
};

const getAbsolutePathFromUrl = (url) => {
	if (!url || typeof url !== 'string') {
		return null;
	}

	const cleanUrl = url.replace(/^\/+/, '');
	if (!cleanUrl.startsWith('uploads/')) {
		return null;
	}

	const normalizedRelative = cleanUrl.replace(/\//g, path.sep);
	return path.join(process.cwd(), normalizedRelative);
};

const deleteFileIfExists = (absolutePath) => {
	if (!absolutePath) {
		return;
	}

	if (fs.existsSync(absolutePath)) {
		fs.unlinkSync(absolutePath);
	}
};

const ensureInvitationExists = async (invitationId) => {
	if (!invitationId) {
		const error = new Error('invitation_id là bắt buộc');
		error.status = 400;
		throw error;
	}

	const invitation = await Invitation.findByPk(invitationId);
	if (!invitation) {
		const error = new Error('invitation_id không tồn tại');
		error.status = 400;
		throw error;
	}
};

const create = async (payload, userId, file) => {
	if (!userId) {
		const error = new Error('Thiếu thông tin user từ token');
		error.status = 401;
		throw error;
	}

	if (!file) {
		const error = new Error('Vui lòng tải lên ảnh');
		error.status = 400;
		throw error;
	}

	const data = { ...payload };
	delete data.id;
	data.id = randomUUID();
	data.users_id = userId;

	await ensureInvitationExists(data.invitation_id);

	const { absolutePath, relativePath } = buildInvitationImagePath({
		invitationId: data.invitation_id,
		originalName: file.originalname
	});
	fs.writeFileSync(absolutePath, file.buffer);
	data.image_url = `/${relativePath.replace(/\\/g, '/')}`;

	if (InvitationImage.rawAttributes.created_at) {
		data.created_at = getNowValue(InvitationImage.rawAttributes.created_at);
	}
	if (InvitationImage.rawAttributes.updated_at) {
		data.updated_at = getNowValue(InvitationImage.rawAttributes.updated_at);
	}

	try {
		return await sequelize.transaction(async (transaction) => {
			return InvitationImage.create(data, { transaction });
		});
	} catch (error) {
		deleteFileIfExists(absolutePath);
		throw error;
	}
};

const update = async (id, payload, userId, file) => {
	if (!userId) {
		const error = new Error('Thiếu thông tin user từ token');
		error.status = 401;
		throw error;
	}

	const item = await getById(id);
	const oldImagePath = getAbsolutePathFromUrl(item.image_url);
	const data = { ...payload };
	delete data.id;
	data.users_id = userId;

	let newImagePath = null;

	if (data.invitation_id) {
		await ensureInvitationExists(data.invitation_id);
	}

	if (file) {
		const invitationId = data.invitation_id || item.invitation_id;
		await ensureInvitationExists(invitationId);
		const { absolutePath, relativePath } = buildInvitationImagePath({
			invitationId,
			originalName: file.originalname
		});
		fs.writeFileSync(absolutePath, file.buffer);
		newImagePath = absolutePath;
		data.image_url = `/${relativePath.replace(/\\/g, '/')}`;
	}

	if (InvitationImage.rawAttributes.updated_at) {
		data.updated_at = getNowValue(InvitationImage.rawAttributes.updated_at);
	}

	try {
		const updated = await sequelize.transaction(async (transaction) => {
			await item.update(data, { transaction });
			return item;
		});

		if (newImagePath && oldImagePath && oldImagePath !== newImagePath) {
			deleteFileIfExists(oldImagePath);
		}

		return updated;
	} catch (error) {
		if (newImagePath) {
			deleteFileIfExists(newImagePath);
		}
		throw error;
	}
};

const remove = async (id) => {
	const item = await getById(id);
	const currentImagePath = getAbsolutePathFromUrl(item.image_url);

	await sequelize.transaction(async (transaction) => {
		await item.destroy({ transaction });
		deleteFileIfExists(currentImagePath);
	});

	return true;
};

module.exports = { getAll, getById, create, update, remove };
