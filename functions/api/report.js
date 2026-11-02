import {json,requireAuth,sameOrigin} from "./_auth.js";
export async function onRequestPost({request,env}){
  try{
    if(!sameOrigin(request))return json({error:"הבקשה נדחתה."},403);
    const user=await requireAuth(request,env,"branch");
    if(!user)return json({error:"יש להתחבר עם משתמש הסניף."},401);
    const body=await request.json(),employee=String(body.employee||"").trim(),subscriptions=Number(body.subscriptions);
    if(!employee||employee.length>100||!Number.isInteger(subscriptions)||subscriptions<1||subscriptions>10000)return json({error:"פרטי הדיווח אינם תקינים."},400);
    await env.COFFEE_DB.prepare("INSERT INTO reports(branch,employee,subscriptions) VALUES(?,?,?)").bind(user.branch,employee,subscriptions).run();
    return json({ok:true});
  }catch{return json({error:"לא ניתן לשמור דיווח."},500)}
}