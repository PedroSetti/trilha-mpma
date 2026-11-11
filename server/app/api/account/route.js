import {isMaster} from '../../../lib/admin-role';
import {auth} from '../../../lib/auth';
import {neon} from '@neondatabase/serverless';
export const dynamic='force-dynamic';
export async function GET(){const {data}=await auth.getSession();if(!data?.user)return Response.json({error:'Entre na sua conta.'},{status:401});const sql=neon(process.env.DATABASE_URL);const [profile]=await sql`SELECT photo,progress FROM study_profiles WHERE user_id=${data.user.id}`;const roles=await sql`SELECT user_id FROM study_admins WHERE user_id=${data.user.id}`;return Response.json({admin:roles.length>0||isMaster(data.user),master:isMaster(data.user),user:{id:data.user.id,name:data.user.name,email:data.user.email},photo:profile?.photo||null,progress:profile?.progress||null},{headers:{'Cache-Control':'private, no-store'}})}
export async function PUT(request){
 const {data}=await auth.getSession();if(!data?.user)return Response.json({error:'Entre na sua conta.'},{status:401});
 if(!['https://trilha-concursos-pedro.netlify.app','https://trilha-concursos-pedro.onrender.com',...(request.headers.get('host')==='localhost:3000'?['http://localhost:3000']:[])].includes(request.headers.get('origin')))return Response.json({error:'Origem inválida.'},{status:403});
 if(Number(request.headers.get('content-length')||0)>1500000)return Response.json({error:'Arquivo muito grande.'},{status:413});
 let body;try{const text=await request.text();if(text.length>1500000)throw Error();body=JSON.parse(text)}catch{return Response.json({error:'Dados inválidos.'},{status:400})}
 const sql=neon(process.env.DATABASE_URL);
 if(Object.hasOwn(body,'photo')){if(body.photo!==null&&(typeof body.photo!=='string'||body.photo.length>400000||!/^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/.test(body.photo)))return Response.json({error:'Foto inválida.'},{status:400});await sql`INSERT INTO study_profiles(user_id,photo) VALUES(${data.user.id},${body.photo}) ON CONFLICT(user_id) DO UPDATE SET photo=EXCLUDED.photo,updated_at=now()`}
 if(Object.hasOwn(body,'progress')){if(!body.progress||typeof body.progress!=='object'||Array.isArray(body.progress)||JSON.stringify(body.progress).length>1000000)return Response.json({error:'Progresso inválido.'},{status:400});await sql`INSERT INTO study_profiles(user_id,progress) VALUES(${data.user.id},${JSON.stringify(body.progress)}::jsonb) ON CONFLICT(user_id) DO UPDATE SET progress=EXCLUDED.progress,updated_at=now()`}
 return Response.json({ok:true});
}
