import {json,requireAuth} from "./_auth.js";
const PUBLIC_BRANCHES=["ביתר עילית A","ביתר עילית B"];
export async function onRequestGet({request,env}){
 try{
  const url=new URL(request.url),id=Number(url.searchParams.get("id"));
  if(!Number.isInteger(id)||id<1)return json({error:"תמונה לא תקינה."},400);
  const task=await env.COFFEE_DB.prepare("SELECT branch,image_data,image_type FROM tasks WHERE id=?").bind(id).first();
  if(!task||!task.image_data)return json({error:"לא נמצאה תמונה."},404);
  const user=await requireAuth(request,env);
  if(user){if(user.role!=="admin"&&task.branch!=="כללי"&&task.branch!==user.branch)return json({error:"אין הרשאה לצפות בתמונה."},403)}
  else if(!PUBLIC_BRANCHES.includes(task.branch))return json({error:"אין הרשאה לצפות בתמונה."},403);
  const binary=atob(task.image_data),bytes=new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
  return new Response(bytes,{headers:{"Content-Type":task.image_type||"image/jpeg","Cache-Control":"private, max-age=300","X-Content-Type-Options":"nosniff"}});
 }catch{return json({error:"לא ניתן לטעון את תמונת המשימה."},500)}
}