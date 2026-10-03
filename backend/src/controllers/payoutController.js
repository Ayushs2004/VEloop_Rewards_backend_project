const payoutService = require('../services/payoutService');
const { sendSuccess } = require('../utils/response');

const getPayoutMethods = async (req, res, next) => {
  try {
    const methods = await payoutService.getPayoutMethods();
    return sendSuccess(res, 200, 'Payout methods fetched successfully.', methods);
  } catch (error) {
    next(error);
  }
};

const getPayoutOptionsByMethod = async (req, res, next) => {
  try {
    const { method } = req.params;
    const options = await payoutService.getPayoutOptionsByMethod(method);
    return sendSuccess(res, 200, `Payout options for ${method} fetched successfully.`, options);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPayoutMethods,
  getPayoutOptionsByMethod
};
