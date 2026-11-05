import {json,sameOrigin} from "./_auth.js";
const BRANCHES=["ביתר עילית A","ביתר עילית B"],EMPLOYEES=["יהודה בן גיגי","נהוראי מלכה","אוריאל דוד פנחסי","ישי אלמקייס"];
const MAX_RECEIPT_BASE64=1250000;
export async function onRequestPost({request,env}){try{
if(!sameOrigin(request))return json({error:"הבקשה נדחתה."},403);
const body=await request.json(),branch=String(body.branch||""),employee=String(body.employee||""),subscriptions=Number(body.subscriptions);
if(!BRANCHES.includes(branch)||!EMPLOYEES.includes(employee))return json({error:"יש לבחור סניף ועובד מהרשימה."},400);
if(!Number.isInteger(subscriptions)||subscriptions<0||subscriptions>100000)return json({error:"מספר המנויים חייב להיות מספר שלם בין 0 ל־100,000."},400);
const receipt=body.receipt==null?"":String(body.receipt);
if(receipt.length>MAX_RECEIPT_BASE64||(receipt&&!/^[A-Za-z0-9+/]+={0,2}$/.test(receipt)))return json({error:"התמונה גדולה מדי או אינה תקינה."},413);
if(receipt)await env.COFFEE_DB.prepare("INSERT INTO subscription_receipts(branch,employee,receipt_data,receipt_type) VALUES(?,?,?,'image/jpeg')").bind(branch,employee,receipt).run();
await env.COFFEE_DB.prepare("INSERT INTO employee_subscriptions(branch,employee,subscriptions,receipt_data,receipt_type,updated_at) VALUES(?,?,?,NULLIF(?,''),CASE WHEN ?<>'' THEN 'image/jpeg' ELSE NULL END,strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(branch,employee) DO UPDATE SET subscriptions=excluded.subscriptions,receipt_data=CASE WHEN excluded.receipt_data IS NOT NULL THEN excluded.receipt_data ELSE employee_subscriptions.receipt_data END,receipt_type=CASE WHEN excluded.receipt_data IS NOT NULL THEN 'image/jpeg' ELSE employee_subscriptions.receipt_type END,updated_at=excluded.updated_at").bind(branch,employee,subscriptions,receipt,receipt).run();
return json({ok:true,branch,employee,subscriptions});
}catch{return json({error:"לא ניתן לשמור את העדכון. ודאו שהרצתם את עדכון מסד הנתונים."},500)}}