import {randomUUID} from 'node:crypto';
import {supportEvents} from '../../../lib/support-events';
import {supportContext,validSupportOrigin,supportMessage} from '../../../lib/support-access';
import {validateAttachment,MAX_ATTACHMENT} from '../../../lib/support-upload';
export const dynamic='force-dynamic';
export async function GET(request){
 const c=await supportContext();if(!c)return Response.json({error:'Entre na sua conta.'},{status:401});const {sql,user,admin}=c;
 const target=admin?(new URL(request.url).searchParams.get('user')||user.id):user.id;
 const messagesPromise=sql`SELECT m.id,m.sender_id,m.sender_name,m.from_admin,m.body,m.created_at,d.deleted_at,a.id AS attachment_id,a.name AS attachment_name,a.mime AS attachment_mime,a.size AS attachment_size FROM (SELECT id,sender_id,sender_name,from_admin,body,created_at FROM study_messages WHERE thread_user_id=${target} ORDER BY id DESC LIMIT 100) m LEFT JOIN study_message_deletions d ON d.message_id=m.id LEFT JOIN study_attachments a ON a.message_id=m.id AND d.message_id IS NULL ORDER BY m.id`;
 const threadsPromise=admin?sql`SELECT DISTINCT ON (m.thread_user_id) m.thread_user_id,u.name AS sender_name,CASE WHEN d.message_id IS NULL THEN m.body ELSE 'Mensagem apagada' END AS body,m.created_at,m.id AS last_message_id,d.deleted_at FROM study_messages m LEFT JOIN study_message_deletions d ON d.message_id=m.id JOIN neon_auth."user" u ON u.id::text=m.thread_user_id ORDER BY m.thread_user_id,m.id DESC`:Promise.resolve([]);
 const [messages,threads]=await Promise.all([messagesPromise,threadsPromise]);return Response.json({admin,target,messages:messages.map(supportMessage),threads},{headers:{'Cache-Control':'private,no-store'}})
}
export async function POST(request){
 const c=await supportContext();if(!c)return Response.json({error:'Entre na sua conta.'},{status:401});if(!validSupportOrigin(request))return Response.json({error:'Origem inválida.'},{status:403});
 if(Number(request.headers.get('content-length')||0)>MAX_ATTACHMENT+65536)return Response.json({error:'Envie um arquivo de até 3 MB.'},{status:413});
 let input,bytes,meta;
 try{if(request.headers.get('content-type')?.includes('multipart/form-data')){const form=await request.formData();input={body:form.get('body')||'',user:form.get('user')};const file=form.get('file');if(file&&typeof file.arrayBuffer==='function'&&file.size){if(file.size>MAX_ATTACHMENT)throw Error('Envie um arquivo de até 3 MB.');bytes=Buffer.from(await file.arrayBuffer());meta=validateAttachment(bytes,file.name)}}else input=await request.json()}catch(error){return Response.json({error:meta? 'Arquivo inválido.':error.message||'Dados inválidos.'},{status:400})}
 if(!input||typeof input.body!=='string'||input.body.length>4000||(!input.body.trim()&&!meta))return Response.json({error:'Escreva uma mensagem ou escolha um anexo ou áudio.'},{status:400});
 const {sql,user,admin}=c,target=admin&&typeof input.user==='string'?input.user:user.id;
 const body=input.body.trim()||(meta.mime.startsWith('audio/')?'🎙 Áudio: ':meta.mime==='application/pdf'?'📎 PDF: ':'📷 Imagem: ')+meta.name;
 let message;
 if(meta){const id=randomUUID();const [row]=await sql`WITH message AS (INSERT INTO study_messages(thread_user_id,sender_id,sender_name,from_admin,body) VALUES(${target},${user.id},${user.name},${admin},${body}) RETURNING id,sender_id,sender_name,from_admin,body,created_at), attached AS (INSERT INTO study_attachments(id,message_id,name,mime,size,content) SELECT ${id},id,${meta.name},${meta.mime},${meta.size},decode(${bytes.toString('base64')},'base64') FROM message RETURNING id,name,mime,size) SELECT message.*,attached.id AS attachment_id,attached.name AS attachment_name,attached.mime AS attachment_mime,attached.size AS attachment_size FROM message CROSS JOIN attached`;message=supportMessage(row)}
 else{const [row]=await sql`INSERT INTO study_messages(thread_user_id,sender_id,sender_name,from_admin,body) VALUES(${target},${user.id},${user.name},${admin},${body}) RETURNING id,sender_id,sender_name,from_admin,body,created_at`;message={...row,attachment:null}}
 supportEvents.emit('message',{id:String(message.id),threadUserId:target,threadName:!admin?user.name:undefined,senderId:user.id,message});return Response.json({ok:true,message},{headers:{'Cache-Control':'private,no-store'}})
}
