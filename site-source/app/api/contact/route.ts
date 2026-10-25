import { getDatabase, jsonError, readJson, field } from "../../../lib/site-auth";
export async function POST(request:Request){
  try{
    const body=await readJson(request);
    if(field(body.website,200))return Response.json({message:"Request received."});
    const name=field(body.name,100),email=field(body.email,200),memberId=field(body.memberId,100),message=field(body.message,3000);
    if(name.length<2||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||message.length<10)return jsonError("Please provide your name, email, and a message of at least 10 characters.");
    const db=getDatabase();
    const today=new Date().toISOString().slice(0,10);
    const count=await db.prepare("SELECT COUNT(*) AS count FROM contact_requests WHERE email=? AND created_at>=?").bind(email,today).first<{count:number}>();
    if((count?.count??0)>=3)return jsonError("Please wait before sending another request.",429);
    await db.prepare("INSERT INTO contact_requests(name,email,member_id,message,email_status) VALUES(?,?,?,?,'dashboard')").bind(name,email,memberId||null,message).run();
    return Response.json({message:"Request saved for Trrishman in the admin dashboard."});
  }catch(error){return jsonError(error instanceof Error?error.message:"Unable to send request.")}
}
