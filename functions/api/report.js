import {json,sameOrigin} from "./_auth.js";
const BRANCHES=["ביתר עילית A","ביתר עילית B","בית שמש רמה א","בית שמש רמה ד","בית שמש נעימי","צפת","תל אביב","קריית ספר","מודיעין","אשדוד ג","אשדוד ז","בני ברק","פתח תקווה","רחובות"];
const MAX_RECEIPT_BASE64=1250000;
export async function onRequestPost({request,env}){try{
 if(!sameOrigin(request))return json({error:"הבקשה נדחתה."},403);
 
 const body=await request.json(),branch=String(body.branch||""),employee=String(body.employee||"").trim().replace(/\\s+/g," "),receipt=String(body.receipt||"");
 if(!sameOrigin(request))return json({error:"הבקשה נדחתה."},403);
 if(!BRANCHES.includes(branch)||employee.length<2||employee.length>80)return json({error:"יש לבחור סניף ולהזין שם עובד תקין."},400);
 await env.COFFEE_DB.prepare("INSERT OR IGNORE INTO branch_employees(branch,employee) VALUES(?,?)").bind(branch,employee).run();
 if(!receipt)return json({error:"כדי להוסיף מנוי יש לצרף צילום קבלה."},400);
 if(receipt.length>MAX_RECEIPT_BASE64||!/^[A-Za-z0-9+/]+={0,2}$/.test(receipt))return json({error:"התמונה גדולה מדי או אינה תקינה."},413);
 const addReceipt=env.COFFEE_DB.prepare("INSERT INTO subscription_receipts(branch,employee,receipt_data,receipt_type) VALUES(?,?,?,'image/jpeg')").bind(branch,employee,receipt);
 const increment=env.COFFEE_DB.prepare("INSERT INTO employee_subscriptions(branch,employee,subscriptions,receipt_data,receipt_type,updated_at) VALUES(?,?,1,?,'image/jpeg',strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(branch,employee) DO UPDATE SET subscriptions=employee_subscriptions.subscriptions+1,receipt_data=excluded.receipt_data,receipt_type='image/jpeg',updated_at=excluded.updated_at").bind(branch,employee,receipt);
 await env.COFFEE_DB.batch([addReceipt,increment]);
 const row=await env.COFFEE_DB.prepare("SELECT subscriptions FROM employee_subscriptions WHERE branch=? AND employee=?").bind(branch,employee).first();
 return json({ok:true,branch,employee,subscriptions:Number(row?.subscriptions||0)});
}catch{return json({error:"לא ניתן לשמור את המנוי. ודאו שמסד הנתונים מעודכן ונסו שוב."},500)}}