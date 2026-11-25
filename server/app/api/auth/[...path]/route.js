import {auth} from '../../../../lib/auth';
import {anonymousSession} from '../../../../lib/auth-route';
const handler=auth.handler();
export async function GET(request,context){return anonymousSession(request)||handler.GET(request,context)}
export const {POST,PUT,PATCH,DELETE}=handler;
