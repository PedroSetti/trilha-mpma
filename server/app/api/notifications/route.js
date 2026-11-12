import {supportContext,validSupportOrigin} from '../../../lib/support-access';
import {supportEvents} from '../../../lib/support-events';
export const dynamic='force-dynamic';
export async function GET(){
 const c=await supportContext();if(!c)return Response.json({error:'Entre na sua conta.'},{status:401});const {sql,user,admin}=c;
 const rows=await sql`WITH visible AS (SELECT m.id,m.thread_user_id,m.sender_name,m.from_admin,left(m.body,180) AS body,m.created_at,coalesce(r.last_read_id,0) AS last_read_id FROM study_messages m LEFT JOIN study_message_reads r ON r.user_id=${user.id} AND r.thread_user_id=m.thread_user_id WHERE NOT EXISTS (SELECT 1 FROM study_message_deletions d WHERE d.message_id=m.id) AND m.sender_id<>${user.id} AND (${admin} OR m.thread_user_id=${user.id})), counts AS (SELECT thread_user_id,count(*) FILTER(WHERE id>last_read_id)::integer AS unread_count FROM visible GROUP BY thread_user_id), latest AS (SELECT DISTINCT ON(thread_user_id) * FROM visible ORDER BY thread_user_id,id DESC) SELECT l.id::text,l.thread_user_id,l.sender_name,l.from_admin,l.body,l.created_at,u.name AS thread_name,c.unread_count,sum(c.unread_count) OVER()::integer AS total_unread FROM latest l JOIN counts c USING(thread_user_id) LEFT JOIN neon_auth."user" u ON u.id::text=l.thread_user_id ORDER BY l.id DESC LIMIT 50`;
 return Response.json({items:rows.map(({total_unread,...row})=>row),unread:rows[0]?.total_unread||0},{headers:{'Cache-Control':'private,no-store'}})
}
export async function POST(request){
 const c=await supportContext();if(!c)return Response.json({error:'Entre na sua conta.'},{status:401});if(!validSupportOrigin(request))return Response.json({error:'Origem inválida.'},{status:403});
 const input=await request.json().catch(()=>null);if(!input)return Response.json({error:'Dados inválidos.'},{status:400});const {sql,user,admin}=c;
 if(input.action==='all')await sql`INSERT INTO study_message_reads(user_id,thread_user_id,last_read_id) SELECT ${user.id},thread_user_id,max(id) FROM study_messages WHERE sender_id<>${user.id} AND (${admin} OR thread_user_id=${user.id}) GROUP BY thread_user_id ON CONFLICT(user_id,thread_user_id) DO UPDATE SET last_read_id=greatest(study_message_reads.last_read_id,EXCLUDED.last_read_id),updated_at=now()`;
 else if(input.action==='read'&&typeof input.thread==='string'&&/^\d{1,20}$/.test(String(input.id))) {
  const target=admin?input.thread:user.id;
  await sql`INSERT INTO study_message_reads(user_id,thread_user_id,last_read_id) SELECT ${user.id},${target},id FROM study_messages WHERE thread_user_id=${target} AND id=${String(input.id)}::bigint ON CONFLICT(user_id,thread_user_id) DO UPDATE SET last_read_id=greatest(study_message_reads.last_read_id,EXCLUDED.last_read_id),updated_at=now()`;
 }else return Response.json({error:'Dados inválidos.'},{status:400});
 supportEvents.emit('notifications',{userId:user.id});return Response.json({ok:true},{headers:{'Cache-Control':'private,no-store'}})
}
