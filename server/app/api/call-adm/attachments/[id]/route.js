import {supportContext} from '../../../../../lib/support-access';
export const dynamic='force-dynamic';
export async function GET(request,{params}){
 const c=await supportContext();if(!c)return Response.json({error:'Entre na sua conta.'},{status:401});const {id}=await params;
 if(!/^[a-f0-9-]{36}$/.test(id))return new Response('Não encontrado',{status:404});
 const rows=await c.sql`SELECT a.name,a.mime,encode(a.content,'base64') AS content FROM study_attachments a JOIN study_messages m ON m.id=a.message_id WHERE a.id=${id} AND (${c.admin} OR m.thread_user_id=${c.user.id})`;
 if(!rows.length)return new Response('Não encontrado',{status:404});const file=rows[0],body=Buffer.from(file.content,'base64');
 return new Response(body,{headers:{'Content-Type':file.mime,'Content-Length':String(body.length),'Content-Disposition':(file.mime==='application/pdf'?'attachment':'inline')+`; filename="anexo${file.mime==='application/pdf'?'.pdf':''}"; filename*=UTF-8''${encodeURIComponent(file.name)}`,'Cache-Control':'private,no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; sandbox",'Cross-Origin-Resource-Policy':'same-origin'}})
}
