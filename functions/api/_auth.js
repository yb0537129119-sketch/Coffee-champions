const enc = new TextEncoder();
const COOKIE = "__Host-cc_session";
export const json = (data, status=200, headers={}) => Response.json(data,{status,headers});
export function cookieValue(request){
  const raw=request.headers.get("Cookie")||"";
  const item=raw.split(";").map(x=>x.trim()).find(x=>x.startsWith(COOKIE+"="));
  return item ? decodeURIComponent(item.slice(COOKIE.length+1)) : "";
}
export async function digest(value){
  const bytes=await crypto.subtle.digest("SHA-256",enc.encode(value));
  return [...new Uint8Array(bytes)].map(x=>x.toString(16).padStart(2,"0")).join("");
}
export async function passwordHash(password,salt){
  const key=await crypto.subtle.importKey("raw",enc.encode(password),"PBKDF2",false,["deriveBits"]);
  const bits=await crypto.subtle.deriveBits({name:"PBKDF2",salt:enc.encode(salt),iterations:100000,hash:"SHA-256"},key,256);
  return [...new Uint8Array(bits)].map(x=>x.toString(16).padStart(2,"0")).join("");
}
export function randomToken(bytes=32){
  const b=crypto.getRandomValues(new Uint8Array(bytes));
  return btoa(String.fromCharCode(...b)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}
export function cookieHeader(token,maxAge=604800){
  return token ? `${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}` : `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}
export function sameOrigin(request){
  const origin=request.headers.get("Origin");
  return !!origin && origin===new URL(request.url).origin;
}
export async function requireAuth(request,env,role){
  const token=cookieValue(request);
  if(!token) return null;
  const row=await env.COFFEE_DB.prepare(`SELECT u.username,u.role,u.branch FROM sessions s JOIN users u ON u.username=s.username WHERE s.token_hash=? AND s.expires_at > datetime('now')`).bind(await digest(token)).first();
  if(!row || (role && row.role!==role)) return null;
  return row;
}
