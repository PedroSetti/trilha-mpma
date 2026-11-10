import {auth} from '../../../lib/auth';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
export const dynamic='force-dynamic';
export async function GET(request,{params}){
 const {data}=await auth.getSession();
 if(!data?.user)return Response.redirect(new URL('/auth/sign-in',request.url));
 const {path:parts=[]}=await params;const file=parts.length?parts.join('/'):'index.html';
 if(!/^[a-zA-Z0-9_-]+\.(html|js|css)$/.test(file))return new Response('Não encontrado',{status:404});
 try{const body=await readFile(path.join(process.cwd(),'study',file));return new Response(body,{headers:{'Content-Type':file.endsWith('.js')?'text/javascript; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':'text/html; charset=utf-8','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}})}catch{return new Response('Não encontrado',{status:404})}
}
