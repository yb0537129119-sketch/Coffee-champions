import {json,requireAuth} from "./_auth.js";
export async function onRequestGet({request,env}){
  try{
    const user=await requireAuth(request,env);
    if(!user)return json({error:"יש להתחבר כדי לצפות בדיווחים."},401);
    const result=user.role==="admin"
      ? await env.COFFEE_DB.prepare("SELECT id,branch,employee,subscriptions,created_at FROM reports ORDER BY created_at DESC").all()
      : await env.COFFEE_DB.prepare("SELECT id,branch,employee,subscriptions,created_at FROM reports WHERE branch=? ORDER BY created_at DESC").bind(user.branch).all();
    return json({reports:result.results||[]});
  }catch{return json({error:"לא ניתן לטעון דיווחים."},500)}
}