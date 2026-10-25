import { getDatabase, getViewer, jsonError, readJson, field } from "../../../lib/site-auth";
export async function POST(request:Request){
  try{
    const viewer=await getViewer(request);if(!viewer?.approved)return jsonError("Approved family access required.",403);
    const body=await readJson(request),title=field(body.title,120),eventDate=field(body.eventDate,20),description=field(body.description,3000);
    if(title.length<3||description.length<5||!/^\d{4}-\d{2}-\d{2}$/.test(eventDate))return jsonError("Please complete the event details.");
    await getDatabase().prepare("INSERT INTO events(title,event_date,description,author_name,author_id) VALUES(?,?,?,?,?)").bind(title,eventDate,description,viewer.name,viewer.userId).run();
    return Response.json({message:"Event posted."});
  }catch(error){return jsonError(error instanceof Error?error.message:"Unable to post event.")}
}
