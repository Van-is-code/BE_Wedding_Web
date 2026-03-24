const { randomUUID } = require('crypto');
const { MessageCheckin } = require('../models');

const resourceName = 'MessageCheckin';

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
	if (MessageCheckin.rawAttributes.created_at) {
		findOptions.order = [['created_at', 'DESC']];
	}

	const { count, rows } = await MessageCheckin.findAndCountAll(findOptions);
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

const getAllByInvitationId = async (invitationId, query = {}) => {
	if (!invitationId) {
		const error = new Error('invitation_id là bắt buộc');
		error.status = 400;
		throw error;
	}

	return getAll({
		...query,
		invitation_id: invitationId
	});
};

const getById = async (id) => {
	const item = await MessageCheckin.findByPk(id);
	if (!item) {
		const error = new Error(`${resourceName} not found`);
		error.status = 404;
		throw error;
	}
	return item;
};

const create = async (payload) => {
	const data = { ...payload };
	delete data.id;
	data.id = randomUUID();

	if (MessageCheckin.rawAttributes.created_at) {
		data.created_at = getNowValue(MessageCheckin.rawAttributes.created_at);
	}
	if (MessageCheckin.rawAttributes.updated_at) {
		data.updated_at = getNowValue(MessageCheckin.rawAttributes.updated_at);
	}

	return MessageCheckin.create(data);
};

const update = async (id, payload) => {
	const item = await getById(id);
	const data = { ...payload };
	delete data.id;

	if (MessageCheckin.rawAttributes.updated_at) {
		data.updated_at = getNowValue(MessageCheckin.rawAttributes.updated_at);
	}

	await item.update(data);
	return item;
};

const remove = async (id) => {
	const item = await getById(id);
	await item.destroy();
	return true;
};

module.exports = { getAll, getAllByInvitationId, getById, create, update, remove };
