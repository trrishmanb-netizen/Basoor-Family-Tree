import { env } from "cloudflare:workers";
import { getViewer } from "../../../lib/site-auth";
import type { Person } from "../../data/people";
export const dynamic="force-dynamic";
export async function GET(request:Request){
  const viewer=await getViewer(request);
  if(!env.DB)return Response.json({viewer,people:[],profiles:{},events:[],gallery:[]});
  const db=env.DB;
  const [peopleResult,profilesResult,eventsResult]=await Promise.all([
    db.prepare("SELECT id,name,gen,parent_id AS parentId,partner_of AS partnerOf,deceased,gender FROM extra_people ORDER BY created_at,id").all<{id:string;name:string;gen:number;parentId:string|null;partnerOf:string|null;deceased:number;gender:"male"|"female"|"neutral"}>(),
    db.prepare("SELECT member_id AS memberId,name,bio,city,gender,birth_date AS birthDate,address,phone,email,photo_key AS photoKey FROM profile_overrides").all<Record<string,string|null>>(),
    db.prepare("SELECT id,title,event_date AS eventDate,description,author_name AS authorName FROM events ORDER BY event_date DESC,id DESC LIMIT 200").all(),
  ]);
  const profiles:Record<string,Record<string,string|null>>={};
  for(const row of profilesResult.results){
    const {memberId,...rest}=row;
    if(!memberId)continue;
    profiles[memberId]=viewer?.admin?rest:{name:rest.name,bio:rest.bio,city:rest.city,gender:rest.gender,photoKey:rest.photoKey};
  }
  const state:Record<string,unknown>={viewer,people:peopleResult.results.map(row=>({...row,deceased:!!row.deceased,source:"added"} as Person)),profiles,events:eventsResult.results,gallery:[]};
  if(viewer?.approved){const result=await db.prepare("SELECT id,title,object_key AS objectKey FROM gallery ORDER BY id DESC LIMIT 200").all<{id:number;title:string;objectKey:string}>();state.gallery=result.results.map(row=>({id:row.id,title:row.title,imageUrl:`/api/photo?key=${encodeURIComponent(row.objectKey)}`}))}
  if(viewer?.admin){
    const [requests,accounts]=await Promise.all([
      db.prepare("SELECT id,name,email,member_id AS memberId,message FROM contact_requests ORDER BY id DESC LIMIT 100").all(),
      db.prepare("SELECT id AS userId,email,name,status,is_admin AS isAdmin,created_at AS createdAt,last_login_at AS lastLoginAt FROM accounts ORDER BY created_at DESC LIMIT 200").all(),
    ]);
    state.requests=requests.results;state.accounts=accounts.results;
  }
  return Response.json(state,{headers:{"cache-control":"no-store"}});
}
