const authService = require('../services/authService');
const { sendSuccess } = require('../utils/response');

const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await authService.register({
      email,
      password,
      name,
      ip,
      userAgent
    });

    return sendSuccess(res, 201, 'User account registered successfully.', result);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await authService.login({
      email,
      password,
      ip,
      userAgent
    });

    return sendSuccess(res, 200, 'Login successful.', result);
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const result = await authService.getMe(req.user.id);
    return sendSuccess(res, 200, 'User profile fetched successfully.', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe
};
