import {isMaster} from '../../../lib/admin-role';
import {neon} from '@neondatabase/serverless';
import {verifySupportTicket} from '../../../lib/support-ticket';
import {supportStreamResponse} from '../../../lib/support-stream';
export const dynamic='force-dynamic';
export const runtime='nodejs';
const origins=['https://trilha-concursos-pedro.netlify.app','https://trilha-concursos-pedro.onrender.com','http://localhost:3000'];
function cors(request){const origin=request.headers.get('origin');return origin&&origins.includes(origin)?{'Access-Control-Allow-Origin':origin,'Vary':'Origin'}:{}}
export function OPTIONS(request){if(!origins.includes(request.headers.get('origin')))return new Response(null,{status:403});return new Response(null,{status:204,headers:{...cors(request),'Access-Control-Allow-Methods':'GET, OPTIONS','Access-Control-Allow-Headers':'Authorization','Access-Control-Max-Age':'600'}})}
export async function GET(request){const origin=request.headers.get('origin');if(origin&&!origins.includes(origin))return Response.json({error:'Origem inválida.'},{status:403});const user=verifySupportTicket(request.headers.get('authorization')?.replace(/^Bearer /,''));if(!user)return Response.json({error:'Acesso não autorizado.'},{status:401,headers:cors(request)});const sql=neon(process.env.DATABASE_URL);const roles=await sql`SELECT user_id FROM study_admins WHERE user_id=${user.id}`;const response=supportStreamResponse({user,admin:roles.length>0||isMaster(user),sql,signal:request.signal});for(const [key,value]of Object.entries(cors(request)))response.headers.set(key,value);return response}
