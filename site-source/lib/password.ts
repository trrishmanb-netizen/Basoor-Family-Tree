const ITERATIONS=100000;
function toHex(bytes:Uint8Array):string{return Array.from(bytes,b=>b.toString(16).padStart(2,"0")).join("")}
function fromHex(value:string):Uint8Array{return Uint8Array.from(value.match(/.{1,2}/g)??[],part=>parseInt(part,16))}
export function newSalt():string{return toHex(crypto.getRandomValues(new Uint8Array(16)))}
export async function passwordHash(password:string,salt:string):Promise<string>{
  const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(password),"PBKDF2",false,["deriveBits"]);
  const bits=await crypto.subtle.deriveBits({name:"PBKDF2",hash:"SHA-256",salt:fromHex(salt) as BufferSource,iterations:ITERATIONS},key,256);
  return toHex(new Uint8Array(bits));
}
export async function verifyPassword(password:string,salt:string,expected:string):Promise<boolean>{
  const actual=await passwordHash(password,salt);
  if(actual.length!==expected.length)return false;
  let diff=0;for(let i=0;i<actual.length;i++)diff|=actual.charCodeAt(i)^expected.charCodeAt(i);
  return diff===0;
}
