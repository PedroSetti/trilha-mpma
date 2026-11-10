import {auth} from '../../../../lib/auth';
import {neon} from '@neondatabase/serverless';
import {supportStreamResponse} from '../../../../lib/support-stream';
export const dynamic='force-dynamic';
export const runtime='nodejs';
export async function GET(request){const {data}=await auth.getSession();if(!data?.user)return Response.json({error:'Entre na sua conta.'},{status:401});const sql=neon(process.env.DATABASE_URL);const roles=await sql`SELECT user_id FROM study_admins WHERE user_id=${data.user.id}`;return supportStreamResponse({user:data.user,admin:roles.length>0,sql,signal:request.signal})}
