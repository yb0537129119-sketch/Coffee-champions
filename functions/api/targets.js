import {json,requireAuth,sameOrigin} from "./_auth.js";
const BRANCHES=['תל אביב','צפת','אשדוד אזור ג','אשדוד אזור ז','רחובות','מודיעין','קריית ספר','בית שמש נעימי','בית שמש רמה א','בית שמש רמה ד','ירושלים גאולה','ירושלים בית וגן','פתח תקווה','ביתר עילית A'];
export async function onRequestPut({request,env}){
  try{
    if(!sameOrigin(request))return json({error:"הבקשה נדחתה."},403);
    if(!await requireAuth(request,env,"admin"))return json({error:"נדרשת הרשאת מנהל אזור."},401);
    const {targets}=await request.json();
    if(!targets||BRANCHES.some(b=>!Number.isInteger(Number(targets[b]))||Number(targets[b])<1||Number(targets[b])>1000000))return json({error:"יש להגדיר יעד חיובי לכל 14 הסניפים."},400);
    const stmts=BRANCHES.map(branch=>env.COFFEE_DB.prepare("INSERT INTO targets(branch,target) VALUES(?,?) ON CONFLICT(branch) DO UPDATE SET target=excluded.target").bind(branch,Number(targets[branch])));
    await env.COFFEE_DB.batch(stmts);return json({ok:true});
  }catch{return json({error:"לא ניתן לשמור יעדים."},500)}
}