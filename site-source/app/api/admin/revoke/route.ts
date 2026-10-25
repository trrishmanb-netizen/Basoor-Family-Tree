import { getDatabase, getViewer, jsonError, readJson, field } from "../../../../lib/site-auth";
export async function POST(request:Request){
  try{
    const viewer=await getViewer(request);if(!viewer?.admin)return jsonError("Administrator access required.",403);
    const body=await readJson(request),userId=field(body.userId,100),action=field(body.action,20);
    if(!userId||userId===viewer.userId||!["revoke","restore"].includes(action))return jsonError("Invalid account action.");
    const db=getDatabase();
    const row=await db.prepare("SELECT is_admin AS isAdmin FROM accounts WHERE id=?").bind(userId).first<{isAdmin:number}>();
    if(!row||row.isAdmin)return jsonError("Account cannot be changed.",403);
    await db.prepare("UPDATE accounts SET status=? WHERE id=?").bind(action==="revoke"?"revoked":"active",userId).run();
    if(action==="revoke")await db.prepare("DELETE FROM sessions WHERE user_id=?").bind(userId).run();
    return Response.json({message:action==="revoke"?"Account access revoked.":"Account access restored."});
  }catch(error){return jsonError(error instanceof Error?error.message:"Unable to change account access.")}
}
