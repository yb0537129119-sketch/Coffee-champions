import {json,digest,passwordHash,randomToken,cookieHeader} from "./_auth.js";
export async function onRequestPost({request,env}){
  try{
    const {username,password}=await request.json();
    if(typeof username!=="string"||typeof password!=="string"||username.length>100||password.length>200)return json({error:"פרטי הכניסה אינם תקינים."},400);
    const user=await env.COFFEE_DB.prepare("SELECT username,role,branch,password_hash,password_salt FROM users WHERE username=?").bind(username.trim()).first();
    if(!user||await passwordHash(password,user.password_salt)!==user.password_hash)return json({error:"שם משתמש או סיסמה שגויים."},401);
    const token=randomToken(),tokenHash=await digest(token);
    await env.COFFEE_DB.prepare("DELETE FROM sessions WHERE expires_at<=datetime('now')").run();
    await env.COFFEE_DB.prepare("INSERT INTO sessions(token_hash,username,expires_at) VALUES(?,?,datetime('now','+7 days'))").bind(tokenHash,user.username).run();
    return json({ok:true,user:{username:user.username,role:user.role,branch:user.branch}},200,{ "Set-Cookie":cookieHeader(token) });
  }catch{return json({error:"לא ניתן להתחבר כרגע."},500)}
}