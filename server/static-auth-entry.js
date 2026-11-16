import {createAuthClient} from '@neon/auth/next';
const client=createAuthClient();let mode='login',busy=false;
const form=document.getElementById('auth-form'),message=document.getElementById('auth-message');
function render(){document.getElementById('auth-title').textContent=({login:'Bom ter você por aqui.',signup:'Crie sua conta',forgot:'Esqueci minha senha',reset:'Redefinir senha'})[mode];document.getElementById('auth-intro').textContent=({login:'Entre na sua conta para continuar a preparação.',signup:'Cadastre-se para acessar as trilhas e salvar seu progresso.',forgot:'Informe seu e-mail. A administração poderá enviar um código de recuperação.',reset:'Use o código recebido por e-mail para escolher uma nova senha.'})[mode];const oldEmail=form.querySelector('[name=email]')?.value||'';form.innerHTML=`${mode==='signup'?'<label>Seu nome<input name="name" autocomplete="name" maxlength="80" required></label>':''}<label>E-mail<input type="email" name="email" autocomplete="email" required maxlength="254"></label>${mode==='reset'?'<label>Código recebido por e-mail<input name="otp" autocomplete="one-time-code" required maxlength="12"></label>':''}${mode!=='forgot'?`<label>${mode==='reset'?'Nova senha':'Senha'}<input type="password" name="password" autocomplete="${mode==='login'?'current-password':'new-password'}" minlength="8" maxlength="128" required></label>`:''}${mode==='reset'?'<label>Confirme a nova senha<input type="password" name="confirm" autocomplete="new-password" minlength="8" maxlength="128" required></label>':''}<button>${({login:'Entrar',signup:'Criar conta e começar',forgot:'Solicitar código à administração',reset:'Alterar senha'})[mode]}</button>`;form.querySelector('[name=email]').value=oldEmail;document.getElementById('forgot-password').hidden=mode!=='login';document.getElementById('auth-switch').textContent=mode==='login'?'Ainda não tem conta? Cadastre-se →':'Voltar para entrar →'}
document.getElementById('forgot-password').onclick=()=>{mode='forgot';message.textContent='';render()};document.getElementById('auth-switch').onclick=()=>{mode=mode==='login'?'signup':'login';message.textContent='';render()};
const authConnectionDelay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function waitForAuthConnection(){
 for(let attempt=0;attempt<7;attempt++){
  message.textContent=attempt?'Ainda conectando com segurança. Tentando novamente automaticamente…':'Conectando com segurança à sua conta…';
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);
  try{
   const response=await fetch('/api/auth/get-session/',{cache:'no-store',credentials:'same-origin',signal:controller.signal,headers:{Accept:'application/json'}});
   if(response.status===429)throw Object.assign(Error('Muitas tentativas. Aguarde alguns minutos antes de entrar novamente.'),{permanent:true});
   if(response.ok&&response.headers.get('content-type')?.includes('application/json')){await response.json();return}
  }catch(error){if(error.permanent)throw error}finally{clearTimeout(timeout)}
  if(attempt<6)await authConnectionDelay(2000);
 }
 throw Error('A conexão está demorando mais que o esperado. Seu cadastro foi preservado. Aguarde um pouco e clique em Entrar novamente.');
}
async function signInWithConnectionRecovery(credentials){
 for(let attempt=0;attempt<2;attempt++){
  await waitForAuthConnection();
  try{const result=await client.signIn.email(credentials);const status=Number(result.error?.status||result.error?.statusCode||0);if(attempt===0&&status>=500){await authConnectionDelay(1500);continue}return result}
  catch(error){if(attempt===1)throw Error('Não foi possível concluir a conexão. Aguarde um instante e tente entrar novamente.');await authConnectionDelay(1500)}
 }
}

form.onsubmit=async event=>{event.preventDefault();if(busy)return;busy=true;const button=form.querySelector('button');button.disabled=true;button.textContent='Aguarde…';message.textContent='';const f=new FormData(form);try{if(mode==='forgot'){const r=await fetch('/api/password-requests/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:f.get('email').trim()})});if(!r.ok)throw Error();const body=await r.json();mode='reset';render();message.textContent=body.message;return}if(mode==='reset'){if(f.get('password')!==f.get('confirm')){message.textContent='As senhas precisam ser iguais.';return}const {error}=await client.emailOtp.resetPassword({email:f.get('email').trim(),otp:f.get('otp').trim(),password:f.get('password')});if(error){message.textContent='Código inválido ou expirado. Solicite um novo envio.';return}mode='login';render();message.textContent='Senha alterada. Entre com sua nova senha.';return}const result=mode==='signup'?await client.signUp.email({name:f.get('name').trim(),email:f.get('email').trim(),password:f.get('password')}):await signInWithConnectionRecovery({email:f.get('email').trim(),password:f.get('password')});if(result.error){const code=result.error.code||'';message.textContent=/INVALID_EMAIL_OR_PASSWORD|INVALID_PASSWORD/.test(code)?'E-mail ou senha incorretos.':/USER_ALREADY_EXISTS/.test(code)?'Este e-mail já possui conta. Entre para continuar.':result.error.message||'Não foi possível entrar. Tente novamente.'}else if(result.data?.user||result.data?.session)location.replace('/study/');else message.textContent='Confira seu e-mail para verificar a conta.'}catch(error){message.textContent=error.message||'Não foi possível conectar à sua conta. Aguarde um instante e tente novamente.'}finally{busy=false;const b=form.querySelector('button');b.disabled=false;b.textContent=({login:'Entrar',signup:'Criar conta e começar',forgot:'Solicitar código à administração',reset:'Alterar senha'})[mode]}};
client.getSession().then(result=>{if(result.data?.user&&!busy&&mode==='login')location.replace('/study/')}).catch(()=>{});
const initialPassword=form.querySelector('[name=password]')?.value||'';render();form.querySelector('[name=password]').value=initialPassword;
