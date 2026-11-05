import {json,sameOrigin} from "./_auth.js";
const BRANCHES=["ביתר עילית A","ביתר עילית B"],EMPLOYEES=["יהודה בן גיגי","נהוראי מלכה","אוריאל דוד פנחסי","ישי אלמקייס"];
const MAX_RECEIPT_BASE64=1250000;
export async function onRequestPost({request,env}){try{
 if(!sameOrigin(request))return json({error:"הבקשה נדחתה."},403);
 const body=await request.json(),branch=String(body.branch||""),employee=String(body.employee||""),receipt=String(body.receipt||"");
 if(!BRANCHES.includes(branch)||!EMPLOYEES.includes(employee))return json({error:"יש לבחור סניף ועובד מהרשימה."},400);
 if(!receipt)return json({error:"כדי להוסיף מנוי יש לצרף צילום קבלה."},400);
 if(receipt.length>MAX_RECEIPT_BASE64||!/^[A-Za-z0-9+/]+={0,2}$/.test(receipt))return json({error:"התמונה גדולה מדי או אינה תקינה."},413);
 const addReceipt=env.COFFEE_DB.prepare("INSERT INTO subscription_receipts(branch,employee,receipt_data,receipt_type) VALUES(?,?,?,'image/jpeg')").bind(branch,employee,receipt);
 const increment=env.COFFEE_DB.prepare("INSERT INTO employee_subscriptions(branch,employee,subscriptions,receipt_data,receipt_type,updated_at) VALUES(?,?,1,?,'image/jpeg',strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(branch,employee) DO UPDATE SET subscriptions=employee_subscriptions.subscriptions+1,receipt_data=excluded.receipt_data,receipt_type='image/jpeg',updated_at=excluded.updated_at").bind(branch,employee,receipt);
 await env.COFFEE_DB.batch([addReceipt,increment]);
 const row=await env.COFFEE_DB.prepare("SELECT subscriptions FROM employee_subscriptions WHERE branch=? AND employee=?").bind(branch,employee).first();
 return json({ok:true,branch,employee,subscriptions:Number(row?.subscriptions||0)});
}catch{return json({error:"לא ניתן לשמור את המנוי. ודאו שמסד הנתונים מעודכן ונסו שוב."},500)}}