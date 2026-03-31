const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User } = require('../models');

const buildToken = (user) => {
	const secret = process.env.JWT_SECRET || 'your_jwt_secret_key';
	const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

	return jwt.sign(
		{
			id: user.id,
			username: user.username,
			role: user.role || 'user'
		},
		secret,
		{ expiresIn }
	);
};

const sanitizeUser = (user) => ({
	id: user.id,
	username: user.username,
	role: user.role,
	slot: user.slot || 0,
	created_at: user.created_at,
	updated_at: user.updated_at
});

const register = async ({ username, password, role = 'user' }) => {
	if (!username || !password) {
		const error = new Error('username và password là bắt buộc');
		error.status = 400;
		throw error;
	}

	const existed = await User.findOne({ where: { username } });
	if (existed) {
		const error = new Error('username đã tồn tại');
		error.status = 409;
		throw error;
	}

	const hashedPassword = await bcrypt.hash(password, 10);

	const user = await User.create({
		username,
		password: hashedPassword,
		role,
		slot: 0,
		created_at: new Date(),
		updated_at: new Date()
	});

	const token = buildToken(user);

	return {
		user: sanitizeUser(user),
		token
	};
};

const login = async ({ username, password }) => {
	if (!username || !password) {
		const error = new Error('username và password là bắt buộc');
		error.status = 400;
		throw error;
	}

	const user = await User.findOne({ where: { username } });
	if (!user) {
		const error = new Error('Sai username hoặc password');
		error.status = 401;
		throw error;
	}

	const matched = await bcrypt.compare(password, user.password || '');
	if (!matched) {
		const error = new Error('Sai username hoặc password');
		error.status = 401;
		throw error;
	}

	const token = buildToken(user);

	return {
		user: sanitizeUser(user),
		token
	};
};

const getProfile = async (userId) => {
	const user = await User.findByPk(userId);
	if (!user) {
		const error = new Error('Không tìm thấy user');
		error.status = 404;
		throw error;
	}

	return sanitizeUser(user);
};

const updateProfile = async (userId, { username, role }) => {
	const user = await User.findByPk(userId);
	if (!user) {
		const error = new Error('Không tìm thấy user');
		error.status = 404;
		throw error;
	}

	if (username && username !== user.username) {
		const existed = await User.findOne({
			where: {
				username,
				id: { [Op.ne]: userId }
			}
		});

		if (existed) {
			const error = new Error('username đã tồn tại');
			error.status = 409;
			throw error;
		}

		user.username = username;
	}

	if (role) {
		user.role = role;
	}

	user.updated_at = new Date();
	await user.save();

	return sanitizeUser(user);
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
	if (!currentPassword || !newPassword) {
		const error = new Error('currentPassword và newPassword là bắt buộc');
		error.status = 400;
		throw error;
	}

	const user = await User.findByPk(userId);
	if (!user) {
		const error = new Error('Không tìm thấy user');
		error.status = 404;
		throw error;
	}

	const matched = await bcrypt.compare(currentPassword, user.password || '');
	if (!matched) {
		const error = new Error('Mật khẩu hiện tại không đúng');
		error.status = 400;
		throw error;
	}

	user.password = await bcrypt.hash(newPassword, 10);
	user.updated_at = new Date();
	await user.save();

	return { changed: true };
};

module.exports = {
	register,
	login,
	getProfile,
	updateProfile,
	changePassword
};
