import {json,requireAuth,canAccessBranch} from "./_auth.js";
export async function onRequestGet({request,env}){try{
 
 const user=await requireAuth(request,env);if(!user)return json({error:"נדרשת התחברות."},401);
 const requested=new URL(request.url).searchParams.get("branch"),branch=user.role==="admin"?requested:user.branch;
 if(!["ביתר עילית A","ביתר עילית B","בית שמש רמה א","בית שמש רמה ד","בית שמש נעימי","צפת","תל אביב","קריית ספר","מודיעין","אשדוד ג","אשדוד ז","בני ברק","פתח תקווה","רחובות"].includes(branch)||!canAccessBranch(user,branch))return json({error:"אין הרשאה לצפות בקבלות הסניף הזה."},403);
 const result=await env.COFFEE_DB.prepare("SELECT id,branch,employee,created_at FROM subscription_receipts WHERE branch=? ORDER BY created_at DESC,id DESC").bind(branch).all();
 const receipts=result.results||[];
 return json({receipts});
}catch{return json({error:"לא ניתן לטעון קבלות."},500)}}