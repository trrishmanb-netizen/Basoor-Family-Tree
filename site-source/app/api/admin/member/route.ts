import { getDatabase, getViewer, jsonError, readJson, field } from "../../../../lib/site-auth";
import { people } from "../../../data/people";
export async function POST(request:Request){
  try{
    const viewer=await getViewer(request);if(!viewer?.admin)return jsonError("Administrator access required.",403);
    const body=await readJson(request),name=field(body.name,120),parentId=field(body.parentId,100);
    if(name.length<2||!parentId)return jsonError("Choose a parent branch and enter a name.");
    const db=getDatabase();
    const source=people.find(p=>p.id===parentId);
    const extra=source?null:await db.prepare("SELECT gen FROM extra_people WHERE id=?").bind(parentId).first<{gen:number}>();
    const gen=source?.gen??extra?.gen;if(!gen||gen>=12)return jsonError("Parent branch was not found.");
    await db.prepare("INSERT INTO extra_people(id,name,gen,parent_id,partner_of,deceased,gender) VALUES(?,?,?,?,?,?,?)").bind(`added-${crypto.randomUUID()}`,name,gen+1,parentId,null,body.deceased==="true"?1:0,["male","female"].includes(field(body.gender,10))?field(body.gender,10):"neutral").run();
    return Response.json({message:"Family member added."});
  }catch(error){return jsonError(error instanceof Error?error.message:"Unable to add member.")}
}
