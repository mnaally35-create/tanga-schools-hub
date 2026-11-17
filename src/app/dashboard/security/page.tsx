"use client";
import { useEffect,useState } from "react";
import { useRouter } from "next/navigation";
import { PortalHeader } from "@/components/portal-header";
import { createClient } from "@/lib/supabase/client";
type Reset={id:string;user_id:string;phone:string;status:string;requested_at:string;school_id:string|null;schools?:{name:string}|null};
export default function SchoolSecurityPage(){
 const router=useRouter();const [rows,setRows]=useState<Reset[]>([]);const [busy,setBusy]=useState("");const [error,setError]=useState("");const [notice,setNotice]=useState("");const [credential,setCredential]=useState("");
 async function load(){const s=createClient();const {data:{user}}=await s.auth.getUser();if(!user){router.replace("/login");return;}
  const {data:members}=await s.from("school_memberships").select("school_id").eq("user_id",user.id).eq("role","school_admin").eq("is_active",true);
  if(!members?.length){router.replace("/dashboard");return;}
  const {data,error}=await s.from("password_reset_requests").select("id,user_id,phone,status,requested_at,school_id,schools(name)").in("school_id",members.map(m=>m.school_id)).order("requested_at",{ascending:false}).limit(100);
  if(error)setError(error.message);else setRows((data||[]) as unknown as Reset[]);
 }
 useEffect(()=>{void load();},[]);
 async function approve(row:Reset){setBusy(row.id);setError("");setNotice("");const {data,error}=await createClient().functions.invoke("admin-actions",{body:{action:"approve_password_reset",request_id:row.id}});
  if(error||!data?.success){setError(data?.error||error?.message||"Imeshindikana kuidhinisha ombi.");setBusy("");return;}
  let phone=String(data.phone).replace(/\\D/g,"");if(phone.startsWith("0"))phone="255"+phone.slice(1);
  const message=`Tanga Schools Hub password reset. Password yako ya muda ni: ${data.temporary_password}. Inaisha baada ya dakika 30. Ingia kisha badilisha password mara moja. Usimshirikishe mtu mwingine.`;
  setCredential(`Namba: ${data.phone}\nPassword ya muda: ${data.temporary_password}\nMuda wa mwisho: ${new Date(data.expires_at).toLocaleString()}`);
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`,"_blank","noopener,noreferrer");
  setNotice("Password ya muda imetengenezwa. Fungua WhatsApp na bonyeza Send mwenyewe.");await load();setBusy("");
 }
 return <><PortalHeader/><main className="dashboard-page"><div className="container dashboard-container"><div className="dashboard-top"><div><span className="eyebrow">SCHOOL ADMIN</span><h1>Password reset requests</h1><p>Maombi ya walimu wa shule yako.</p></div><button className="button button-outline-dark" onClick={()=>void load()}>Refresh</button></div>
 {error&&<div className="alert alert-error">{error}</div>}{notice&&<div className="alert alert-success">{notice}</div>}{credential&&<pre className="admin-credential-box">{credential}</pre>}
 <section className="dashboard-section"><div className="section-heading"><div><h2>Reset requests ({rows.filter(r=>r.status==="pending").length} pending)</h2><p>Admin Mkuu bado anaweza kusaidia pale inapohitajika.</p></div></div>
 {rows.length?<div className="academic-list">{rows.map(row=><article className="academic-list-item" key={row.id}><div><strong>{row.phone}</strong><small>{row.schools?.name||"School"} · {row.status} · {new Date(row.requested_at).toLocaleString()}</small></div>{row.status==="pending"&&<button className="button button-dark" disabled={!!busy} onClick={()=>void approve(row)}>{busy===row.id?"Processing…":"Approve & WhatsApp"}</button>}</article>)}</div>:<div className="empty-state compact"><h3>No reset requests</h3><p>Maombi ya walimu yataonekana hapa baada ya kutumwa.</p></div>}</section></div></main></>;
}
