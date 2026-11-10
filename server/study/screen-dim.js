(()=>{
 const key='trilha-screen-gestures';let enabled=localStorage.getItem(key)!=='off';
 const overlay=document.createElement('dialog');overlay.id='screen-dim';overlay.setAttribute('aria-label','Tela escurecida');
 overlay.innerHTML='<div class="dim-instructions"><p>3 toques para acender</p><button type="button" id="screen-wake">Acender tela</button></div>';
 document.body.append(overlay);
 const control=document.createElement('button');control.textContent='☾ Escurecer tela';document.querySelector('aside nav').append(control);
 const appearancePanel=document.getElementById('appearance-dialog'),settings=document.createElement('section');
 settings.className='screen-dim-settings';settings.innerHTML='<h3>Tela escura por toques</h3><label class="reading-toggle"><input type="checkbox" id="screen-gestures"> Ativar 2 toques para escurecer</label><p>Toque duas vezes seguidas numa área livre da página ou da aula, fora do vídeo e dos controles. Na tela escura, toque três vezes para acender. Isso escurece a página; não desliga a tela do aparelho.</p><button type="button" id="screen-dim-now">Escurecer agora</button>';
 appearancePanel.append(settings);const checkbox=settings.querySelector('#screen-gestures');checkbox.checked=enabled;
 const apply=()=>{document.documentElement.dataset.screenGestures=String(enabled);localStorage.setItem(key,enabled?'on':'off')};apply();
 let taps=0,lastTap=0,lastPoint=null,down=null,previousFocus=null,ignoreUntil=0;
 const reset=()=>{taps=0;lastTap=0;lastPoint=null};
 function restore(){if(overlay.open)overlay.close();reset();ignoreUntil=Date.now()+500;previousFocus?.focus?.({preventScroll:true})}
 function dim(){if(overlay.open)return;reset();previousFocus=document.activeElement;overlay.showModal()}
 control.onclick=dim;settings.querySelector('#screen-dim-now').onclick=dim;overlay.querySelector('#screen-wake').onclick=restore;
 overlay.addEventListener('close',()=>{reset();ignoreUntil=Date.now()+500});
 checkbox.onchange=()=>{enabled=checkbox.checked;reset();apply()};
 document.addEventListener('pointerdown',event=>{if(event.isPrimary===false||event.button!==0){down=null;return}down={x:event.clientX,y:event.clientY,time:Date.now(),id:event.pointerId}},true);
 document.addEventListener('pointerup',event=>{
  const now=Date.now(),start=down;down=null;
  if(!start||event.pointerId!==start.id||now-start.time>400||Math.hypot(event.clientX-start.x,event.clientY-start.y)>14||now<ignoreUntil)return;
  if(!overlay.open){
   if(!enabled||event.target.closest('button,a,input,textarea,select,summary,label,iframe,video,[contenteditable=true],nav,[role=button]')){reset();return}
   // A dim gesture must not open over a different settings or form dialog.
   const modal=event.target.closest('dialog');if(modal&&modal.id!=='lesson'){reset();return}
  }
  if(now-lastTap>450||(lastPoint&&Math.hypot(event.clientX-lastPoint.x,event.clientY-lastPoint.y)>80))taps=0;
  taps++;lastTap=now;lastPoint={x:event.clientX,y:event.clientY};
  if(overlay.open&&taps===3){event.preventDefault();restore()}
  else if(!overlay.open&&taps===2){event.preventDefault();dim()}
 },true);
 document.addEventListener('pointercancel',()=>{down=null;reset()},true);
})();
