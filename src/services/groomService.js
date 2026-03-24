const { randomUUID } = require('crypto');
const { Groom } = require('../models');

const resourceName = 'Groom';

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

	const orderField = Groom.rawAttributes.created_at
		? 'created_at'
		: (Groom.rawAttributes.create_at ? 'create_at' : null);

	const findOptions = { where: filters, limit, offset };
	if (orderField) {
		findOptions.order = [[orderField, 'DESC']];
	}

	const { count, rows } = await Groom.findAndCountAll(findOptions);
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
	const item = await Groom.findByPk(id);
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
	delete data.id;
	data.id = randomUUID();
	data.users_id = userId;

	if (Groom.rawAttributes.created_at) {
		data.created_at = getNowValue(Groom.rawAttributes.created_at);
	}
	if (Groom.rawAttributes.create_at) {
		data.create_at = getNowValue(Groom.rawAttributes.create_at);
	}
	if (Groom.rawAttributes.updated_at) {
		data.updated_at = getNowValue(Groom.rawAttributes.updated_at);
	}

	return Groom.create(data);
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

	if (Groom.rawAttributes.updated_at) {
		data.updated_at = getNowValue(Groom.rawAttributes.updated_at);
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
