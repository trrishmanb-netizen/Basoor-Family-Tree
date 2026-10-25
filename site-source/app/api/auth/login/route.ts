import { GITHUB_ORIGIN, SESSION_COOKIE, cookieHeader, field, getDatabase, hashToken, jsonError, randomToken, readJson } from "../../../../lib/site-auth";
import { verifyPassword } from "../../../../lib/password";
export async function POST(request:Request){
  try{
    const body=await readJson(request),email=field(body.email,200).toLowerCase(),password=typeof body.password==="string"?body.password:"";
    if(!email||!password)return jsonError("Enter your email and password.");
    const db=getDatabase();
    const account=await db.prepare("SELECT id,email,name,password_salt AS salt,password_hash AS hash,status,failed_count AS failedCount,locked_until AS lockedUntil FROM accounts WHERE email=?").bind(email).first<{id:string;email:string;name:string;salt:string;hash:string;status:string;failedCount:number;lockedUntil:string|null}>();
    if(!account||account.status!=="active")return jsonError("Email or password is incorrect.",401);
    if(account.lockedUntil&&Date.parse(account.lockedUntil)>Date.now())return jsonError("Too many attempts. Try again later.",429);
    if(!await verifyPassword(password,account.salt,account.hash)){
      const count=account.failedCount+1,until=count>=5?new Date(Date.now()+15*60000).toISOString():null;
      await db.prepare("UPDATE accounts SET failed_count=?,locked_until=? WHERE id=?").bind(count>=5?0:count,until,account.id).run();
      return jsonError("Email or password is incorrect.",401);
    }
    await db.prepare("UPDATE accounts SET failed_count=0,locked_until=NULL,last_login_at=CURRENT_TIMESTAMP WHERE id=?").bind(account.id).run();
    const token=randomToken(),tokenHash=await hashToken(token),expiresAt=new Date(Date.now()+30*86400000).toISOString();
    await db.prepare("INSERT INTO sessions(token_hash,user_id,email,name,expires_at) VALUES(?,?,?,?,?)").bind(tokenHash,account.id,account.email,account.name,expiresAt).run();
    const response=Response.json({message:"Signed in.",...(request.headers.get("origin")===GITHUB_ORIGIN?{token}:{})});
    response.headers.append("Set-Cookie",cookieHeader(SESSION_COOKIE,token,30*86400,request));
    return response;
  }catch(error){return jsonError(error instanceof Error?error.message:"Unable to sign in.")}
}
