const { randomUUID } = require('crypto');
const crypto = require('crypto');
const { sequelize, Guest, Invitation, PrivateInvitation } = require('../models');

const resourceName = 'Guest';

const getNowValue = (attribute) => {
	const now = new Date();
	const typeKey = attribute?.type?.key;
	return typeKey === 'STRING' || typeKey === 'TEXT' ? now.toISOString() : now;
};

const buildGuestEncryptedQueryValue = (guest, invitationId) => {
	const secret = process.env.GUEST_LINK_SECRET || process.env.JWT_SECRET || 'guest_link_secret';
	const key = crypto.createHash('sha256').update(secret).digest();
	const iv = crypto.randomBytes(12);

	const payload = JSON.stringify({
		id: guest.id,
		name: guest.name,
		description: guest.description || null,
		invitation_id: invitationId,
		ts: Date.now()
	});

	const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
	const encrypted = Buffer.concat([cipher.update(payload, 'utf8'), cipher.final()]);
	const tag = cipher.getAuthTag();

	return Buffer.concat([iv, tag, encrypted]).toString('base64url');
};

const getAll = async (query = {}) => {
	const page = Number.parseInt(query.page, 10) || 1;
	const limit = Number.parseInt(query.limit, 10) || 20;
	const offset = (page - 1) * limit;
	const filters = { ...query };
	delete filters.page;
	delete filters.limit;

	const findOptions = {
		where: filters,
		limit,
		offset,
		include: [
			{
				model: PrivateInvitation,
				as: 'privateInvitation',
				required: false,
				attributes: ['id', 'url', 'invitationns_id']
			}
		],
		distinct: true
	};
	if (Guest.rawAttributes.created_at) {
		findOptions.order = [['created_at', 'DESC']];
	}

	const { count, rows } = await Guest.findAndCountAll(findOptions);
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
	const item = await Guest.findOne({
		where: { id },
		include: [
			{
				model: PrivateInvitation,
				as: 'privateInvitation',
				required: false,
				attributes: ['id', 'url', 'invitationns_id']
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

const create = async (payload, userId) => {
	if (!userId) {
		const error = new Error('Thiếu thông tin user từ token');
		error.status = 401;
		throw error;
	}

	const data = { ...payload };
	const invitationId = data.invitation_id;
	delete data.id;
	delete data.invitation_id;
	data.id = randomUUID();
	data.users_id = userId;

	if (!invitationId) {
		const error = new Error('invitation_id là bắt buộc khi tạo guest');
		error.status = 400;
		throw error;
	}

	const invitation = await Invitation.findByPk(invitationId);
	if (!invitation) {
		const error = new Error('invitation_id không tồn tại');
		error.status = 400;
		throw error;
	}

	if (Guest.rawAttributes.created_at) {
		data.created_at = getNowValue(Guest.rawAttributes.created_at);
	}
	if (Guest.rawAttributes.updated_at) {
		data.updated_at = getNowValue(Guest.rawAttributes.updated_at);
	}

	return sequelize.transaction(async (transaction) => {
		const guest = await Guest.create(data, { transaction });
		const encryptedGuestValue = buildGuestEncryptedQueryValue(guest, invitationId);

		await PrivateInvitation.create(
			{
				id: randomUUID(),
				guest_id: guest.id,
				invitationns_id: invitationId,
				url: `/invitation/${invitation.invitation_slug}?guest_name=${encodeURIComponent(encryptedGuestValue)}`,
				created_at: getNowValue(PrivateInvitation.rawAttributes.created_at),
				updated_at: getNowValue(PrivateInvitation.rawAttributes.updated_at)
			},
			{ transaction }
		);

		return guest;
	});
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

	if (Guest.rawAttributes.updated_at) {
		data.updated_at = getNowValue(Guest.rawAttributes.updated_at);
	}

	await item.update(data);
	return item;
};

const remove = async (id) => {
	const item = await getById(id);
	await item.destroy();
	return true;
};

module.exports = { getAll, getById, create, update, remove };
