import AuditLog from "../models/AuditLog.js";

export const createAuditLog = async ({
  userId,
  organizationId,
  action,
  entityType,
  entityId,
  details,
  ipAddress,
}) => {
  const auditLog = await AuditLog.create({
    userId,
    organizationId,
    action,
    entityType,
    entityId,
    details,
    ipAddress,
  });

  return auditLog;
};
