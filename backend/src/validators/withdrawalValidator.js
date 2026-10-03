const { body } = require('express-validator');
const validate = require('../middleware/requestValidator');
const { PAYOUT_METHODS } = require('../config/constants');

const createWithdrawalValidator = [
  body('method')
    .notEmpty()
    .withMessage('Payout method is required')
    .toUpperCase()
    .isIn(Object.values(PAYOUT_METHODS))
    .withMessage(`Supported methods are: ${Object.values(PAYOUT_METHODS).join(', ')}`),
  body('optionId')
    .notEmpty()
    .withMessage('Payout optionId is required')
    .isString()
    .trim(),
  body('payoutDetails')
    .isObject()
    .withMessage('Payout details must be an object containing required recipient info'),
  validate
];

const rejectWithdrawalValidator = [
  body('reason')
    .notEmpty()
    .withMessage('Rejection reason is required')
    .isLength({ min: 3, max: 500 })
    .withMessage('Rejection reason must be between 3 and 500 characters'),
  validate
];

const approveWithdrawalValidator = [
  body('reviewNote')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Review note cannot exceed 500 characters'),
  validate
];

module.exports = {
  createWithdrawalValidator,
  rejectWithdrawalValidator,
  approveWithdrawalValidator
};
