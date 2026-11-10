import {auth} from './lib/auth';
export default auth.middleware({loginUrl:'/auth/sign-in',publicRoutes:['/health','/api/password-requests']});
export const config={matcher:['/((?!_next/static|_next/image|favicon.ico).*)']};
