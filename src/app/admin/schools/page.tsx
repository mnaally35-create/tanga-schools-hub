"use client";
import { useEffect,useState } from "react";
import { PortalHeader } from "@/components/portal-header";
import { createClient } from "@/lib/supabase/client";
type Admin={id:string;user_id:string;is_active:boolean;full_name:string;email:string};
type School={id:string;name:string;status:string;admins:Admin[]};
export default function SchoolAdminsPage(){
 const [schools,setSchools]=useState<School[]>([]);const [emails,setEmails]=useState<Record<string,string>>({});const [busy,setBusy]=useState("");const [error,setError]=useState("");const [notice,setNotice]=useState("");
 async function load(){setError("");const {data,error}=await createClient().functions.invoke("school-admin-management",{body:{action:"list"}});if(error||!data?.success){setError(data?.error||error?.message||"Imeshindikana kupakia shule.");return;}setSchools(data.schools||[]);}
 useEffect(()=>{void load();},[]);
 async function act(schoolId:string,action:string,extra:any={}){setBusy(schoolId);setError("");setNotice("");const {data,error}=await createClient().functions.invoke("school-admin-management",{body:{action,school_id:schoolId,...extra}});if(error||!data?.success)setError(data?.error||error?.message||"Imeshindikana.");else{setNotice(action==="assign"?"Admin mpya amepewa mamlaka ya shule.":"Admin wa zamani amezimwa; akaunti na taarifa zake hazijafutwa.");setEmails(v=>({...v,[schoolId]:""}));await load();}setBusy("");}
 return <><PortalHeader admin/><main className="dashboard-page"><div className="container dashboard-container"><div className="dashboard-top"><div><span className="eyebrow">SUPER ADMIN ONLY</span><h1>School administrators</h1><p>Badilisha msimamizi wa shule bila kufuta taarifa za shule.</p></div><button className="button button-outline-dark" onClick={()=>void load()}>Refresh</button></div>
 {error&&<div className="alert alert-error">{error}</div>}{notice&&<div className="alert alert-success">{notice}</div>}
 <section className="dashboard-section"><p className="data-attribution">Kuweka Admin mpya: tumia email ya akaunti iliyokwisha sajiliwa. Admin wa zamani anazimwa kwa shule hiyo pekee; historia na akaunti yake havifutwi.</p>
 {schools.map(s=><article className="dashboard-section form-panel" key={s.id}><div className="section-heading"><div><h2>{s.name}</h2><p>{s.status} · {s.admins.filter(a=>a.is_active).length} active admin(s)</p></div></div>
 <div className="academic-list">{s.admins.map(a=><div className="academic-list-item" key={a.id}><div><strong>{a.full_name}</strong><small>{a.email} · {a.is_active?"Active":"Inactive"}</small></div>{a.is_active&&<button className="button button-outline-dark" disabled={!!busy} onClick={()=>{if(window.confirm("Unataka kuondoa mamlaka ya Admin huyu kwenye shule hii?"))void act(s.id,"deactivate",{membership_id:a.id});}}>Remove admin</button>}</div>)}</div>
 <form className="form-grid" onSubmit={e=>{e.preventDefault();void act(s.id,"assign",{email:emails[s.id]||""});}}><label className="field-span">Email ya Admin mpya<input type="email" required value={emails[s.id]||""} onChange={e=>setEmails(v=>({...v,[s.id]:e.target.value}))} placeholder="admin@school.ac.tz"/></label><div className="field-span"><button className="button button-dark" disabled={!!busy}>{busy===s.id?"Saving…":"Assign / replace school admin"}</button></div></form>
 </article>)}
 {!schools.length&&!error&&<div className="empty-state">Loading schools…</div>}</section></div></main></>;
}
