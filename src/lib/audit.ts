import pb from '@/lib/pocketbase/client'

export async function logAudit(
  entity: string,
  entity_id: string,
  action:
    | 'create'
    | 'update'
    | 'delete'
    | 'clone'
    | 'export'
    | 'approve'
    | 'login'
    | 'upload_assinatura',
  user_id: string,
  before: any = null,
  after: any = null,
) {
  try {
    await pb.collection('audit_logs').create({
      entity,
      entity_id,
      action,
      user_id,
      before,
      after,
    })
  } catch (e) {
    console.error('Audit error:', e)
  }
}
