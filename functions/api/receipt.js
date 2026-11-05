import {json} from "./_auth.js";
const BRANCHES=["ביתר עילית A","ביתר עילית B"];
const EMPLOYEES=["יהודה בן גיגי","נהוראי מלכה","אוריאל דוד פנחסי","ישי אלמקייס"];
export async function onRequestGet({request,env}){
 try{
  const url=new URL(request.url),branch=url.searchParams.get("branch"),employee=url.searchParams.get("employee");
  if(!BRANCHES.includes(branch)||!EMPLOYEES.includes(employee))return json({error:"הקבלה המבוקשת אינה זמינה."},404);
  const row=await env.COFFEE_DB.prepare("SELECT receipt_data,receipt_type FROM employee_subscriptions WHERE branch=? AND employee=?").bind(branch,employee).first();
  if(!row?.receipt_data)return json({error:"לא הועלתה קבלה לעובד זה."},404);
  return json({data:row.receipt_data,type:row.receipt_type||"image/jpeg"});
 }catch{return json({error:"לא ניתן לטעון את הקבלה."},500)}
}
