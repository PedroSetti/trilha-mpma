import {auth} from '../../../lib/auth';
import {neon} from '@neondatabase/serverless';
export const dynamic='force-dynamic';
export async function GET(request){
 const {data}=await auth.getSession();if(!data?.user)return Response.json({error:'Entre na sua conta.'},{status:401});
 const sql=neon(process.env.DATABASE_URL);const role=await sql`SELECT user_id FROM study_admins WHERE user_id=${data.user.id}`;
 if(!role.length)return Response.json({error:'Acesso restrito a administradores.'},{status:403});
 const params=new URL(request.url).searchParams;const search=(params.get('q')||'').trim().slice(0,254);const page=Math.max(0,Math.min(100000,Math.floor(Number(params.get('page'))||0)));const pattern='%'+search.replace(/[\\%_]/g,'\\$&')+'%';
 const [count]=await sql`SELECT count(*)::integer AS total FROM neon_auth."user" WHERE name ILIKE ${pattern} OR email ILIKE ${pattern}`;
 const total=count.total;const pages=Math.max(1,Math.ceil(total/50));const currentPage=Math.min(page,pages-1);
 const users=await sql`SELECT u.name,u.email,u."createdAt" AS created_at,(a.user_id IS NOT NULL) AS is_admin FROM neon_auth."user" u LEFT JOIN study_admins a ON a.user_id=u.id::text WHERE u.name ILIKE ${pattern} OR u.email ILIKE ${pattern} ORDER BY u."createdAt" DESC,u.id LIMIT 50 OFFSET ${currentPage*50}`;
 return Response.json({users,total,page:currentPage,pages,pageSize:50},{headers:{'Cache-Control':'private,no-store'}});
}
