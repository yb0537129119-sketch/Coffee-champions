import {json,sameOrigin,requireAuth,canAccessBranch} from "./_auth.js";
const BRANCHES=["ביתר עילית A","ביתר עילית B","בית שמש רמה א","בית שמש רמה ד","בית שמש נעימי","צפת","תל אביב","קריית ספר","מודיעין","אשדוד ג","אשדוד ז","בני ברק","פתח תקווה","רחובות"];
export async function onRequestPost({request,env}){try{
 if(!sameOrigin(request))return json({error:"הבקשה נדחתה."},403);
 const user=await requireAuth(request,env);if(!user)return json({error:"נדרשת התחברות."},401);
 const body=await request.json(),requested=String(body.branch||""),branch=user.role==="admin"?requested:user.branch,employee=String(body.employee||"");
 if(!BRANCHES.includes(branch)||!canAccessBranch(user,branch)||(user.role==="branch"&&requested&&requested!==user.branch))return json({error:"אין הרשאה לאפס נתונים בסניף הזה."},403);
 if(!await env.COFFEE_DB.prepare("SELECT 1 AS ok FROM branch_employees WHERE branch=? AND employee=?").bind(branch,employee).first())return json({error:"יש לבחור עובד הרשום בסניף."},400);
 await env.COFFEE_DB.batch([
  env.COFFEE_DB.prepare("DELETE FROM subscription_receipts WHERE branch=? AND employee=?").bind(branch,employee),
  env.COFFEE_DB.prepare("UPDATE employee_subscriptions SET subscriptions=0,receipt_data=NULL,receipt_type=NULL,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE branch=? AND employee=?").bind(branch,employee)
 ]);
 return json({ok:true,branch,employee});
 }catch{return json({error:"לא ניתן לאפס את העובד. ודא שמסד הנתונים מעודכן."},500)}}