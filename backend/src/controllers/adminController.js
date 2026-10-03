const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Withdrawal = require('../models/Withdrawal');
const AuditLog = require('../models/AuditLog');
const { WITHDRAWAL_STATUS } = require('../config/constants');
const { sendSuccess } = require('../utils/response');

const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalPendingWithdrawals,
      totalApprovedWithdrawals,
      totalRejectedWithdrawals,
      walletsAggregate
    ] = await Promise.all([
      User.countDocuments(),
      Withdrawal.countDocuments({ status: WITHDRAWAL_STATUS.PENDING }),
      Withdrawal.countDocuments({ status: WITHDRAWAL_STATUS.APPROVED }),
      Withdrawal.countDocuments({ status: WITHDRAWAL_STATUS.REJECTED }),
      Wallet.aggregate([
        {
          $group: {
            _id: null,
            totalVEs: { $sum: '$ves' },
            totalSVEs: { $sum: '$sves' },
            totalGems: { $sum: '$gems' },
            totalTokens: { $sum: '$tokens' },
            totalSpins: { $sum: '$spins' }
          }
        }
      ])
    ]);

    const systemCirculation = walletsAggregate[0] || {
      totalVEs: 0,
      totalSVEs: 0,
      totalGems: 0,
      totalTokens: 0,
      totalSpins: 0
    };

    return sendSuccess(res, 200, 'Admin overview stats fetched successfully.', {
      users: { total: totalUsers },
      withdrawals: {
        pending: totalPendingWithdrawals,
        approved: totalApprovedWithdrawals,
        rejected: totalRejectedWithdrawals
      },
      circulation: systemCirculation
    });
  } catch (error) {
    next(error);
  }
};

const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 30, action } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 30));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (action) filter.action = action;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('actorId', 'name email role')
        .populate('targetUserId', 'name email')
        .lean(),
      AuditLog.countDocuments(filter)
    ]);

    return sendSuccess(res, 200, 'Audit logs fetched successfully.', logs, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getAuditLogs
};
