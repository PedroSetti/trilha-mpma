import {MASTER_USER_ID} from './admin-role';
import {supportEvents} from './support-events';
import {supportMessage} from './support-access';
export function supportStreamResponse({user,admin,sql,signal}){
 const encoder=new TextEncoder();let cleanup=()=>{};
 const stream=new ReadableStream({start(controller){
  let active=true,lastId=null,checking=false;
  const send=(event,value,id)=>{if(active)controller.enqueue(encoder.encode(`${id?`id: ${id}\n`:''}event: ${event}\ndata: ${JSON.stringify(value)}\n\n`))};
  const onMessage=message=>{if(admin||message.threadUserId===user.id)send('message',message,message.id)};
  supportEvents.on('message',onMessage);const onRead=event=>{if(event.userId===user.id)send('notifications',{})};supportEvents.on('notifications',onRead);const onRole=event=>{if(event.userId===user.id){send('role-change',{});cleanup();try{controller.close()}catch{}}};supportEvents.on('role-change',onRole);
  const poll=async()=>{
   if(!active||checking)return;checking=true;
   try{
    if(admin&&user.id!==MASTER_USER_ID){const roles=await sql`SELECT user_id FROM study_admins WHERE user_id=${user.id}`;if(!active)return;if(!roles.length){onRole({userId:user.id});return}}
    if(lastId===null){
     const [row]=admin?await sql`SELECT coalesce(max(id),0)::text AS latest FROM study_messages`:await sql`SELECT coalesce(max(id),0)::text AS latest FROM study_messages WHERE thread_user_id=${user.id}`;
     if(!active)return;lastId=row.latest;send('ready',{latestId:lastId});
    }else{
     // Replay complete rows so different workers do not require an extra client fetch.
     const rows=admin?await sql`SELECT m.id,m.thread_user_id,m.sender_id,m.sender_name,m.from_admin,m.body,m.created_at,a.id AS attachment_id,a.name AS attachment_name,a.mime AS attachment_mime,a.size AS attachment_size,u.name AS thread_name FROM study_messages m LEFT JOIN study_attachments a ON a.message_id=m.id LEFT JOIN neon_auth."user" u ON u.id::text=m.thread_user_id WHERE m.id>${lastId}::bigint ORDER BY m.id LIMIT 100`:await sql`SELECT m.id,m.thread_user_id,m.sender_id,m.sender_name,m.from_admin,m.body,m.created_at,a.id AS attachment_id,a.name AS attachment_name,a.mime AS attachment_mime,a.size AS attachment_size FROM study_messages m LEFT JOIN study_attachments a ON a.message_id=m.id WHERE m.thread_user_id=${user.id} AND m.id>${lastId}::bigint ORDER BY m.id LIMIT 100`;
     if(!active)return;
     for(const row of rows){const {thread_user_id,thread_name,...message}=row;lastId=String(row.id);send('message',{id:lastId,threadUserId:thread_user_id,threadName:thread_name||(!admin?user.name:undefined),senderId:row.sender_id,message:supportMessage(message)},lastId)}
    }
   }catch{if(active)send('retry',{message:'Reconectando automaticamente.'})}finally{checking=false}
  };
  const interval=setInterval(poll,1000),heartbeat=setInterval(()=>{if(active)controller.enqueue(encoder.encode(': keepalive\n\n'))},10000);
  // Direct Render streams do not need the former 20-second proxy cutoff.
  const timeout=setTimeout(()=>{cleanup();try{controller.close()}catch{}},240000);
  const abort=()=>{cleanup();try{controller.close()}catch{}};
  cleanup=()=>{if(!active)return;active=false;clearInterval(interval);clearInterval(heartbeat);clearTimeout(timeout);supportEvents.off('message',onMessage);supportEvents.off('notifications',onRead);supportEvents.off('role-change',onRole);signal.removeEventListener('abort',abort)};
  signal.addEventListener('abort',abort,{once:true});controller.enqueue(encoder.encode('retry: 1000\n\n'));if(signal.aborted)abort();else poll();
 },cancel(){cleanup()}});
 return new Response(stream,{headers:{'Content-Type':'text/event-stream; charset=utf-8','Cache-Control':'private, no-cache, no-store, no-transform','X-Accel-Buffering':'no'}});
}
