const { randomUUID } = require('crypto');
const { InvitationTemplate } = require('../models');

const resourceName = 'InvitationTemplate';

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

	const orderField = InvitationTemplate.rawAttributes.created_at
		? 'created_at'
		: (InvitationTemplate.rawAttributes.create_at ? 'create_at' : null);

	const findOptions = {
		where: filters,
		limit,
		offset
	};

	if (orderField) {
		findOptions.order = [[orderField, 'DESC']];
	}

	const { count, rows } = await InvitationTemplate.findAndCountAll(findOptions);

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
	const item = await InvitationTemplate.findByPk(id);
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

	if (InvitationTemplate.rawAttributes.created_at) {
		data.created_at = getNowValue(InvitationTemplate.rawAttributes.created_at);
	}
	if (InvitationTemplate.rawAttributes.create_at) {
		data.create_at = getNowValue(InvitationTemplate.rawAttributes.create_at);
	}
	if (InvitationTemplate.rawAttributes.updated_at) {
		data.updated_at = getNowValue(InvitationTemplate.rawAttributes.updated_at);
	}

	return InvitationTemplate.create(data);
};

const update = async (id, payload) => {
	const item = await getById(id);
	const data = { ...payload };
	delete data.id;

	if (InvitationTemplate.rawAttributes.updated_at) {
		data.updated_at = getNowValue(InvitationTemplate.rawAttributes.updated_at);
	}

	await item.update(data);
	return item;
};

const remove = async (id) => {
	const item = await getById(id);
	await item.destroy();
	return true;
};

module.exports = {
	getAll,
	getById,
	create,
	update,
	remove
};
