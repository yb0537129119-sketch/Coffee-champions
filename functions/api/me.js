import {json,requireAuth} from "./_auth.js";
export async function onRequestGet({request,env}){
  try{const user=await requireAuth(request,env);return user?json({user}):json({user:null},401)}
  catch{return json({error:"שגיאת אימות."},500)}
}