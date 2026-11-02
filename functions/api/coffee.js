import {json,requireAuth,sameOrigin} from "./_auth.js";
const BRANCHES=["תל אביב","צפת","אשדוד אזור ג","אשדוד אזור ז","רחובות","מודיעין","קריית ספר","בית שמש נעימי","בית שמש רמה א","בית שמש רמה ד","ירושלים גאולה","ירושלים בית וגן","פתח תקווה","ביתר עילית A"];
export async function onRequestPut({request,env}){
  try{
    if(!sameOrigin(request))return json({error:"הבקשה נדחתה."},403);
    if(!await requireAuth(request,env,"admin"))return json({error:"נדרשת הרשאת מנהל אזור."},401);
    const {entries}=await request.json();
    if(!entries||BRANCHES.some(b=>{const x=entries[b]||{};return !Number.isFinite(Number(x.general_progress))||Number(x.general_progress)<0||!Number.isFinite(Number(x.vietnam_progress))||Number(x.vietnam_progress)<0}))return json({error:"יש להזין אחוזים תקינים ולא שליליים לכל סניף."},400);
    const stmts=BRANCHES.map(branch=>{const x=entries[branch];return env.COFFEE_DB.prepare("INSERT INTO coffee_sales(branch,general_progress,vietnam_progress) VALUES(?,?,?) ON CONFLICT(branch) DO UPDATE SET general_progress=excluded.general_progress,vietnam_progress=excluded.vietnam_progress,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now')").bind(branch,Number(x.general_progress),Number(x.vietnam_progress))});
    await env.COFFEE_DB.batch(stmts);return json({ok:true});
  }catch{return json({error:"לא ניתן לשמור אחוזי התקדמות בתחרות."},500)}
}