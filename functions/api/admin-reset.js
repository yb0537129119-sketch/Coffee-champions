import {json,sameOrigin,requireAuth} from "./_auth.js";
const BRANCHES=["ביתר עילית A","ביתר עילית B"];
const EMPLOYEES=["יהודה בן גיגי","נהוראי מלכה","אוריאל דוד פנחסי","ישי אלמקייס"];
export async function onRequestPost({request,env}){try{
 if(!sameOrigin(request))return json({error:"הבקשה נדחתה."},403);
 const admin=await requireAuth(request,env,"admin");if(!admin)return json({error:"נדרשת הרשאת מנהל אזור."},403);
 const body=await request.json(),branch=String(body.branch||""),employee=String(body.employee||"");
 if(!BRANCHES.includes(branch))return json({error:"יש לבחור סניף תקין."},400);
 if(!EMPLOYEES.includes(employee))return json({error:"יש לבחור עובד תקין."},400);
 await env.COFFEE_DB.batch([
  env.COFFEE_DB.prepare("DELETE FROM subscription_receipts WHERE branch=? AND employee=?").bind(branch,employee),
  env.COFFEE_DB.prepare("UPDATE employee_subscriptions SET subscriptions=0,receipt_data=NULL,receipt_type=NULL,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE branch=? AND employee=?").bind(branch,employee)
 ]);
 return json({ok:true,branch,employee});
 }catch{return json({error:"לא ניתן לאפס את העובד. ודא שמסד הנתונים מעודכן."},500)}}