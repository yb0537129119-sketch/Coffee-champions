import {json,digest,passwordHash,randomToken,cookieHeader,sameOrigin} from "./_auth.js";
export async function onRequestPost({request,env}){
 try{
  if(!sameOrigin(request))return json({error:"הבקשה נדחתה."},403);
  const {username,password}=await request.json();
  if(typeof username!=="string"||typeof password!=="string"||username.length>100||password.length>200)return json({error:"פרטי הכניסה אינם תקינים."},400);
  await env.COFFEE_DB.prepare("CREATE TABLE IF NOT EXISTS login_rate_limits (key_hash TEXT PRIMARY KEY, failures INTEGER NOT NULL DEFAULT 0, window_started TEXT NOT NULL, blocked_until TEXT)").run();
  const ip=request.headers.get("CF-Connecting-IP")||"unknown";
  const rateKey=await digest(ip+"|"+String(username||"").trim().toLowerCase());
  const rate=await env.COFFEE_DB.prepare("SELECT failures,blocked_until,datetime('now') AS now FROM login_rate_limits WHERE key_hash=?").bind(rateKey).first();
  if(rate?.blocked_until && rate.blocked_until>rate.now)return json({error:"יותר מדי ניסיונות כניסה. נסו שוב בעוד 15 דקות."},429,{"Retry-After":"900","Cache-Control":"no-store"});
  const user=await env.COFFEE_DB.prepare("SELECT username,role,branch,password_hash,password_salt FROM users WHERE username=?").bind(username.trim()).first();
  if(!user||await passwordHash(password,user.password_salt)!==user.password_hash){
    await env.COFFEE_DB.prepare("INSERT INTO login_rate_limits(key_hash,failures,window_started,blocked_until) VALUES(?,1,datetime('now'),NULL) ON CONFLICT(key_hash) DO UPDATE SET failures=CASE WHEN window_started<=datetime('now','-15 minutes') THEN 1 ELSE failures+1 END,window_started=CASE WHEN window_started<=datetime('now','-15 minutes') THEN datetime('now') ELSE window_started END,blocked_until=CASE WHEN (CASE WHEN window_started<=datetime('now','-15 minutes') THEN 1 ELSE failures+1 END)>=6 THEN datetime('now','+15 minutes') ELSE blocked_until END").bind(rateKey).run();
    return json({error:"שם משתמש או סיסמה שגויים."},401,{"Cache-Control":"no-store"});
  }
  await env.COFFEE_DB.prepare("DELETE FROM login_rate_limits WHERE key_hash=?").bind(rateKey).run();
  if(user.role==="branch"&&!["ביתר עילית A","ביתר עילית B"].includes(user.branch))return json({error:"כרגע המערכת פעילה רק עבור סניפי ביתר עילית."},403);
  const token=randomToken(),tokenHash=await digest(token);
  await env.COFFEE_DB.prepare("DELETE FROM sessions WHERE expires_at<=datetime('now')").run();
  await env.COFFEE_DB.prepare("INSERT INTO sessions(token_hash,username,expires_at) VALUES(?,?,datetime('now','+12 hours'))").bind(tokenHash,user.username).run();
  return json({ok:true,user:{username:user.username,role:user.role,branch:user.branch}},200,{"Set-Cookie":cookieHeader(token,43200),"Cache-Control":"no-store"});
 }catch{return json({error:"לא ניתן להתחבר כרגע."},500)}
}