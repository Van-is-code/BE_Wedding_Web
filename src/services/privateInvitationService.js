const { randomUUID } = require('crypto');
const { PrivateInvitation } = require('../models');

const resourceName = 'PrivateInvitation';

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
	if (PrivateInvitation.rawAttributes.created_at) {
		findOptions.order = [['created_at', 'DESC']];
	}

	const { count, rows } = await PrivateInvitation.findAndCountAll(findOptions);
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
	const item = await PrivateInvitation.findByPk(id);
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

	if (PrivateInvitation.rawAttributes.created_at) {
		data.created_at = getNowValue(PrivateInvitation.rawAttributes.created_at);
	}
	if (PrivateInvitation.rawAttributes.updated_at) {
		data.updated_at = getNowValue(PrivateInvitation.rawAttributes.updated_at);
	}

	return PrivateInvitation.create(data);
};

const update = async (id, payload) => {
	const item = await getById(id);
	const data = { ...payload };
	delete data.id;

	if (PrivateInvitation.rawAttributes.updated_at) {
		data.updated_at = getNowValue(PrivateInvitation.rawAttributes.updated_at);
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
