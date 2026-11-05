import {cookieValue,digest,json,cookieHeader,sameOrigin} from "./_auth.js";
export async function onRequestPost({request,env}){
 if(!sameOrigin(request))return json({error:"הבקשה נדחתה."},403);
 const token=cookieValue(request);
 if(token)await env.COFFEE_DB.prepare("DELETE FROM sessions WHERE token_hash=?").bind(await digest(token)).run();
 return json({ok:true},200,{"Set-Cookie":cookieHeader(""),"Cache-Control":"no-store"});
}