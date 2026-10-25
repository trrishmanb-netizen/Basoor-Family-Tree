import { GITHUB_ORIGIN, SESSION_COOKIE, cookieHeader, field, getDatabase, hashToken, jsonError, randomToken, readJson } from "../../../../lib/site-auth";
import { newSalt, passwordHash } from "../../../../lib/password";
export async function POST(request:Request){
  try{
    const body=await readJson(request),name=field(body.name,100),email=field(body.email,200).toLowerCase(),password=typeof body.password==="string"?body.password:"";
    if(name.length<2||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!password)return jsonError("Enter your name, a valid email, and a password.");
    const db=getDatabase();
    if(await db.prepare("SELECT id FROM accounts WHERE email=?").bind(email).first())return jsonError("An account already exists for this email.",409);
    const id=crypto.randomUUID(),salt=newSalt(),hash=await passwordHash(password,salt);
    await db.prepare("INSERT INTO accounts(id,email,name,password_salt,password_hash,is_admin,last_login_at) VALUES(?,?,?,?,?,?,CURRENT_TIMESTAMP)").bind(id,email,name,salt,hash,0).run();
    const token=randomToken(),tokenHash=await hashToken(token),expiresAt=new Date(Date.now()+30*86400000).toISOString();
    await db.prepare("INSERT INTO sessions(token_hash,user_id,email,name,expires_at) VALUES(?,?,?,?,?)").bind(tokenHash,id,email,name,expiresAt).run();
    const response=Response.json({message:"Account created. Welcome to the family portal.",...(request.headers.get("origin")===GITHUB_ORIGIN?{token}:{})});
    response.headers.append("Set-Cookie",cookieHeader(SESSION_COOKIE,token,30*86400,request));
    return response;
  }catch(error){return jsonError(error instanceof Error?error.message:"Unable to create account.")}
}
