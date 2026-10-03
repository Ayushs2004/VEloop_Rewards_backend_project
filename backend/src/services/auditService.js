const AuditLog = require('../models/AuditLog');
const { generateAuditId } = require('../utils/idGenerator');

/**
 * Log sensitive operations to the immutable audit collection
 */
const logAction = async ({
  actorId = null,
  action,
  targetUserId = null,
  targetType,
  referenceId = null,
  metadata = {},
  ip = null,
  userAgent = null,
  session = null
}) => {
  try {
    const auditDoc = new AuditLog({
      auditId: generateAuditId(),
      actorId,
      action,
      targetUserId,
      targetType,
      referenceId,
      metadata,
      ip,
      userAgent
    });

    if (session) {
      await auditDoc.save({ session });
    } else {
      await auditDoc.save();
    }

    return auditDoc;
  } catch (error) {
    // Non-blocking catch to ensure audit logging errors do not crash primary flow,
    // but log visibly for observability
    console.error(`[AuditService] Failed to record audit log (${action}):`, error.message);
    return null;
  }
};

module.exports = {
  logAction
};
