import {json,requireAuth,passwordHash,randomToken,sameOrigin} from "./_auth.js";
const BRANCHES=["ביתר עילית A","ביתר עילית B","בית שמש רמה א","בית שמש רמה ד","בית שמש נעימי","צפת","תל אביב","קריית ספר","מודיעין","אשדוד ג","אשדוד ז","בני ברק","פתח תקווה","רחובות"];
export async function onRequestPost({request,env}){
  try{
    if(!sameOrigin(request))return json({error:"הבקשה נדחתה."},403);
    const admin=await requireAuth(request,env,"admin");
    if(!admin)return json({error:"נדרשת כניסת מנהל אזור."},401);
    const {branch,password}=await request.json();
    if(!BRANCHES.includes(branch)||typeof password!=="string"||password.length<10||password.length>200)return json({error:"יש לבחור סניף ולהגדיר סיסמה באורך 10 תווים לפחות."},400);
    const salt=randomToken(16),hash=await passwordHash(password,salt);
    await env.COFFEE_DB.prepare("INSERT INTO users(username,role,branch,password_hash,password_salt) VALUES(?, 'branch', ?, ?, ?) ON CONFLICT(username) DO UPDATE SET role='branch',branch=excluded.branch,password_hash=excluded.password_hash,password_salt=excluded.password_salt").bind(branch,branch,hash,salt).run();
    await env.COFFEE_DB.prepare("DELETE FROM sessions WHERE username=?").bind(branch).run();
    return json({ok:true,branch});
  }catch{return json({error:"לא ניתן לשמור את סיסמת הסניף."},500)}
}
