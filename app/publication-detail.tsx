"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowUpRight, Check, Copy, Download, ExternalLink } from "lucide-react";
import type { Paper } from "./site-data";
import { papers, reactions } from "./site-data";
import { assetPath } from "@/lib/asset-path";
import "./publication-detail.css";

type Language = "zh" | "en";
type CitationFormat = "citation" | "bibtex";

export function PublicationDetail({ paper }: { paper: Paper }) {
  const [lang, setLang] = useState<Language>("zh");
  const [returnUrl, setReturnUrl] = useState(assetPath("/#publications"));
  const [format, setFormat] = useState<CitationFormat>("citation");
  const [copyState, setCopyState] = useState<"idle" | "success" | "manual">("idle");
  const manualRef = useRef<HTMLTextAreaElement>(null);
  const l = lang === "zh" ? 0 : 1;
  const t = (zh: string, en: string) => (lang === "zh" ? zh : en);
  const reaction = reactions.find((item) => item.id === paper.reactionId);
  const related = papers.filter((item) => item.slug !== paper.slug && (item.reactionId === paper.reactionId || item.kind === "review")).slice(0, 2);
  const citationText = paper[format];

  useEffect(() => {
    const parameters = new URLSearchParams(window.location.search);
    let selected: Language = parameters.get("lang") === "en" ? "en" : "zh";
    try {
      if (!parameters.has("lang")) selected = localStorage.getItem("juna-language") === "en" ? "en" : "zh";
      const saved = sessionStorage.getItem("juna-home-return");
      if (saved) {
        const destination = new URL(saved, window.location.origin);
        if (destination.origin === window.location.origin && ["/juna/", "/juna"].includes(destination.pathname)) {
          setReturnUrl(`${destination.pathname}${destination.search}${destination.hash || "#publications"}`);
        }
      }
    } catch { /* Persistence is optional when browser storage is unavailable. */ }
    setLang(selected);
    document.documentElement.lang = selected === "zh" ? "zh-CN" : "en";
    const restoreLanguage = () => {
      const parameters = new URLSearchParams(window.location.search);
      let selected: Language = parameters.get("lang") === "en" ? "en" : "zh";
      if (!parameters.has("lang")) {
        try { selected = localStorage.getItem("juna-language") === "en" ? "en" : "zh"; } catch { /* Fall back to Chinese. */ }
      }
      setLang(selected);
      document.documentElement.lang = selected === "zh" ? "zh-CN" : "en";
    };
    window.addEventListener("juna:history", restoreLanguage);
    return () => window.removeEventListener("juna:history", restoreLanguage);
  }, []);

  useEffect(() => {
    if (copyState === "manual") {
      manualRef.current?.focus();
      manualRef.current?.select();
    }
  }, [copyState, format]);

  function changeLanguage(selected: Language) {
    setLang(selected);
    document.documentElement.lang = selected === "zh" ? "zh-CN" : "en";
    try { localStorage.setItem("juna-language", selected); } catch { /* Keep the control available without storage. */ }
    const current = new URL(window.location.href);
    current.searchParams.set("lang", selected);
    window.history.replaceState(window.history.state, "", `${current.pathname}${current.search}${current.hash}`);
  }

  async function copyCitation() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(citationText);
      setCopyState("success");
    } catch {
      setCopyState("manual");
    }
  }

  const home = new URL(returnUrl, "https://arcxya09.github.io");
  home.searchParams.set("lang", lang);
  const back = `${home.pathname}${home.search}${home.hash || "#publications"}`;

  return (
    <div className="publication-detail">
      <a className="publication-detail-skip" href="#publication-content">{t("跳转至论文内容", "Skip to publication")}</a>
      <header className="publication-detail-header">
        <a className="publication-detail-brand" href={back} aria-label={t("JUNA 首页", "JUNA home")}><strong>JUNA</strong><span>{t("锦屏深地核天体物理实验", "Jinping Underground Experiment\nfor Nuclear Astrophysics")}</span></a>
        <div className="publication-detail-language" role="group" aria-label={t("页面语言", "Page language")}>
          <button onClick={() => changeLanguage("zh")} aria-pressed={lang === "zh"}>中文</button><span aria-hidden="true">/</span><button onClick={() => changeLanguage("en")} aria-pressed={lang === "en"}>EN</button>
        </div>
      </header>

      <main id="publication-content" className="publication-detail-main">
        <a className="publication-detail-back" href={back}><ArrowLeft size={17} aria-hidden="true" />{home.hash === "#science" ? t("返回科学研究", "Back to research") : t("返回研究成果", "Back to publications")}</a>
        <article>
          <div className="publication-detail-kicker"><span>{t("公开研究成果", "PUBLICATIONS")}</span><span>{paper.year} / {paper.kind === "review" ? t("综述", "REVIEW") : t("研究论文", "RESEARCH ARTICLE")}</span></div>
          <div className="publication-detail-intro">
            <div>
              <h1>{paper.title[l]}</h1>
              <p className="publication-detail-subtitle">{paper.englishTitle}</p>
              <p className="publication-detail-summary">{paper.summary[l]}</p>
            </div>
            <aside className="publication-detail-record" aria-label={t("发表信息", "Publication details")}>
              <span className="publication-detail-record-label">{t("期刊来源", "JOURNAL RECORD")}</span>
              <h2>{paper.journal}</h2>
              <p>{paper.volume}, {paper.pages} ({paper.year})</p>
              {paper.publishedOnline && <p className="publication-detail-online">{t("在线发表", "Published online")}<br /><time dateTime={paper.publishedOnline}>{paper.publishedOnline}</time></p>}
              <a className="publication-detail-primary" href={paper.url} target="_blank" rel="noreferrer">{t("阅读期刊原文", "Read journal article")}<ExternalLink size={17} aria-hidden="true" /></a>
            </aside>
          </div>

          <div className="publication-detail-body">
            <section className="publication-detail-context" aria-labelledby="publication-research-heading">
              <span className="publication-detail-section-number">01 / {t("研究内容", "RESEARCH CONTEXT")}</span>
              <h2 id="publication-research-heading">{paper.kind === "review" ? t("从平台到科学任务", "From the platform to the science") : t("这项研究说明了什么", "What the study tells us")}</h2>
              <p>{paper.detail[l]}</p>
              <div className="publication-detail-source-note"><span>{t("来源说明", "SOURCE NOTE")}</span><p>{t("本页提供论文要点与相关研究背景。实验数据、分析方法和完整作者名单以期刊发表版本为准。", "This page summarises the study and its research context. Consult the published journal version for experimental data, analysis methods and the complete author list.")}</p><a href={paper.url} target="_blank" rel="noreferrer">DOI: {paper.doi}<ArrowUpRight size={15} aria-hidden="true" /></a></div>
              {reaction && <a className="publication-detail-reaction" href={assetPath(`/research/${reaction.id}/?lang=${lang}`)}><div><span>{t("相关科学任务", "RELATED SCIENTIFIC PROGRAMME")}</span><strong>{reaction.formula}</strong><p>{reaction.tag[l]}</p></div><ArrowUpRight size={23} aria-hidden="true" /></a>}
            </section>

            <section className="publication-detail-citation" aria-labelledby="publication-citation-heading">
              <span className="publication-detail-section-number">02 / {t("引用与导出", "CITE & EXPORT")}</span>
              <h2 id="publication-citation-heading">{t("引用这篇论文", "Cite this paper")}</h2>
              <p className="publication-detail-authors"><span>{t("作者", "Authors")}</span>{paper.authors}</p>
              <div className="publication-detail-format" role="group" aria-label={t("引用格式", "Citation format")}>
                <button aria-pressed={format === "citation"} onClick={() => { setFormat("citation"); setCopyState("idle"); }}>{t("文本引用", "Text citation")}</button><button aria-pressed={format === "bibtex"} onClick={() => { setFormat("bibtex"); setCopyState("idle"); }}>BibTeX</button>
              </div>
              <pre className="publication-detail-citation-text" tabIndex={0} aria-label={format === "bibtex" ? "BibTeX" : t("文本引用", "Text citation")}>{citationText}</pre>
              <div className="publication-detail-copy-actions">
                <button className="publication-detail-secondary" onClick={copyCitation}>{copyState === "success" ? <Check size={17} aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />}{copyState === "success" ? t("已复制", "Copied") : t("复制引用", "Copy citation")}</button>
                <a className="publication-detail-download" download={`${paper.slug}.bib`} href={`data:application/x-bibtex;charset=utf-8,${encodeURIComponent(paper.bibtex)}`}><Download size={17} aria-hidden="true" />{t("下载 .bib", "Download .bib")}</a>
              </div>
              <p className="publication-detail-copy-status" role="status" aria-live="polite">{copyState === "success" ? t("引用已复制到剪贴板。", "Citation copied to clipboard.") : copyState === "manual" ? t("请复制下方已选中的引用文本。", "Copy the selected citation below.") : ""}</p>
              {copyState === "manual" && <label className="publication-detail-manual">{t("手动复制引用", "Copy citation manually")}<textarea ref={manualRef} readOnly value={citationText} rows={format === "bibtex" ? 10 : 5} /></label>}
              <p className="publication-detail-export-note">{t("简式引用可能使用“et al.”或“and others”。投稿前请按期刊要求核对完整书目信息。", "Short citations may use “et al.” or “and others”. Check the journal record and your required citation style before submission.")}</p>
            </section>
          </div>
        </article>

        {related.length > 0 && <section className="publication-detail-related" aria-labelledby="publication-related-heading"><div><span className="publication-detail-section-number">{t("继续阅读", "CONTINUE READING")}</span><h2 id="publication-related-heading">{t("相关成果", "Related publications")}</h2></div><div className="publication-detail-related-grid">{related.map((item) => <a key={item.slug} href={assetPath(`/publications/${item.slug}/?lang=${lang}`)}><span>{item.journal} / {item.year}</span><h3>{item.title[l]}</h3><ArrowUpRight size={22} aria-hidden="true" /></a>)}</div></section>}
      </main>

      <footer className="publication-detail-footer"><a href={back}>{t("返回 JUNA 网站", "Return to JUNA")}<ArrowLeft size={16} aria-hidden="true" /></a><p>{t("锦屏深地核天体物理实验", "Jinping Underground Experiment for Nuclear Astrophysics")}</p></footer>
    </div>
  );
}
