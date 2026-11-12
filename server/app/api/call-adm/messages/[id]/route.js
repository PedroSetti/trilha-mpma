import {supportContext,validSupportOrigin,supportMessage} from '../../../../../lib/support-access';
import {supportEvents} from '../../../../../lib/support-events';
export const dynamic='force-dynamic';
export async function DELETE(request,{params}){
 const c=await supportContext();if(!c)return Response.json({error:'Entre na sua conta.'},{status:401});
 if(!validSupportOrigin(request))return Response.json({error:'Origem inválida.'},{status:403});
 const {id}=await params;
 if(!/^[1-9]\d{0,18}$/.test(id)||BigInt(id)>9223372036854775807n)return Response.json({error:'Mensagem não encontrada.'},{status:404});
 // Both author and conversation access are checked atomically. Admin status does
 // not permit deleting another person's message; revoked admins lose other threads.
 const [row]=await c.sql`WITH erased AS (
  UPDATE study_messages SET body='Mensagem apagada'
  WHERE id=${id}::bigint AND sender_id=${c.user.id} AND (${c.admin} OR thread_user_id=${c.user.id})
  RETURNING id,thread_user_id,sender_id,sender_name,from_admin,body,created_at
 ), removed_attachments AS (
  DELETE FROM study_attachments WHERE message_id IN (SELECT id FROM erased) RETURNING id
 ), marker AS (
  INSERT INTO study_message_deletions(message_id,deleted_by)
  SELECT id,${c.user.id} FROM erased ON CONFLICT(message_id) DO NOTHING RETURNING id,message_id,deleted_at
 ) SELECT e.*,coalesce(n.deleted_at,d.deleted_at) AS deleted_at,coalesce(n.id,d.id)::text AS deletion_id
 FROM erased e LEFT JOIN marker n ON n.message_id=e.id LEFT JOIN study_message_deletions d ON d.message_id=e.id`;
 if(!row)return Response.json({error:'Mensagem não encontrada ou não pertence a você.'},{status:404});
 const {thread_user_id,deletion_id,...safe}=row,message=supportMessage(safe);
 supportEvents.emit('message-delete',{id:String(row.id),deletionId:deletion_id,threadUserId:thread_user_id,senderId:c.user.id,message});
 return Response.json({ok:true,message},{headers:{'Cache-Control':'private,no-store'}});
}
