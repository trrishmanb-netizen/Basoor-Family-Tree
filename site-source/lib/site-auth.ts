import { env } from "cloudflare:workers";

export const ADMIN_EMAIL = "trrishman.b@gmail.com";
export const GITHUB_ORIGIN = "https://trrishmanb-netizen.github.io";
export const SESSION_COOKIE = "basoor_session";
export type Viewer = { userId:string; name:string; email:string; approved:boolean; admin:boolean; memberId:string|null };

export function getDatabase(): D1Database {
  if (!env.DB) throw new Error("Family database is not configured");
  return env.DB;
}

export function getCookie(request:Request,name:string):string|null{
  const cookie=request.headers.get("cookie")||"";
  const item=cookie.split(";").map(s=>s.trim()).find(s=>s.startsWith(`${name}=`));
  return item?decodeURIComponent(item.slice(name.length+1)):null;
}

export function cookieHeader(name:string,value:string,maxAge:number,request:Request):string{
  const secure=new URL(request.url).protocol==="https:"?"; Secure":"";
  return `${name}=${encodeURIComponent(value)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export function randomToken():string{
  const bytes=crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes,b=>b.toString(16).padStart(2,"0")).join("");
}

export async function hashToken(token:string):Promise<string>{
  const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,"0")).join("");
}

export async function getViewer(request:Request):Promise<Viewer|null>{
  const token=getSessionToken(request);
  if(!token||!env.DB)return null;
  const row=await env.DB.prepare("SELECT user_id AS userId, email, name, expires_at AS expiresAt FROM sessions WHERE token_hash = ?").bind(await hashToken(token)).first<{userId:string;email:string;name:string;expiresAt:string}>();
  if(!row||Date.parse(row.expiresAt)<Date.now())return null;
  const account=await env.DB.prepare("SELECT is_admin AS isAdmin, status FROM accounts WHERE id=?").bind(row.userId).first<{isAdmin:number;status:string}>();
  if(!account||account.status!=="active")return null;
  return {userId:row.userId,name:row.name,email:row.email,admin:!!account.isAdmin,approved:true,memberId:null};
}

export function getSessionToken(request:Request):string|null{
  const auth=request.headers.get("authorization")||"";
  if(request.headers.get("origin")===GITHUB_ORIGIN&&auth.startsWith("Bearer "))return auth.slice(7);
  return getCookie(request,SESSION_COOKIE);
}

export function jsonError(message:string,status=400):Response{
  return Response.json({error:message},{status});
}

export function isSameOrigin(request:Request):boolean{
  const origin=request.headers.get("origin");
  if(origin===GITHUB_ORIGIN)return true;
  if(origin&&origin!==new URL(request.url).origin)return false;
  return request.headers.get("sec-fetch-site")!=="cross-site";
}

export async function readJson(request:Request):Promise<Record<string,unknown>>{
  if(!isSameOrigin(request))throw new Error("Request origin is not allowed");
  if(Number(request.headers.get("content-length")||0)>10000)throw new Error("Request is too large");
  const value=await request.json();
  if(!value||typeof value!=="object"||Array.isArray(value))throw new Error("Invalid request");
  return value as Record<string,unknown>;
}

export function field(value:unknown,max:number):string{
  return typeof value==="string"?value.trim().slice(0,max):"";
}
