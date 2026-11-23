import { NextResponse } from 'next/server';
import { sessionCookie } from '@/lib/auth';
export async function POST(req:Request){const r=NextResponse.redirect(new URL('/login',req.url));r.cookies.set(sessionCookie,'',{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/',maxAge:0});return r;}
