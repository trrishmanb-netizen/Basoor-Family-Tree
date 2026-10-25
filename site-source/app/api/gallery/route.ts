import { getDatabase, getViewer, isSameOrigin, jsonError } from "../../../lib/site-auth";
import { bucket, imageFromForm } from "../../../lib/images";
export async function POST(request:Request){
  try{
    if(!isSameOrigin(request))return jsonError("Request origin is not allowed.",403);
    const viewer=await getViewer(request);if(!viewer?.approved)return jsonError("Approved family access required.",403);
    const image=await imageFromForm(request);if(!image.title)return jsonError("Add a caption.");
    const key=`gallery/${crypto.randomUUID()}`;
    await bucket().put(key,image.bytes,{httpMetadata:{contentType:image.type}});
    await getDatabase().prepare("INSERT INTO gallery(title,object_key,uploader_id) VALUES(?,?,?)").bind(image.title,key,viewer.userId).run();
    return Response.json({message:"Photograph added."});
  }catch(error){return jsonError(error instanceof Error?error.message:"Unable to upload photograph.")}
}
