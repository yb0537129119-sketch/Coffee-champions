import {json} from "./_auth.js";
export async function onRequestGet({env}){try{
 const result=await env.COFFEE_DB.prepare("SELECT id,branch,employee,created_at FROM subscription_receipts ORDER BY created_at DESC,id DESC").all();
 return json({receipts:result.results||[]});
}catch{return json({error:"לא ניתן לטעון את כל הקבלות."},500)}}