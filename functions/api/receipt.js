import {json,requireAuth,canAccessBranch} from "./_auth.js";
const BRANCHES=["ביתר עילית A","ביתר עילית B","בית שמש רמה א","בית שמש רמה ד","בית שמש נעימי","צפת","תל אביב","קריית ספר","מודיעין","אשדוד ג","אשדוד ז","בני ברק","פתח תקווה","רחובות"];
export async function onRequestGet({request,env}){
 try{
  
  const user=await requireAuth(request,env);if(!user)return json({error:"נדרשת התחברות."},401);
  const url=new URL(request.url),id=url.searchParams.get("id"),requested=url.searchParams.get("branch"),branch=user.role==="admin"?requested:user.branch,employee=url.searchParams.get("employee");
  if(!canAccessBranch(user,branch))return json({error:"אין הרשאה לצפות בקבלה הזו."},403);
  let row;
  if(id){
   if(!BRANCHES.includes(branch)||!Number.isSafeInteger(Number(id))||Number(id)<1)return json({error:"הקבלה המבוקשת אינה זמינה."},404);
   row=await env.COFFEE_DB.prepare("SELECT receipt_data,receipt_type FROM subscription_receipts WHERE id=? AND branch=?").bind(Number(id),branch).first();
  }else{
   if(!BRANCHES.includes(branch)||!await env.COFFEE_DB.prepare("SELECT 1 AS ok FROM branch_employees WHERE branch=? AND employee=?").bind(branch,employee).first())return json({error:"הקבלה המבוקשת אינה זמינה."},404);
   row=await env.COFFEE_DB.prepare("SELECT receipt_data,receipt_type FROM employee_subscriptions WHERE branch=? AND employee=?").bind(branch,employee).first();
  }
  if(!row?.receipt_data)return json({error:"לא הועלתה קבלה."},404);
  return json({data:row.receipt_data,type:row.receipt_type||"image/jpeg"},200,{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"});
 }catch{return json({error:"לא ניתן לטעון את הקבלה."},500)}
}