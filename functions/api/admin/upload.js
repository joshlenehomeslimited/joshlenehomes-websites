import { requireAdmin } from "../../_lib/auth.js";
const json=(data,status=200)=>Response.json(data,{status});
const OWNER="joshlenehomeslimited";
const REPO="joshlenehomes-websites";
const BRANCH="phase-2-admin";
export async function onRequestPost({request,env}) {
  const denied=await requireAdmin(request,env); if(denied)return denied;
  if(!env.GITHUB_TOKEN)return json({error:"Image uploads are not connected yet. A GitHub upload token must be added as the GITHUB_TOKEN secret in Cloudflare Pages."},503);
  let body;try{body=await request.json()}catch{return json({error:"Invalid upload request."},400)}
  const allowed={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"};
  if(!allowed[body.type]||typeof body.data!=="string"||body.data.length>11_200_000)return json({error:"Choose a JPG, PNG or WebP image under 8 MB."},400);
  const original=String(body.name||"property").replace(/\\.[^.]+$/,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,50)||"property";
  const filename=`${original}-${Date.now()}.${allowed[body.type]}`;
  const path=`images/properties/${filename}`;
  const response=await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`,{
    method:"PUT",
    headers:{"Authorization":`Bearer ${env.GITHUB_TOKEN}`,"Accept":"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28","Content-Type":"application/json"},
    body:JSON.stringify({message:`Add property photograph ${filename}`,content:body.data,branch:BRANCH})
  });
  if(!response.ok){const err=await response.json().catch(()=>({}));return json({error:err.message||"GitHub could not save this image. Check the upload token permissions."},502)}
  return json({success:true,path});
}