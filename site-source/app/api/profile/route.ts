import { getDatabase, getViewer, isSameOrigin, jsonError, readJson, field } from "../../../lib/site-auth";
import { people } from "../../data/people";
export async function POST(request:Request){
  try{
    if(!isSameOrigin(request))return jsonError("Request origin is not allowed.",403);
    const viewer=await getViewer(request);if(!viewer?.admin)return jsonError("Only the family administrator can edit profiles.",403);
    const body=await readJson(request),memberId=field(body.memberId,100);
    if(!memberId)return jsonError("Choose a family member.",400);
    const db=getDatabase();
    if(!people.some(p=>p.id===memberId)&&!await db.prepare("SELECT id FROM extra_people WHERE id=?").bind(memberId).first())return jsonError("Member not found.",404);
    const name=field(body.name,120),bio=field(body.bio,3000),city=field(body.city,120),gender=field(body.gender,10),birthDate=field(body.birthDate,20),email=field(body.email,200),phone=field(body.phone,50);
    if(gender&&!(["male","female","neutral","draft"].includes(gender)))return jsonError("Choose a valid card colour.");
    if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return jsonError("Enter a valid email address.");
    if(birthDate&&!/^\d{4}-\d{2}-\d{2}$/.test(birthDate))return jsonError("Enter a valid date.");
    await db.prepare("INSERT INTO profile_overrides(member_id,name,bio,city,gender,birth_date,email,phone) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(member_id) DO UPDATE SET name=COALESCE(excluded.name,profile_overrides.name),bio=COALESCE(excluded.bio,profile_overrides.bio),city=COALESCE(excluded.city,profile_overrides.city),gender=CASE WHEN ?='draft' THEN NULL ELSE COALESCE(excluded.gender,profile_overrides.gender) END,birth_date=COALESCE(excluded.birth_date,profile_overrides.birth_date),email=COALESCE(excluded.email,profile_overrides.email),phone=COALESCE(excluded.phone,profile_overrides.phone),updated_at=CURRENT_TIMESTAMP").bind(memberId,name||null,bio||null,city||null,["male","female","neutral"].includes(gender)?gender:null,birthDate||null,email||null,phone||null,gender).run();
    return Response.json({message:"Profile saved."});
  }catch(error){return jsonError(error instanceof Error?error.message:"Unable to save profile.")}
}
