import {supportEvents} from './support-events';
export function supportStreamResponse({user,admin,sql,signal}){
 const encoder=new TextEncoder();let cleanup=()=>{};
 const stream=new ReadableStream({start(controller){
  let active=true,lastId=null,checking=false;
  const send=(event,value,id)=>{if(active)controller.enqueue(encoder.encode(`${id?`id: ${id}\n`:''}event: ${event}\ndata: ${JSON.stringify(value)}\n\n`))};
  const onMessage=message=>{if(admin||message.threadUserId===user.id)send('message',message,message.id)};
  supportEvents.on('message',onMessage);
  const poll=async()=>{
   if(!active||checking)return;checking=true;
   try{
    if(lastId===null){
     const [row]=admin?await sql`SELECT coalesce(max(id),0)::text AS latest FROM study_messages`:await sql`SELECT coalesce(max(id),0)::text AS latest FROM study_messages WHERE thread_user_id=${user.id}`;
     if(!active)return;lastId=row.latest;send('ready',{latestId:lastId});
    }else{
     // Replay complete rows so different workers do not require an extra client fetch.
     const rows=admin?await sql`SELECT m.id,m.thread_user_id,m.sender_id,m.sender_name,m.from_admin,m.body,m.created_at,u.name AS thread_name FROM study_messages m LEFT JOIN neon_auth."user" u ON u.id::text=m.thread_user_id WHERE m.id>${lastId}::bigint ORDER BY m.id LIMIT 100`:await sql`SELECT id,thread_user_id,sender_id,sender_name,from_admin,body,created_at FROM study_messages WHERE thread_user_id=${user.id} AND id>${lastId}::bigint ORDER BY id LIMIT 100`;
     if(!active)return;
     for(const row of rows){const {thread_user_id,thread_name,...message}=row;lastId=String(row.id);send('message',{id:lastId,threadUserId:thread_user_id,threadName:thread_name||(!admin?user.name:undefined),senderId:row.sender_id,message},lastId)}
    }
   }catch{if(active)send('retry',{message:'Reconectando automaticamente.'})}finally{checking=false}
  };
  const interval=setInterval(poll,1000),heartbeat=setInterval(()=>{if(active)controller.enqueue(encoder.encode(': keepalive\n\n'))},10000);
  // Direct Render streams do not need the former 20-second proxy cutoff.
  const timeout=setTimeout(()=>{cleanup();try{controller.close()}catch{}},240000);
  const abort=()=>{cleanup();try{controller.close()}catch{}};
  cleanup=()=>{if(!active)return;active=false;clearInterval(interval);clearInterval(heartbeat);clearTimeout(timeout);supportEvents.off('message',onMessage);signal.removeEventListener('abort',abort)};
  signal.addEventListener('abort',abort,{once:true});controller.enqueue(encoder.encode('retry: 1000\n\n'));if(signal.aborted)abort();else poll();
 },cancel(){cleanup()}});
 return new Response(stream,{headers:{'Content-Type':'text/event-stream; charset=utf-8','Cache-Control':'private, no-cache, no-store, no-transform','X-Accel-Buffering':'no'}});
}
