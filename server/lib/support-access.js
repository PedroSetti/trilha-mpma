import {auth} from './auth';
import {neon} from '@neondatabase/serverless';
export async function supportContext(){const {data}=await auth.getSession();if(!data?.user)return null;const sql=neon(process.env.DATABASE_URL);const roles=await sql`SELECT user_id FROM study_admins WHERE user_id=${data.user.id}`;return {user:data.user,sql,admin:roles.length>0}}
export function validSupportOrigin(request){return ['https://trilha-concursos-pedro.netlify.app','https://trilha-concursos-pedro.onrender.com',...(request.headers.get('host')==='localhost:3000'?['http://localhost:3000']:[])].includes(request.headers.get('origin'))}
export function attachmentMeta(row){return row.attachment_id?{id:row.attachment_id,name:row.attachment_name,mime:row.attachment_mime,size:row.attachment_size,url:'/api/call-adm/attachments/'+row.attachment_id+'/'}:null}
export function supportMessage(row){const {attachment_id,attachment_name,attachment_mime,attachment_size,...message}=row;return {...message,attachment:attachmentMeta(row)}}
