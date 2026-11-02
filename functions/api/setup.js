import {json,passwordHash,randomToken} from "./_auth.js";
export async function onRequestPost({request,env}){
  try{
    if(!env.BOOTSTRAP_SECRET)return json({error:"חסר סוד אתחול ב-Cloudflare."},503);
    const {secret,password}=await request.json();
    if(typeof secret!=="string"||secret!==env.BOOTSTRAP_SECRET)return json({error:"סוד האתחול שגוי."},403);
    if(typeof password!=="string"||password.length<12||password.length>200)return json({error:"בחר סיסמה באורך 12 תווים לפחות."},400);
    const existing=await env.COFFEE_DB.prepare("SELECT username FROM users WHERE role='admin' LIMIT 1").first();
    if(existing)return json({error:"מנהל האזור כבר הוגדר. האתחול נעול."},409);
    const salt=randomToken(16),hash=await passwordHash(password,salt);
    await env.COFFEE_DB.prepare("INSERT INTO users(username,role,branch,password_hash,password_salt) VALUES('מנהל אזור','admin',NULL,?,?)").bind(hash,salt).run();
    return json({ok:true,message:"מנהל האזור הוגדר. הסר כעת את BOOTSTRAP_SECRET מהגדרות Cloudflare."});
  }catch{return json({error:"האתחול נכשל."},500)}
}