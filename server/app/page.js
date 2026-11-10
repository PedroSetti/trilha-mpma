import {redirect} from 'next/navigation';
import {auth} from '../lib/auth';
export const dynamic="force-dynamic";
export default async function Home(){const {data}=await auth.getSession();redirect(data?.user?'/study/':'/auth/sign-in')}
