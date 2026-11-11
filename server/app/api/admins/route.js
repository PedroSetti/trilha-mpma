import {auth} from '../../../lib/auth';
import {neon} from '@neondatabase/serverless';
import {isMaster,MASTER_USER_ID} from '../../../lib/admin-role';
import {validSupportOrigin} from '../../../lib/support-access';
import {supportEvents} from '../../../lib/support-events';
export const dynamic='force-dynamic';
async function context(){const {data}=await auth.getSession();if(!data?.user)return null;const sql=neon(process.env.DATABASE_URL);const rows=await sql`SELECT user_id FROM study_admins WHERE user_id=${data.user.id}`;return rows.length||isMaster(data.user)?{sql,user:data.user,master:isMaster(data.user)}:null}
export async function GET(){const c=await context();if(!c)return Response.json({error:'Acesso restrito a administradores.'},{status:403});const admins=await c.sql`SELECT a.user_id,u.name,u.email,a.granted_at FROM study_admins a JOIN neon_auth."user" u ON u.id::text=a.user_id ORDER BY a.granted_at`;return Response.json({master:c.master,admins:admins.map(a=>({...a,master:a.user_id===MASTER_USER_ID}))},{headers:{'Cache-Control':'private,no-store'}})}
export async function POST(request){const c=await context();if(!c)return Response.json({error:'Acesso restrito a administradores.'},{status:403});if(!validSupportOrigin(request))return Response.json({error:'Origem inválida.'},{status:403});const body=await request.json().catch(()=>null);if(!body||typeof body.email!=='string'||body.email.length>254)return Response.json({error:'E-mail inválido.'},{status:400});const [user]=await c.sql`SELECT id FROM neon_auth."user" WHERE lower(email)=lower(${body.email.trim()})`;if(!user)return Response.json({error:'Este usuário precisa criar uma conta primeiro.'},{status:404});await c.sql`INSERT INTO study_admins(user_id,granted_by) VALUES(${user.id},${c.user.id}) ON CONFLICT DO NOTHING`;return Response.json({ok:true})}
export async function DELETE(request){
 const c=await context();if(!c?.master)return Response.json({error:'Somente o ADM Master pode remover administradores.'},{status:403});
 if(!validSupportOrigin(request))return Response.json({error:'Origem inválida.'},{status:403});
 const body=await request.json().catch(()=>null);if(!body||typeof body.id!=='string'||body.id.length>100)return Response.json({error:'Administrador inválido.'},{status:400});
 if(body.id===MASTER_USER_ID)return Response.json({error:'O acesso do ADM Master não pode ser removido.'},{status:400});
 const removed=await c.sql`DELETE FROM study_admins WHERE user_id=${body.id} AND user_id<>${MASTER_USER_ID} RETURNING user_id`;
 if(!removed.length)return Response.json({error:'Este usuário já não é administrador.'},{status:404});
 supportEvents.emit('role-change',{userId:body.id});return Response.json({ok:true,message:'Acesso administrativo removido. A conta continua como aluno.'},{headers:{'Cache-Control':'private,no-store'}})
}
