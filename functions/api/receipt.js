import {json,requireAuth} from "./_auth.js";

const BRANCHES=["ביתר עילית A","ביתר עילית B"];
const EMPLOYEES=["יהודה בן גיגי","נהוראי מלכה","אוריאל דוד פנחסי","ישי אלמקייס"];

export async function onRequestGet({request,env}){
  try{
    const user=await requireAuth(request,env);
    if(!user)return json({error:"יש להתחבר כדי לצפות בקבלה."},401);
    const url=new URL(request.url);
    const branch=user.role==="admin"?String(url.searchParams.get("branch")||""):user.branch;
    const employee=String(url.searchParams.get("employee")||"");
    if(!BRANCHES.includes(branch)||!EMPLOYEES.includes(employee))return json({error:"הקבלה המבוקשת אינה זמינה."},404);
    if(user.role!=="admin"&&user.branch!==branch)return json({error:"אין הרשאה לקבלה של סניף אחר."},403);
    const row=await env.COFFEE_DB.prepare("SELECT receipt_data,receipt_type FROM employee_subscriptions WHERE branch=? AND employee=?").bind(branch,employee).first();
    if(!row?.receipt_data)return json({error:"לא הועלתה קבלה לעובד זה."},404);
    return json({data:row.receipt_data,type:row.receipt_type||"image/jpeg"});
  }catch{return json({error:"לא ניתן לטעון את הקבלה."},500)}
}
