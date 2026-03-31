const { randomUUID } = require('crypto');
const fs = require('fs');
const path = require('path');
const { Invitation, InvitationTemplate, Groom, Bride, InvitationImage, User } = require('../models');

const resourceName = 'Invitation';

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

	const orderField = Invitation.rawAttributes.created_at ? 'created_at' : null;

	const findOptions = { where: filters, limit, offset };
	findOptions.include = [
		{
			model: InvitationImage,
			as: 'images',
			required: false
		}
	];
	findOptions.distinct = true;
	if (orderField) {
		findOptions.order = [[orderField, 'DESC']];
	}

	const { count, rows } = await Invitation.findAndCountAll(findOptions);
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
	const item = await Invitation.findOne({
		where: { id },
		include: [
			{
				model: InvitationTemplate,
				as: 'template',
				required: false
			},
			{
				model: Groom,
				as: 'groom',
				required: false
			},
			{
				model: Bride,
				as: 'bride',
				required: false
			},
			{
				model: InvitationImage,
				as: 'images',
				required: false
			}
		]
	});
	if (!item) {
		const error = new Error(`${resourceName} not found`);
		error.status = 404;
		throw error;
	}
	return item;
};

const getBySlug = async (invitationSlug) => {
	const item = await Invitation.findOne({
		where: { invitation_slug: invitationSlug },
		include: [
			{
				model: InvitationTemplate,
				as: 'template',
				required: false
			},
			{
				model: Groom,
				as: 'groom',
				required: false
			},
			{
				model: Bride,
				as: 'bride',
				required: false
			},
			{
				model: InvitationImage,
				as: 'images',
				required: false
			}
		]
	});

	if (!item) {
		const error = new Error(`${resourceName} not found`);
		error.status = 404;
		throw error;
	}

	return item;
};

const validateForeignKeys = async (payload) => {
	if (payload.template_id) {
		const template = await InvitationTemplate.findByPk(payload.template_id);
		if (!template) {
			const error = new Error('template_id không tồn tại');
			error.status = 400;
			throw error;
		}
	}

	if (payload.groom_id) {
		const groom = await Groom.findByPk(payload.groom_id);
		if (!groom) {
			const error = new Error('groom_id không tồn tại');
			error.status = 400;
			throw error;
		}
	}

	if (payload.bride_id) {
		const bride = await Bride.findByPk(payload.bride_id);
		if (!bride) {
			const error = new Error('bride_id không tồn tại');
			error.status = 400;
			throw error;
		}
	}
};

const getRandomDefaultMusicUrl = () => {
	const musicFolder = path.join(process.cwd(), 'media', 'music');
	if (!fs.existsSync(musicFolder)) {
		const error = new Error('Không tìm thấy thư mục media/music cho nhạc mặc định');
		error.status = 500;
		throw error;
	}

	const allowedExt = new Set(['.mp3', '.wav', '.ogg', '.m4a', '.aac']);
	const files = fs
		.readdirSync(musicFolder)
		.filter((name) => {
			const fullPath = path.join(musicFolder, name);
			const ext = path.extname(name).toLowerCase();
			return fs.statSync(fullPath).isFile() && allowedExt.has(ext);
		});

	if (files.length === 0) {
		const error = new Error('Không có file nhạc mặc định trong media/music');
		error.status = 500;
		throw error;
	}

	const randomIndex = Math.floor(Math.random() * files.length);
	return `/media/music/${encodeURIComponent(files[randomIndex])}`;
};

const create = async (payload, userId) => {
	if (!userId) {
		const error = new Error('Thiếu thông tin user từ token');
		error.status = 401;
		throw error;
	}

	// Kiểm tra user và số lượt slot
	const user = await User.findByPk(userId);
	if (!user) {
		const error = new Error('User không tồn tại');
		error.status = 404;
		throw error;
	}

	if (user.slot <= 0) {
		const error = new Error('Bạn đã hết lượt tạo thiệp. Vui lòng nâng cấp hoặc liên hệ quản trị viên');
		error.status = 403;
		throw error;
	}

	const data = { ...payload };
	delete data.id;
	data.id = randomUUID();
	data.users_id = userId;
	data.music_url = getRandomDefaultMusicUrl();

	await validateForeignKeys(data);

	if (Invitation.rawAttributes.created_at) {
		data.created_at = getNowValue(Invitation.rawAttributes.created_at);
	}
	if (Invitation.rawAttributes.updated_at) {
		data.updated_at = getNowValue(Invitation.rawAttributes.updated_at);
	}

	// Tạo invitation và giảm slot người dùng
	const invitation = await Invitation.create(data);
	
	// Trừ 1 lượt từ slot
	await user.decrement('slot', { by: 1 });

	return invitation;
};

const update = async (id, payload, userId) => {
	if (!userId) {
		const error = new Error('Thiếu thông tin user từ token');
		error.status = 401;
		throw error;
	}

	const item = await getById(id);
	const data = { ...payload };
	delete data.id;
	data.users_id = userId;

	await validateForeignKeys(data);

	if (Invitation.rawAttributes.updated_at) {
		data.updated_at = getNowValue(Invitation.rawAttributes.updated_at);
	}

	await item.update(data);
	return item;
};

const remove = async (id) => {
	const item = await getById(id);
	await item.destroy();
	return true;
};

module.exports = { getAll, getById, getBySlug, create, update, remove };
