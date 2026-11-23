import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import crypto from 'crypto';
const COOKIE='kk_session';
function secret(){return process.env.SESSION_SECRET||'development-only-change-this-secret';}
export function createSessionToken(){const stamp=Date.now().toString();return stamp+'.'+crypto.createHmac('sha256',secret()).update(stamp).digest('hex');}
export function verifyToken(token:string){const [stamp,sig]=token.split('.');if(!stamp||!sig)return false;const expected=crypto.createHmac('sha256',secret()).update(stamp).digest('hex');return crypto.timingSafeEqual(Buffer.from(sig),Buffer.from(expected))&&Date.now()-Number(stamp)<1000*60*60*24*14;}
export async function isLoggedIn(){const c=await cookies();const token=c.get(COOKIE)?.value;return !!token&&verifyToken(token);}
export async function requireAuth(){if(!await isLoggedIn())redirect('/login');}
export const sessionCookie=COOKIE;
