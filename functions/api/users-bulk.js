import {json,requireAuth,sameOrigin,passwordHash,randomToken} from "./_auth.js";
const BRANCHES=["ביתר עילית A","ביתר עילית B","בית שמש רמה א","בית שמש רמה ד","בית שמש נעימי","צפת","תל אביב","קריית ספר","מודיעין","אשדוד ג","אשדוד ז","בני ברק","פתח תקווה","רחובות"];
export async function onRequestPost({request,env}){
 try{
  if(!sameOrigin(request))return json({error:"הבקשה נדחתה."},403);
  const admin=await requireAuth(request,env,"admin");
  if(!admin)return json({error:"נדרשת כניסת מנהל אזור."},401);
  const body=await request.json();
  if(!Array.isArray(body.accounts)||body.accounts.length!==BRANCHES.length)return json({error:"יש לשלוח רשימה מלאה של 14 סניפים."},400);
  const seen=new Set(),statements=[];
  for(const item of body.accounts){
   const branch=String(item.branch||"").trim(),password=String(item.password||"");
   if(!BRANCHES.includes(branch)||seen.has(branch))return json({error:"נמצא סניף לא תקין או כפול ברשימה."},400);
   if(!/^\\d{10,20}$/.test(password))return json({error:"כל סיסמה חייבת להכיל 10 עד 20 ספרות בלבד."},400);
   seen.add(branch);
   const salt=randomToken(16),hash=await passwordHash(password,salt);
   statements.push(env.COFFEE_DB.prepare("INSERT INTO users(username,role,branch,password_hash,password_salt) VALUES(?, 'branch', ?, ?, ?) ON CONFLICT(username) DO UPDATE SET role='branch',branch=excluded.branch,password_hash=excluded.password_hash,password_salt=excluded.password_salt").bind(branch,branch,hash,salt));
   statements.push(env.COFFEE_DB.prepare("DELETE FROM sessions WHERE username=?").bind(branch));
  }
  if(seen.size!==BRANCHES.length||BRANCHES.some(b=>!seen.has(b)))return json({error:"חסרים סניפים ברשימה."},400);
  await env.COFFEE_DB.batch(statements);
  return json({ok:true,count:BRANCHES.length,branches:BRANCHES});
 }catch{return json({error:"לא ניתן להגדיר את כל סיסמאות הסניפים."},500)}
}
