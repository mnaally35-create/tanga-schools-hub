"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PortalHeader } from "@/components/portal-header";
import { createClient } from "@/lib/supabase/client";
import { messageFromError, slugify } from "@/lib/utils";

type School = { id: string; name: string; status: string };
type NewsItem = { id: string; school_id: string; title: string; slug: string; excerpt: string | null; content: string; cover_image_url: string | null; is_published: boolean; published_at: string | null; created_at: string };

export default function SchoolNewsPage() {
  const router = useRouter();
  const [schools,setSchools] = useState<School[]>([]);
  const [selectedSchool,setSelectedSchool] = useState("");
  const [items,setItems] = useState<NewsItem[]>([]);
  const [title,setTitle] = useState("");
  const [excerpt,setExcerpt] = useState("");
  const [content,setContent] = useState("");
  const [cover,setCover] = useState("");
  const [publishNow,setPublishNow] = useState(false);
  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState(false);
  const [error,setError] = useState("");
  const [notice,setNotice] = useState("");

  const activeSchool = useMemo(()=>schools.find(s=>s.id===selectedSchool)??null,[schools,selectedSchool]);

  useEffect(()=>{
    let alive=true;
    async function load(){
      const supabase=createClient();
      const {data:{user}}=await supabase.auth.getUser();
      if(!user){router.replace("/login");return;}
      const {data:members,error:memberError}=await supabase.from("school_memberships")
        .select("role,school_id,schools(id,name,status)")
        .eq("user_id",user.id).eq("is_active",true);
      if(!alive)return;
      if(memberError){setError(messageFromError(memberError));setLoading(false);return;}
      const allowed=(members??[]).filter((m:any)=>["school_admin"].includes(m.role)).map((m:any)=>m.schools).filter(Boolean) as School[];
      if(!allowed.length){router.replace("/dashboard");return;}
      setSchools(allowed);setSelectedSchool(allowed[0].id);
      const {data:news,error:newsError}=await supabase.from("school_news").select("*").eq("school_id",allowed[0].id).order("created_at",{ascending:false});
      if(!alive)return;
      if(newsError)setError(messageFromError(newsError));else setItems((news??[]) as NewsItem[]);
      setLoading(false);
    }
    load();
    return ()=>{alive=false;};
  },[router]);

  async function chooseSchool(id:string){
    setSelectedSchool(id);setError("");setNotice("");
    const {data,error}=await createClient().from("school_news").select("*").eq("school_id",id).order("created_at",{ascending:false});
    if(error)setError(messageFromError(error));else setItems((data??[]) as NewsItem[]);
  }

  async function save(e:FormEvent){
    e.preventDefault();setSaving(true);setError("");setNotice("");
    try{
      if(title.trim().length<3)throw new Error("Headline must contain at least 3 characters.");
      if(content.trim().length<20)throw new Error("Article content must contain at least 20 characters.");
      if(publishNow && activeSchool?.status!=="verified")throw new Error("Your school must be verified before news can be published. You can save this as a draft.");
      const supabase=createClient();
      const {data:{user}}=await supabase.auth.getUser();
      if(!user)throw new Error("Your session has expired. Please sign in again.");
      const base=slugify(title)||"school-update";
      const slug=`${base}-${Date.now().toString(36)}`;
      const {data,error}=await supabase.from("school_news").insert({
        school_id:selectedSchool,author_id:user.id,title:title.trim(),slug,
        excerpt:excerpt.trim()||null,content:content.trim(),
        cover_image_url:cover.trim()||null,is_published:publishNow,
        published_at:publishNow?new Date().toISOString():null
      }).select("*").single();
      if(error)throw error;
      setItems(current=>[data as NewsItem,...current]);
      setTitle("");setExcerpt("");setContent("");setCover("");setPublishNow(false);
      setNotice(publishNow?"Your school news has been published.":"Your article has been saved as a draft.");
    }catch(err){setError(messageFromError(err));}
    finally{setSaving(false);}
  }

  async function togglePublish(item:NewsItem){
    setError("");setNotice("");
    if(!item.is_published && activeSchool?.status!=="verified"){
      setError("School verification is required before this draft can be published.");return;
    }
    const next=!item.is_published;
    const {data,error}=await createClient().from("school_news").update({
      is_published:next,published_at:next?new Date().toISOString():null
    }).eq("id",item.id).select("*").single();
    if(error){setError(messageFromError(error));return;}
    setItems(current=>current.map(row=>row.id===item.id?data as NewsItem:row));
    setNotice(next?"Article published.":"Article moved back to drafts.");
  }

  async function remove(item:NewsItem){
    if(!window.confirm("Delete this article permanently?"))return;
    const {error}=await createClient().from("school_news").delete().eq("id",item.id);
    if(error){setError(messageFromError(error));return;}
    setItems(current=>current.filter(row=>row.id!==item.id));
    setNotice("Article deleted.");
  }

  return <><PortalHeader/><main className="dashboard-page"><div className="container dashboard-container">
    <div className="dashboard-top"><div><span className="eyebrow">SCHOOL COMMUNICATIONS</span><h1>News & announcements</h1><p>Create updates for students, parents and the wider education community.</p></div><Link className="button button-outline-dark" href="/dashboard">Back to dashboard</Link></div>
    {loading?<div className="empty-state">Loading school news workspace…</div>:<>
      {schools.length>1&&<label className="news-school-select">Manage school<select value={selectedSchool} onChange={e=>chooseSchool(e.target.value)}>{schools.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>}
      {activeSchool&&<div className="news-verification-note"><strong>{activeSchool.name}</strong><span className={activeSchool.status==="verified"?"status status-verified":"status status-pending"}>{activeSchool.status}</span>{activeSchool.status!=="verified"&&<p>Your school profile must be approved before articles can be published. Drafts can be saved in the meantime.</p>}</div>}
      {(error||notice)&&<div className={error?"news-feedback alert alert-error":"news-feedback alert alert-success"} role={error?"alert":"status"} aria-live="polite"><span>{error||notice}</span><button type="button" className="news-feedback-close" onClick={()=>{setError("");setNotice("");}} aria-label="Dismiss message">×</button></div>}
      <section className="dashboard-section form-panel"><div className="section-heading"><div><h2>Create an article</h2><p>Write a clear headline and a useful update. Avoid sharing private student information.</p></div></div>
        <form className="form-grid" onSubmit={save}>
          <label className="field-span">Headline<input required minLength={3} maxLength={200} value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. School announces new academic term dates"/></label>
          <label className="field-span">Short summary<textarea maxLength={300} rows={2} value={excerpt} onChange={e=>setExcerpt(e.target.value)} placeholder="A short introduction to the announcement"/></label>
          <label className="field-span">Article content<textarea required minLength={20} rows={8} value={content} onChange={e=>setContent(e.target.value)} placeholder="Write the full announcement or article…"/></label>
          <label className="field-span">Cover image URL (optional)<input type="url" value={cover} onChange={e=>setCover(e.target.value)} placeholder="https://example.com/image.jpg"/></label>
          <label className="field-span news-publish-toggle"><input type="checkbox" checked={publishNow} onChange={e=>setPublishNow(e.target.checked)} disabled={activeSchool?.status!=="verified"}/> Publish immediately (otherwise save as draft)</label>
          <div className="field-span"><button className="button button-dark" disabled={saving}>{saving?"Saving…":publishNow?"Publish article":"Save draft"}</button></div>
        </form>
      </section>
      <section className="dashboard-section"><div className="section-heading"><div><h2>Published articles & drafts</h2><p>{items.length} {items.length===1?"article":"articles"} in this school workspace.</p></div></div>
        {items.length?<div className="school-news-manage-list">{items.map(item=><article className="school-news-manage-item" key={item.id}><div className="school-news-manage-copy"><span className="school-type">{item.is_published?"PUBLISHED":"DRAFT"}</span><h3>{item.title}</h3><p>{item.excerpt||item.content.slice(0,150)}</p><small>Created {new Date(item.created_at).toLocaleDateString("en-TZ",{day:"numeric",month:"short",year:"numeric"})}</small></div><div className="school-news-manage-actions"><button className="button button-outline-dark" onClick={()=>togglePublish(item)}>{item.is_published?"Unpublish":"Publish"}</button><button className="button button-outline-dark" onClick={()=>remove(item)}>Delete</button></div></article>)}</div>:<div className="empty-state compact"><h3>No articles yet</h3><p>Your school's announcements and education updates will appear here after you create them.</p></div>}
      </section>
    </>}
  </div></main></>;
}
