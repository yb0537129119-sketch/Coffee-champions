import {json} from "./_auth.js";
export async function onRequestGet({request,env}){try{
 
 const branch=new URL(request.url).searchParams.get("branch");
 if(!["ביתר עילית A","ביתר עילית B"].includes(branch))return json({error:"יש לבחור סניף תקין."},400);
 const result=await env.COFFEE_DB.prepare("SELECT id,branch,employee,created_at FROM subscription_receipts WHERE branch=? ORDER BY created_at DESC,id DESC").bind(branch).all();
 const receipts=result.results||[];
 return json({receipts});
}catch{return json({error:"לא ניתן לטעון קבלות."},500)}}