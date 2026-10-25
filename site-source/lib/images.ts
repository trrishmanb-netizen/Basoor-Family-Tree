import { env } from "cloudflare:workers";
export function bucket():R2Bucket{if(!env.BUCKET)throw new Error("Photo storage is not configured");return env.BUCKET}
export async function imageFromForm(request:Request):Promise<{bytes:ArrayBuffer;type:string;title:string;memberId:string}>{
  if(Number(request.headers.get("content-length")||0)>6_000_000)throw new Error("Image is too large");
  const form=await request.formData(),file=form.get("photo"),title=String(form.get("title")||"").trim().slice(0,120),memberId=String(form.get("memberId")||"").trim().slice(0,100);
  if(!(file instanceof File))throw new Error("Choose a photograph");
  if(file.size<100||file.size>5_000_000)throw new Error("Photographs must be under 5 MB");
  if(!["image/jpeg","image/png","image/webp"].includes(file.type))throw new Error("Use a JPEG, PNG, or WebP image");
  const bytes=await file.arrayBuffer(),b=new Uint8Array(bytes);
  const jpeg=b[0]===0xff&&b[1]===0xd8&&b[2]===0xff;
  const png=b[0]===0x89&&b[1]===0x50&&b[2]===0x4e&&b[3]===0x47;
  const webp=new TextDecoder().decode(b.slice(0,4))==="RIFF"&&new TextDecoder().decode(b.slice(8,12))==="WEBP";
  if((file.type==="image/jpeg"&&!jpeg)||(file.type==="image/png"&&!png)||(file.type==="image/webp"&&!webp))throw new Error("Image format does not match the file");
  return {bytes,type:file.type,title,memberId};
}
