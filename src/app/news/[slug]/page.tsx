"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/client";

type Article = { id:string; title:string; excerpt:string|null; content:string; cover_image_url:string|null; published_at:string|null; schools:{name:string;slug:string}|null };

export default function NewsArticlePage(){
  const params=useParams<{slug:string}>();
  const [article,setArticle]=useState<Article|null>(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    let alive=true;
    createClient().from("school_news")
      .select("id,title,excerpt,content,cover_image_url,published_at,schools(name,slug)")
      .eq("slug",params.slug).eq("is_published",true).maybeSingle()
      .then(({data})=>{if(alive){setArticle(data as unknown as Article|null);setLoading(false);}});
    return ()=>{alive=false;};
  },[params.slug]);
  return <div className="public-site"><SiteHeader/><main className="profile-page news-article-page"><div className="container news-article-container">
    <Link href="/#news" className="back-link">← Back to education news</Link>
    {loading?<div className="empty-state">Loading article…</div>:!article?<div className="empty-state"><h2>Article not found</h2><p>This article may have been unpublished or the link is incorrect.</p><Link className="button button-dark" href="/">Return home</Link></div>:<article className="news-article">
      <span className="eyebrow">EDUCATION & OPPORTUNITIES</span>
      <h1>{article.title}</h1>
      <div className="news-article-meta"><span>{article.schools?.name||"Tanga Schools Hub"}</span>{article.published_at&&<time dateTime={article.published_at}>{new Date(article.published_at).toLocaleDateString("en-TZ",{day:"numeric",month:"long",year:"numeric"})}</time>}</div>
      {article.cover_image_url&&<img className="news-article-cover" src={article.cover_image_url} alt={article.title}/>}
      {article.excerpt&&<p className="news-article-excerpt">{article.excerpt}</p>}
      <div className="news-article-content">{article.content.split(/\n{2,}/).map((paragraph,index)=><p key={index}>{paragraph}</p>)}</div>
      {article.schools?.slug&&<Link className="text-link" href={`/schools/${article.schools.slug}`}>View school profile →</Link>}
    </article>}
  </div></main></div>;
}
