import {createAuthClient} from '@neon/auth/next';
const client=createAuthClient();let mode='login',busy=false;
const form=document.getElementById('auth-form'),message=document.getElementById('auth-message');
function render(){document.getElementById('auth-title').textContent=({login:'Bom ter você por aqui.',signup:'Crie sua conta',forgot:'Esqueci minha senha',reset:'Redefinir senha'})[mode];document.getElementById('auth-intro').textContent=({login:'Entre na sua conta para continuar a preparação.',signup:'Cadastre-se para acessar as trilhas e salvar seu progresso.',forgot:'Informe seu e-mail. A administração poderá enviar um código de recuperação.',reset:'Use o código recebido por e-mail para escolher uma nova senha.'})[mode];const oldEmail=form.querySelector('[name=email]')?.value||'';form.innerHTML=`${mode==='signup'?'<label>Seu nome<input name="name" autocomplete="name" maxlength="80" required></label>':''}<label>E-mail<input type="email" name="email" autocomplete="email" required maxlength="254"></label>${mode==='reset'?'<label>Código recebido por e-mail<input name="otp" autocomplete="one-time-code" required maxlength="12"></label>':''}${mode!=='forgot'?`<label>${mode==='reset'?'Nova senha':'Senha'}<input type="password" name="password" autocomplete="${mode==='login'?'current-password':'new-password'}" minlength="8" maxlength="128" required></label>`:''}${mode==='reset'?'<label>Confirme a nova senha<input type="password" name="confirm" autocomplete="new-password" minlength="8" maxlength="128" required></label>':''}<button>${({login:'Entrar',signup:'Criar conta e começar',forgot:'Solicitar código à administração',reset:'Alterar senha'})[mode]}</button>`;form.querySelector('[name=email]').value=oldEmail;document.getElementById('forgot-password').hidden=mode!=='login';document.getElementById('auth-switch').textContent=mode==='login'?'Ainda não tem conta? Cadastre-se →':'Voltar para entrar →'}
document.getElementById('forgot-password').onclick=()=>{if(busy)return;mode='forgot';message.textContent='';render()};document.getElementById('auth-switch').onclick=()=>{if(busy)return;mode=mode==='login'?'signup':'login';message.textContent='';render()};
const authConnectionDelay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const authCooldownKey='trilha-auth-retry-until-v1';
let authRetryUntil=0,authCooldownTimer;
try{authRetryUntil=Number(sessionStorage.getItem(authCooldownKey))||0}catch{}
function authCooldownSeconds(){return Math.max(0,Math.ceil((authRetryUntil-Date.now())/1000))}
function authCooldownMessage(){return `O acesso foi temporariamente limitado. Tente novamente em ${authCooldownSeconds()} segundos.`}
function refreshAuthButton(){
 const b=form.querySelector('button'),seconds=authCooldownSeconds();
 b.disabled=busy||seconds>0;
 if(!busy)b.textContent=seconds?`Aguarde ${seconds}s`:({login:'Entrar',signup:'Criar conta e começar',forgot:'Solicitar código à administração',reset:'Alterar senha'})[mode];
 if(seconds&&!busy)message.textContent=authCooldownMessage();
 if(!seconds){clearInterval(authCooldownTimer);authCooldownTimer=undefined;if(message.textContent.startsWith('O acesso foi temporariamente limitado.'))message.textContent='Você já pode tentar entrar novamente.'}
}
function rememberAuthCooldown(response){
 const raw=response.headers.get('retry-after');let seconds=Number(raw);
 if(!Number.isFinite(seconds)||seconds<=0)seconds=Math.ceil((Date.parse(raw)-Date.now())/1000);
 if(!Number.isFinite(seconds)||seconds<=0)seconds=60;
 authRetryUntil=Date.now()+Math.ceil(seconds)*1000;
 try{sessionStorage.setItem(authCooldownKey,String(authRetryUntil))}catch{}
 clearInterval(authCooldownTimer);authCooldownTimer=setInterval(refreshAuthButton,1000);
 return Object.assign(Error(authCooldownMessage()),{permanent:true,status:429});
}
async function waitForAuthConnection(){
 for(let attempt=0;attempt<7;attempt++){
  message.textContent=attempt?'Ainda conectando com segurança. Aguarde, não é preciso clicar novamente…':'Conectando com segurança à sua conta…';
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);
  try{
   // Readiness must never consume the authentication service's request quota.
   const response=await fetch('/api/health/',{cache:'no-store',credentials:'same-origin',signal:controller.signal,headers:{Accept:'application/json'}});
   if(response.status===429)throw rememberAuthCooldown(response);
   if(response.ok&&response.headers.get('content-type')?.includes('application/json')){const body=await response.json();if(body?.status==='ok')return}
  }catch(error){if(error.permanent)throw error}finally{clearTimeout(timeout)}
  if(attempt<6)await authConnectionDelay(Math.min(2000*(attempt+1),6000));
 }
 throw Error('A conexão está demorando. Seu cadastro foi preservado. Tente novamente em instantes.');
}
async function signInWithConnectionRecovery(credentials){
 if(authCooldownSeconds())throw Object.assign(Error(authCooldownMessage()),{permanent:true,status:429});
 await waitForAuthConnection();
 // Send the password once. Network errors and 5xx must not trigger duplicate logins.
 let response;
 try{response=await fetch('/api/auth/sign-in/email/',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(credentials)})}
 catch{throw Error('A conexão foi interrompida. Tente novamente em instantes.')}
 if(response.status===429)throw rememberAuthCooldown(response);
 let body;try{body=await response.json()}catch{throw Error('O serviço de acesso está temporariamente indisponível. Tente novamente em instantes.')}
 if(!response.ok){
  if(response.status>=500)throw Error('O serviço de acesso está temporariamente indisponível. Tente novamente em instantes.');
  return {error:{...body,status:response.status}};
 }
 return {data:body};
}

form.onsubmit=async event=>{event.preventDefault();if(busy)return;if(authCooldownSeconds()){refreshAuthButton();return}busy=true;const button=form.querySelector('button');button.disabled=true;button.textContent='Aguarde…';message.textContent='';const f=new FormData(form);try{if(mode==='forgot'){const r=await fetch('/api/password-requests/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:f.get('email').trim()})});if(!r.ok)throw Error();const body=await r.json();mode='reset';render();message.textContent=body.message;return}if(mode==='reset'){if(f.get('password')!==f.get('confirm')){message.textContent='As senhas precisam ser iguais.';return}const {error}=await client.emailOtp.resetPassword({email:f.get('email').trim(),otp:f.get('otp').trim(),password:f.get('password')});if(error){message.textContent='Código inválido ou expirado. Solicite um novo envio.';return}mode='login';render();message.textContent='Senha alterada. Entre com sua nova senha.';return}const result=mode==='signup'?await client.signUp.email({name:f.get('name').trim(),email:f.get('email').trim(),password:f.get('password')}):await signInWithConnectionRecovery({email:f.get('email').trim(),password:f.get('password')});if(result.error){const code=result.error.code||'';message.textContent=/INVALID_EMAIL_OR_PASSWORD|INVALID_PASSWORD/.test(code)?'E-mail ou senha incorretos.':/USER_ALREADY_EXISTS/.test(code)?'Este e-mail já possui conta. Entre para continuar.':result.error.message||'Não foi possível entrar. Tente novamente.'}else if(result.data?.user||result.data?.session)location.replace('/study/');else message.textContent='Confira seu e-mail para verificar a conta.'}catch(error){message.textContent=error.message||'Não foi possível conectar à sua conta. Aguarde um instante e tente novamente.'}finally{busy=false;refreshAuthButton()}};
client.getSession().then(result=>{if(result.data?.user&&!busy&&mode==='login')location.replace('/study/')}).catch(()=>{});
const initialPassword=form.querySelector('[name=password]')?.value||'';render();form.querySelector('[name=password]').value=initialPassword;

refreshAuthButton();if(authCooldownSeconds())authCooldownTimer=setInterval(refreshAuthButton,1000);
