const userService = require('../services/userService');

const register = async (req, res) => {
	try {
		const data = await userService.register(req.body);
		return res.status(201).json({
			success: true,
			message: 'Đăng ký thành công',
			data
		});
	} catch (error) {
		return res.status(error.status || 500).json({
			success: false,
			message: error.message || 'Đăng ký thất bại'
		});
	}
};

const login = async (req, res) => {
	try {
		const data = await userService.login(req.body);
		return res.status(200).json({
			success: true,
			message: 'Đăng nhập thành công',
			data
		});
	} catch (error) {
		return res.status(error.status || 500).json({
			success: false,
			message: error.message || 'Đăng nhập thất bại'
		});
	}
};

const getProfile = async (req, res) => {
	try {
		const data = await userService.getProfile(req.user.id);
		return res.status(200).json({
			success: true,
			message: 'Lấy thông tin cá nhân thành công',
			data
		});
	} catch (error) {
		return res.status(error.status || 500).json({
			success: false,
			message: error.message || 'Lấy thông tin cá nhân thất bại'
		});
	}
};

const updateProfile = async (req, res) => {
	try {
		const data = await userService.updateProfile(req.user.id, req.body);
		return res.status(200).json({
			success: true,
			message: 'Cập nhật thông tin cá nhân thành công',
			data
		});
	} catch (error) {
		return res.status(error.status || 500).json({
			success: false,
			message: error.message || 'Cập nhật thông tin cá nhân thất bại'
		});
	}
};

const changePassword = async (req, res) => {
	try {
		const data = await userService.changePassword(req.user.id, req.body);
		return res.status(200).json({
			success: true,
			message: 'Đổi mật khẩu thành công',
			data
		});
	} catch (error) {
		return res.status(error.status || 500).json({
			success: false,
			message: error.message || 'Đổi mật khẩu thất bại'
		});
	}
};

module.exports = {
	register,
	login,
	getProfile,
	updateProfile,
	changePassword
};
