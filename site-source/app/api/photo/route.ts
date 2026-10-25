import { getViewer, jsonError } from "../../../lib/site-auth";
import { bucket } from "../../../lib/images";
export async function GET(request:Request){
  try{
    const key=new URL(request.url).searchParams.get("key")||"";
    if(key.length>200||!/^(profile|gallery)\/[a-f0-9-]{36}$/.test(key))return jsonError("Photograph not found.",404);
    if(key.startsWith("gallery/")){const viewer=await getViewer(request);if(!viewer?.approved)return jsonError("Family access required.",403)}
    const image=await bucket().get(key);if(!image)return jsonError("Photograph not found.",404);
    return new Response(image.body,{headers:{"content-type":image.httpMetadata?.contentType||"application/octet-stream","cache-control":key.startsWith("profile/")?"public, max-age=3600":"private, no-store","x-content-type-options":"nosniff"}});
  }catch{return jsonError("Photograph unavailable.",500)}
}
