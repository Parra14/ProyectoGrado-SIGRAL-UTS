import AuditLog from '../models/AuditLog';

interface AuditParams {
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  metadata?: any;
}

const logAudit = async ({
  userId,
  action,
  entity,
  entityId,
  metadata
}: AuditParams) => {
  try {
    await AuditLog.create({
      userId,
      action,
      entity,
      entityId,
      metadata
    });
  } catch (error) {
    console.error('Error registrando auditoría', error);
  }
};

export default logAudit;