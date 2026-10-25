import { getDatabase, getViewer, isSameOrigin, jsonError } from "../../../lib/site-auth";
import { bucket, imageFromForm } from "../../../lib/images";
import { people } from "../../data/people";
export async function POST(request:Request){
  try{
    if(!isSameOrigin(request))return jsonError("Request origin is not allowed.",403);
    const viewer=await getViewer(request);if(!viewer?.admin)return jsonError("Only the family administrator can edit profiles.",403);
    const image=await imageFromForm(request),memberId=image.memberId;
    if(!memberId)return jsonError("Choose a family member.",400);
    const db=getDatabase();
    if(!people.some(p=>p.id===memberId)&&!await db.prepare("SELECT id FROM extra_people WHERE id=?").bind(memberId).first())return jsonError("Member not found.",404);
    const key=`profile/${crypto.randomUUID()}`;
    await bucket().put(key,image.bytes,{httpMetadata:{contentType:image.type}});
    await db.prepare("INSERT INTO profile_overrides(member_id,photo_key) VALUES(?,?) ON CONFLICT(member_id) DO UPDATE SET photo_key=excluded.photo_key,updated_at=CURRENT_TIMESTAMP").bind(memberId,key).run();
    return Response.json({message:"Profile photograph updated."});
  }catch(error){return jsonError(error instanceof Error?error.message:"Unable to upload photograph.")}
}
