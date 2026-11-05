import {json,requireAuth,canAccessBranch} from "./_auth.js";
export async function onRequestGet({request,env}){try{
 
 const result=await env.COFFEE_DB.prepare("SELECT id,branch,employee,created_at FROM subscription_receipts ORDER BY created_at DESC,id DESC").all();
 const receipts=result.results||[];
 return json({receipts});
}catch{return json({error:"לא ניתן לטעון קבלות."},500)}}