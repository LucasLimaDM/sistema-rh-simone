import { supabase } from '@/lib/supabase/client'

export async function logAudit(
  entidade: string,
  entidade_id: string,
  acao:
    | 'create'
    | 'update'
    | 'delete'
    | 'clone'
    | 'export'
    | 'approve'
    | 'login'
    | 'upload_assinatura',
  usuario_id: string,
  antes: any = null,
  depois: any = null,
) {
  try {
    await supabase.from('auditoria_documento').insert({
      entidade,
      entidade_id,
      acao,
      usuario_id,
      antes,
      depois,
    })
  } catch (e) {
    console.error('Audit error:', e)
  }
}
