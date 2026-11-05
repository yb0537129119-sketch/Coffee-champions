import {json,requireAuth,canAccessBranch} from "./_auth.js";
const BRANCHES=["ביתר עילית A","ביתר עילית B"];
const EMPLOYEES=["יהודה בן גיגי","נהוראי מלכה","אוריאל דוד פנחסי","ישי אלמקייס"];
export async function onRequestGet({request,env}){
 try{
  const user=await requireAuth(request,env);if(!user)return json({error:"יש להתחבר כדי לצפות בקבלה."},401);
  const url=new URL(request.url),id=url.searchParams.get("id"),branch=url.searchParams.get("branch"),employee=url.searchParams.get("employee");
  let row;
  if(id){
   if(!BRANCHES.includes(branch)||!canAccessBranch(user,branch)||!Number.isSafeInteger(Number(id))||Number(id)<1)return json({error:"הקבלה המבוקשת אינה זמינה."},404);
   row=await env.COFFEE_DB.prepare("SELECT receipt_data,receipt_type FROM subscription_receipts WHERE id=? AND branch=?").bind(Number(id),branch).first();
  }else{
   if(!BRANCHES.includes(branch)||!canAccessBranch(user,branch)||!EMPLOYEES.includes(employee))return json({error:"הקבלה המבוקשת אינה זמינה."},404);
   row=await env.COFFEE_DB.prepare("SELECT receipt_data,receipt_type FROM employee_subscriptions WHERE branch=? AND employee=?").bind(branch,employee).first();
  }
  if(!row?.receipt_data)return json({error:"לא הועלתה קבלה."},404);
  return json({data:row.receipt_data,type:row.receipt_type||"image/jpeg"},200,{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"});
 }catch{return json({error:"לא ניתן לטעון את הקבלה."},500)}
}