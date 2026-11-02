import {cookieValue,digest,json,cookieHeader} from "./_auth.js";
export async function onRequestPost({request,env}){
  const token=cookieValue(request);
  if(token) await env.COFFEE_DB.prepare("DELETE FROM sessions WHERE token_hash=?").bind(await digest(token)).run();
  return json({ok:true},200,{"Set-Cookie":cookieHeader("")});
}