import {supportEvents} from './support-events';
export function supportStreamResponse({user,admin,sql,signal}){
 const encoder=new TextEncoder();let cleanup=()=>{};
 const stream=new ReadableStream({start(controller){
  let active=true,lastId=null,checking=false;
  const send=(event,value,id)=>{if(!active)return;controller.enqueue(encoder.encode(`${id?`id: ${id}\n`:''}event: ${event}\ndata: ${JSON.stringify(value)}\n\n`))};
  const onMessage=message=>{if(admin||message.threadUserId===user.id)send('message',message,message.id)};
  supportEvents.on('message',onMessage);
  const poll=async()=>{if(!active||checking)return;checking=true;try{const [row]=admin?await sql`SELECT coalesce(max(id),0)::text AS latest FROM study_messages`:await sql`SELECT coalesce(max(id),0)::text AS latest FROM study_messages WHERE thread_user_id=${user.id}`;if(!active)return;if(lastId===null)send('ready',{latestId:row.latest});else if(lastId!==row.latest)send('sync',{latestId:row.latest});lastId=row.latest}catch{if(active)send('retry',{message:'Reconectando automaticamente.'})}finally{checking=false}};
  const interval=setInterval(poll,2000),heartbeat=setInterval(()=>{if(active)controller.enqueue(encoder.encode(': keepalive\n\n'))},5000);
  const timeout=setTimeout(()=>{cleanup();try{controller.close()}catch{}},20000);
  cleanup=()=>{if(!active)return;active=false;clearInterval(interval);clearInterval(heartbeat);clearTimeout(timeout);supportEvents.off('message',onMessage);signal.removeEventListener('abort',abort)};
  const abort=()=>{cleanup();try{controller.close()}catch{}};signal.addEventListener('abort',abort,{once:true});
  controller.enqueue(encoder.encode('retry: 1000\n\n'));if(signal.aborted)abort();else poll();
 },cancel(){cleanup()}});
 return new Response(stream,{headers:{'Content-Type':'text/event-stream; charset=utf-8','Cache-Control':'private, no-cache, no-store, no-transform','X-Accel-Buffering':'no'}});
}
