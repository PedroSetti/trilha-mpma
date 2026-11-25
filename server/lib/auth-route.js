// An absent token is always anonymous. Let the SDK validate every supplied token.
export function anonymousSession(request){
 const url=new URL(request.url);
 if(request.method!=='GET'||url.pathname.replace(/\/+$/,'')!=='/api/auth/get-session')return null;
 const cookies=request.headers.get('cookie')||'';
 if(/(?:^|;\s*)(?:__Secure-)?neon-auth\.session_token=[^;\s]+/.test(cookies))return null;
 // OAuth verification and authorization headers still go through the SDK.
 if(request.headers.has('authorization')||url.searchParams.has('neon_auth_session_verifier'))return null;
 return Response.json(null,{headers:{'Cache-Control':'private, no-store'}});
}
