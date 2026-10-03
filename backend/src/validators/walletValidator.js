const { body } = require('express-validator');
const validate = require('../middleware/requestValidator');
const { CURRENCIES, TRANSACTION_SOURCES } = require('../config/constants');

const walletMutationValidator = [
  body('userId')
    .notEmpty()
    .withMessage('Target userId is required')
    .isMongoId()
    .withMessage('Invalid userId format'),
  body('amount')
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a positive number greater than 0'),
  body('currency')
    .optional()
    .isIn(Object.values(CURRENCIES))
    .withMessage(`Currency must be one of: ${Object.values(CURRENCIES).join(', ')}`),
  body('source')
    .optional()
    .isIn(Object.values(TRANSACTION_SOURCES))
    .withMessage(`Source must be a valid transaction source`),
  body('description')
    .optional()
    .isString()
    .trim(),
  validate
];

module.exports = {
  walletMutationValidator
};
