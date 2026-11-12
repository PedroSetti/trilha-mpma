const supportButton=document.createElement('button');supportButton.textContent='☏ Call Adm';document.querySelector('nav').append(supportButton);
const supportDialog=document.createElement('dialog');supportDialog.id='support-dialog';document.body.append(supportDialog);
let supportTarget=account.user.id,supportSequence=0,supportStream=null,supportConnected=false,supportSending=false;
const supportPending=new Map(),supportDrafts=new Map(),supportUnread=new Map(),supportSeenEvents=new Set(),supportThreads=new Map();
let supportRows=[],supportRowsTarget='',supportFingerprint='';
const supportFiles=new Map();let supportPreviewURL=null;
function supportAttachmentHTML(a){if(!a)return '';const url='/api/call-adm/attachments/'+encodeURIComponent(a.id)+'/';if(a.mime.startsWith('audio/'))return `<div class="support-audio-message"><audio controls preload="none" src="${url}" aria-label="Áudio de ${esc(a.name)}"></audio><a href="${url}" download="${esc(a.name)}">↓ Baixar áudio · ${(a.size/1024).toFixed(0)} KB</a></div>`;return `<a class="support-attachment" href="${url}" target="_blank" rel="noopener">${a.mime.startsWith('image/')?`<img src="${url}" alt="${esc(a.name)}" loading="lazy">`:''}${a.mime==='application/pdf'?'📄':'📷'} ${esc(a.name)} · ${(a.size/1024).toFixed(0)} KB ↗</a>`}
function paintSupportFile(){const box=supportDialog.querySelector('#support-file-preview');if(!box)return;if(supportPreviewURL){URL.revokeObjectURL(supportPreviewURL);supportPreviewURL=null}const file=supportFiles.get(supportTarget);if(!file){box.hidden=true;box.innerHTML='';return}if(file.type.startsWith('image/')||file.type.startsWith('audio/'))supportPreviewURL=URL.createObjectURL(file);box.hidden=false;box.innerHTML=`${supportPreviewURL?(file.type.startsWith('audio/')?`<audio controls src="${supportPreviewURL}" aria-label="Prévia do áudio"></audio>`:`<img src="${supportPreviewURL}" alt="Prévia do anexo">`):''}<span>${esc(file.name)} · ${(file.size/1024).toFixed(0)} KB</span><br><button type="button" id="remove-support-file">Remover anexo</button>`;box.querySelector('button').onclick=()=>{supportFiles.delete(supportTarget);supportDialog.querySelector('#support-file').value='';paintSupportFile()}}
const supportMessageHTML=m=>`<article class="message ${m.from_admin?'admin-message':''} ${m.sender_id===account.user.id?'own-message':''} ${m.pending?'pending-message':''}" data-message-id="${esc(m.id)}"><strong>${esc(m.sender_name)}${m.from_admin?' · Administração':''}</strong><small>${esc(new Date(m.created_at).toLocaleString('pt-BR'))}${m.pending?' · Enviando…':''}</small><p>${esc(m.body)}</p>${supportAttachmentHTML(m.attachment)}</article>`;
const supportCompare=(a,b)=>{const x=BigInt(a||0),y=BigInt(b||0);return x<y?-1:x>y?1:0};
function supportBadge(){if(window.paintNotificationBadge){window.paintNotificationBadge();return}const count=[...supportUnread.values()].reduce((a,b)=>a+b,0);supportButton.textContent='☏ Call Adm'+(count?' · '+count+' nova(s)':'');supportButton.classList.toggle('has-unread',count>0)}
function supportClearUnread(){supportUnread.delete(supportTarget);supportUnread.delete('*');supportBadge();window.markSupportConversationRead?.(supportTarget,supportRows.at(-1)?.id)}
function supportStatus(text){const node=supportDialog.querySelector('#support-status');if(node)node.textContent=text}
function mergeSupportRows(rows){const merged=new Map((supportRowsTarget===supportTarget?supportRows:[]).map(m=>[String(m.id),m]));for(const row of rows)merged.set(String(row.id),row);supportRows=[...merged.values()].sort((a,b)=>supportCompare(a.id,b.id)).slice(-100);supportRowsTarget=supportTarget}
function paintSupportMessages(forceBottom=false){
 const box=supportDialog.querySelector('.support-messages');if(!box)return;const atBottom=box.scrollHeight-box.scrollTop-box.clientHeight<70;
 const visibleRows=[...supportRows,...[...supportPending.values()].filter(m=>m.target===supportTarget&&!supportRows.some(saved=>saved.sender_id===account.user.id&&saved.body===m.body&&new Date(saved.created_at).getTime()>=new Date(m.created_at).getTime()-2000))];
 const signature=supportTarget+'|'+visibleRows.map(m=>m.id).join(',');
 if(signature!==supportFingerprint){const previous=box.scrollTop,keptAudio=new Map([...(box.querySelectorAll?.('audio')||[])].map(audio=>[audio.src,audio]));box.innerHTML=visibleRows.map(supportMessageHTML).join('')||'<p>Nenhuma mensagem ainda. Comece a conversa abaixo.</p>';for(const audio of box.querySelectorAll?.('audio')||[]){const kept=keptAudio.get(audio.src);if(kept){audio.replaceWith(kept);keptAudio.delete(audio.src)}}for(const audio of keptAudio.values())audio.pause();supportFingerprint=signature;box.scrollTop=forceBottom||atBottom?box.scrollHeight:previous}
}
function mergeSupportThread(row){const previous=supportThreads.get(row.thread_user_id);if(!previous||supportCompare(row.last_message_id,previous.last_message_id)>=0)supportThreads.set(row.thread_user_id,{...previous,...row})}
function paintSupportThreads(){
 if(!account.admin||!supportDialog.open)return;
 const threads=[...supportThreads.values()].filter(t=>t.thread_user_id!==account.user.id).sort((a,b)=>supportCompare(b.last_message_id,a.last_message_id));
 const signature=JSON.stringify([supportTarget,threads.map(t=>[t.thread_user_id,t.last_message_id,supportUnread.has(t.thread_user_id)])]);
 const select=supportDialog.querySelector('#support-thread');
 if(select&&select.dataset.signature!==signature){select.innerHTML=`<option value="${esc(account.user.id)}">Minha conversa</option>`+threads.map(t=>`<option value="${esc(t.thread_user_id)}">${supportUnread.has(t.thread_user_id)?'● Nova · ':''}${esc(t.sender_name)} · ${esc(t.body.slice(0,45))}</option>`).join('');select.value=supportTarget;select.dataset.signature=signature}
 const inbox=supportDialog.querySelector('#support-inbox');
 if(inbox&&inbox.dataset.signature!==signature){const scroll=inbox.scrollLeft;inbox.innerHTML=threads.map(t=>`<button type="button" data-support-user="${esc(t.thread_user_id)}" class="${t.thread_user_id===supportTarget?'active':''}"><strong>${supportUnread.has(t.thread_user_id)?'● Nova · ':''}${esc(t.sender_name)}</strong><span>${esc(t.body.slice(0,100))}</span></button>`).join('');inbox.scrollLeft=scroll;inbox.dataset.signature=signature}
}
function selectSupportThread(target){window.cancelSupportRecording?.();for(const audio of supportDialog.querySelectorAll?.("audio")||[])audio.pause();const input=supportDialog.querySelector('#support-body');supportDrafts.set(supportTarget,input.value);supportTarget=target;input.value=supportDrafts.get(target)||'';supportRows=[];supportRowsTarget=target;supportFingerprint='';supportClearUnread();paintSupportThreads();paintSupportMessages();supportDialog.querySelector('#support-file').value='';paintSupportFile();refreshSupport(true)}
async function refreshSupport(forceBottom=false){
 if(!supportDialog.open)return;const sequence=++supportSequence,target=supportTarget;
 try{const response=await fetch('/api/call-adm/?user='+encodeURIComponent(target),{cache:'no-store'});if(!response.ok)throw Error();const data=await response.json();
  if(sequence!==supportSequence||target!==supportTarget||!supportDialog.open)return;
  mergeSupportRows(data.messages);for(const row of data.threads)mergeSupportThread(row);
  if(!document.hidden)supportClearUnread();paintSupportMessages(forceBottom);paintSupportThreads();supportStatus(supportConnected?'Conectado · mensagens em tempo real.':'Atualização automática ativa.');
 }catch{if(sequence===supportSequence&&supportDialog.open)supportStatus('Reconectando automaticamente. Seu rascunho foi preservado.')}
}
function openSupport(){
 if(supportDialog.open){refreshSupport();return}supportFingerprint='';
 supportDialog.innerHTML=`<button class="close" aria-label="Fechar Call Adm">×</button><span class="eyebrow">FALE COM A ADMINISTRAÇÃO</span><h2>Call Adm</h2><p>${account.admin?'Responda às dúvidas e mensagens dos usuários.':'Envie uma dúvida ou sugestão. A administração responde por aqui.'}</p>${account.admin?'<label>Conversa<select id="support-thread"><option>Carregando conversas…</option></select></label><div id="support-inbox" class="support-inbox" aria-label="Conversas do atendimento"></div>':''}<div class="support-messages" role="log" aria-label="Mensagens da conversa" aria-live="polite" aria-relevant="additions"><p>Carregando conversa…</p></div><form id="support-form"><label>Sua mensagem<textarea id="support-body" maxlength="4000" rows="3" aria-describedby="support-enter-hint" placeholder="Escreva sua mensagem…">${esc(supportDrafts.get(supportTarget)||'')}</textarea></label><small id="support-enter-hint">Enter envia · Shift+Enter faz uma nova linha.</small><div class="support-audio-controls"><button type="button" id="support-record">🎙 Gravar áudio</button><button type="button" id="support-record-stop" hidden>Parar e revisar</button><button type="button" id="support-record-cancel" hidden>Cancelar gravação</button><small id="support-record-status" role="status"></small></div><div class="support-file-picker"><label>Imagem, PDF ou áudio<input id="support-file" type="file" accept="image/jpeg,image/png,image/webp,application/pdf,audio/webm,audio/ogg,audio/mp4,audio/mpeg,.pdf,.webm,.ogg,.m4a,.mp3"></label><small>Um anexo por mensagem · JPG, PNG, WebP, PDF ou áudio · até 3 MB</small><div id="support-file-preview" class="support-file-preview" hidden></div></div><button type="submit" ${supportSending?'disabled':''}>${supportSending?'Enviando…':'Enviar mensagem'}</button></form><p id="support-status" role="status">Conectando…</p>`;
 supportDialog.showModal();const picker=supportDialog.querySelector('#support-file');picker.onchange=()=>{const file=picker.files[0];if(file&&file.size>3*1024*1024){picker.value='';supportStatus('Escolha um arquivo de até 3 MB.');return}if(file)supportFiles.set(supportTarget,file);else supportFiles.delete(supportTarget);paintSupportFile()};paintSupportFile();const input=supportDialog.querySelector('#support-body');input.oninput=()=>supportDrafts.set(supportTarget,input.value);
 const select=supportDialog.querySelector('#support-thread');if(select)select.onchange=()=>selectSupportThread(select.value);
 const inbox=supportDialog.querySelector('#support-inbox');if(inbox)inbox.onclick=event=>{const button=event.target.closest('[data-support-user]');if(button)selectSupportThread(button.dataset.supportUser)};
 supportDialog.querySelector('form').onsubmit=sendSupport;window.bindSupportAudio?.();paintSupportThreads();refreshSupport(true);
}
async function sendSupport(event){
 event.preventDefault();if(window.isSupportRecording?.())return supportStatus('Pare e revise o áudio antes de enviar.');if(supportSending)return;const input=supportDialog.querySelector('#support-body'),body=input.value.trim(),target=supportTarget,file=supportFiles.get(target);if(!body&&!file)return;
 supportSending=true;const pendingId='pending-'+crypto.randomUUID();supportPending.set(pendingId,{id:pendingId,target,sender_id:account.user.id,sender_name:account.user.name,from_admin:account.admin,body,created_at:new Date().toISOString(),pending:true});paintSupportMessages(true);
 const button=event.currentTarget.querySelector('button[type=submit]');button.disabled=true;button.textContent='Enviando…';supportStatus('Enviando mensagem…');
 try{let payload;if(file){payload=new FormData();payload.set('body',body);payload.set('user',target);payload.set('file',file)}const response=await fetch('/api/call-adm/',{method:'POST',...(file?{body:payload}:{headers:{'Content-Type':'application/json'},body:JSON.stringify({user:target,body})})});const data=await response.json();if(!response.ok)throw Error(data.error||'Não foi possível enviar.');if(supportFiles.get(target)===file){supportFiles.delete(target);if(supportTarget===target){supportDialog.querySelector('#support-file').value='';paintSupportFile()}}supportPending.delete(pendingId);supportSequence++;
  if(supportDialog.open&&supportTarget===target){if(input.value.trim()===body){input.value='';supportDrafts.delete(target)}if(data.message)mergeSupportRows([data.message]);paintSupportMessages(true);supportStatus('Mensagem enviada.')}
  else if(supportDrafts.get(target)?.trim()===body)supportDrafts.delete(target);
 }catch(error){supportPending.delete(pendingId);paintSupportMessages();if(supportDialog.open)supportStatus((error.message||'Não foi possível enviar.')+' O texto e o anexo foram preservados.')}
 finally{supportSending=false;const current=supportDialog.querySelector('#support-form button[type=submit]');if(current){current.disabled=false;current.textContent='Enviar mensagem'}}
}
function receiveSupportUpdate(event){
 let data;try{data=JSON.parse(event.data)}catch{return}const key=String(data.id||'');if(key&&supportSeenEvents.has(key))return;
 if(key){supportSeenEvents.add(key);if(supportSeenEvents.size>1000)supportSeenEvents.delete(supportSeenEvents.values().next().value)}
 const selected=supportDialog.open&&data.threadUserId===supportTarget;
 if(data.senderId!==account.user.id&&(!selected||document.hidden)){const target=data.threadUserId||'*';supportUnread.set(target,(supportUnread.get(target)||0)+1);supportBadge()}
 if(data.message){
  if(account.admin){const previous=supportThreads.get(data.threadUserId);mergeSupportThread({thread_user_id:data.threadUserId,sender_name:data.threadName||previous?.sender_name||(!data.message.from_admin?data.message.sender_name:'Usuário'),body:data.message.body,created_at:data.message.created_at,last_message_id:data.message.id})}
  if(selected){mergeSupportRows([data.message]);paintSupportMessages();if(!document.hidden)supportClearUnread()}
  paintSupportThreads();if(supportDialog.open)supportStatus('Conectado · mensagens em tempo real.');
 }else if(supportDialog.open)refreshSupport();
 window.dispatchEvent(new CustomEvent('study-support-message',{detail:data}));
}
function connectSupport(){
 if(supportStream)return;let stopped=false,controller=null;supportStream={close(){stopped=true;controller?.abort()}};
 const dispatch=(event,data)=>{if(event==='role-change'){location.reload();return}if(event==='notifications'){window.dispatchEvent(new Event('study-notifications-sync'));return}if(event==='message')receiveSupportUpdate({data});else if((event==='ready'||event==='sync')&&supportDialog.open)refreshSupport()};
 (async()=>{while(!stopped){try{
  controller=new AbortController();const issued=await fetch('/api/call-adm/ticket/',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}',signal:controller.signal,cache:'no-store'});if(!issued.ok)throw Error();const access=await issued.json();
  const response=await fetch(access.url,{headers:{Authorization:'Bearer '+access.ticket},credentials:'omit',signal:controller.signal,cache:'no-store'});if(!response.ok||!response.body)throw Error();
  supportConnected=true;window.dispatchEvent(new Event('study-support-connected'));if(supportDialog.open){supportStatus('Conectado · mensagens em tempo real.');refreshSupport()}
  const reader=response.body.getReader(),decoder=new TextDecoder();let buffer='';
  while(!stopped){const {value,done}=await reader.read();if(done)break;buffer+=decoder.decode(value,{stream:true}).replace(/\r\n/g,'\n');let end;
   while((end=buffer.indexOf('\n\n'))>=0){const frame=buffer.slice(0,end);buffer=buffer.slice(end+2);let event='message',data='';for(const line of frame.split('\n')){if(line.startsWith('event:'))event=line.slice(6).trim();if(line.startsWith('data:'))data+=line.slice(5).trim()}if(data)dispatch(event,data)}
  }
  supportConnected=false;
 }catch{if(!stopped){supportConnected=false;if(supportDialog.open)supportStatus('Reconectando automaticamente. Seu rascunho foi preservado.');await new Promise(resolve=>setTimeout(resolve,1500))}}}})();
}
supportButton.onclick=openSupport;connectSupport();
const supportFallback=setInterval(()=>{if(!supportConnected&&supportDialog.open&&!document.hidden)refreshSupport()},1500);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&supportDialog.open)refreshSupport()});
window.addEventListener('pagehide',()=>{supportStream?.close();supportStream=null;clearInterval(supportFallback)});
window.addEventListener('pageshow',event=>{if(event.persisted)connectSupport()});

