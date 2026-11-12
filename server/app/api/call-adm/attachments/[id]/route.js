import {supportContext} from '../../../../../lib/support-access';
export const dynamic='force-dynamic';
export async function GET(request,{params}){
 const c=await supportContext();if(!c)return Response.json({error:'Entre na sua conta.'},{status:401});const {id}=await params;
 if(!/^[a-f0-9-]{36}$/.test(id))return new Response('Não encontrado',{status:404});
 const rows=await c.sql`SELECT a.name,a.mime,encode(a.content,'base64') AS content FROM study_attachments a JOIN study_messages m ON m.id=a.message_id WHERE NOT EXISTS (SELECT 1 FROM study_message_deletions d WHERE d.message_id=m.id) AND a.id=${id} AND (${c.admin} OR m.thread_user_id=${c.user.id})`;
 if(!rows.length)return new Response('Não encontrado',{status:404});const file=rows[0],body=Buffer.from(file.content,'base64');
 const headers={'Content-Type':file.mime,'Content-Length':String(body.length),'Content-Disposition':(file.mime==='application/pdf'?'attachment':'inline')+`; filename="anexo${file.mime==='application/pdf'?'.pdf':''}"; filename*=UTF-8''${encodeURIComponent(file.name)}`,'Cache-Control':'private,no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; sandbox",'Cross-Origin-Resource-Policy':'same-origin','Accept-Ranges':'bytes'};
 const range=request.headers.get('range');if(range){const match=/^bytes=(\d*)-(\d*)$/.exec(range);let start,end;
  if(match&&(match[1]||match[2])){if(!match[1]){const suffix=Number(match[2]);if(Number.isSafeInteger(suffix)&&suffix>0){start=Math.max(0,body.length-suffix);end=body.length-1}}else{start=Number(match[1]);end=match[2]?Math.min(Number(match[2]),body.length-1):body.length-1}}
  if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||end<start||start>=body.length)return new Response(null,{status:416,headers:{...headers,'Content-Length':'0','Content-Range':`bytes */${body.length}`}});
  headers['Content-Range']=`bytes ${start}-${end}/${body.length}`;headers['Content-Length']=String(end-start+1);return new Response(body.subarray(start,end+1),{status:206,headers})
 }
 return new Response(body,{headers})
}
