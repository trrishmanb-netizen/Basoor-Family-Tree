import { getCookie, getDatabase, hashToken, cookieHeader, SESSION_COOKIE } from "../../lib/site-auth";
export async function GET(request:Request){
  const token=getCookie(request,SESSION_COOKIE);
  if(token)try{await getDatabase().prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await hashToken(token)).run()}catch{}
  const response=Response.redirect(new URL("/",request.url),302);
  response.headers.append("Set-Cookie",cookieHeader(SESSION_COOKIE,"",0,request));
  return response;
}
