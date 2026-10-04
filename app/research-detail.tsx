"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, ExternalLink } from "lucide-react";
import type { Reaction } from "./site-data";
import { papers, reactions } from "./site-data";
import { ReactionExplorer } from "./reaction-explorer";
import { assetPath } from "@/lib/asset-path";
import "./research-detail.css";

type Language = "zh" | "en";

export function ResearchDetail({ reaction }: { reaction: Reaction }) {
  const [lang, setLang] = useState<Language>("zh");
  const [motion, setMotion] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [returnUrl, setReturnUrl] = useState(assetPath(`/?r=${reaction.id}#science`));
  const l = lang === "zh" ? 0 : 1;
  const t = (zh: string, en: string) => lang === "zh" ? zh : en;
  const references = reaction.references.map((slug) => papers.find((paper) => paper.slug === slug)).filter((paper) => paper !== undefined);

  useEffect(() => {
    const parameters = new URLSearchParams(window.location.search);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let selected: Language = parameters.get("lang") === "en" ? "en" : "zh";
    let enabled = true;
    try {
      if (!parameters.has("lang")) selected = localStorage.getItem("juna-language") === "en" ? "en" : "zh";
      const savedMotion = localStorage.getItem("juna-motion");
      enabled = savedMotion !== "off" && savedMotion !== "false";
      const saved = sessionStorage.getItem("juna-home-return");
      if (saved) {
        const destination = new URL(saved, window.location.origin);
        if (destination.origin === window.location.origin && ["/juna/", "/juna"].includes(destination.pathname)) setReturnUrl(`${destination.pathname}${destination.search}#science`);
      }
    } catch { /* The page also works when browser storage is unavailable. */ }
    setLang(selected);
    document.documentElement.lang = selected === "zh" ? "zh-CN" : "en";
    setReduceMotion(reduced.matches);
    setMotion(enabled && !reduced.matches);
    const preferenceChange = () => {
      setReduceMotion(reduced.matches);
      let preferred = true;
      try { const savedMotion = localStorage.getItem("juna-motion"); preferred = savedMotion !== "off" && savedMotion !== "false"; } catch { /* Use the system preference. */ }
      setMotion(preferred && !reduced.matches);
    };
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
    reduced.addEventListener("change", preferenceChange);
    return () => {
      window.removeEventListener("juna:history", restoreLanguage);
      reduced.removeEventListener("change", preferenceChange);
    };
  }, []);

  function changeLanguage(selected: Language) {
    setLang(selected);
    document.documentElement.lang = selected === "zh" ? "zh-CN" : "en";
    try { localStorage.setItem("juna-language", selected); } catch { /* Persistence is optional. */ }
    const current = new URL(window.location.href);
    current.searchParams.set("lang", selected);
    window.history.replaceState(window.history.state, "", `${current.pathname}${current.search}${current.hash}`);
  }

  function changeMotion() {
    if (reduceMotion) return;
    const enabled = !motion;
    setMotion(enabled);
    try { localStorage.setItem("juna-motion", enabled ? "on" : "off"); } catch { /* Keep manual controls available. */ }
  }

  const home = new URL(returnUrl, "https://arcxya09.github.io");
  home.searchParams.set("lang", lang);
  home.searchParams.set("r", reaction.id);
  const back = `${home.pathname}${home.search}#science`;

  return (
    <div className={`research-detail tone-${reaction.tone}`}>
      <a className="research-detail-skip" href="#research-content">{t("跳转至研究内容", "Skip to research content")}</a>
      <header className="research-detail-header">
        <a className="research-detail-brand" href={back}><strong>JUNA</strong><span>{t("锦屏深地核天体物理实验", "Jinping Underground Experiment\nfor Nuclear Astrophysics")}</span></a>
        <div className="research-detail-language" role="group" aria-label={t("页面语言", "Page language")}><button onClick={() => changeLanguage("zh")} aria-pressed={lang === "zh"}>中文</button><span aria-hidden="true">/</span><button onClick={() => changeLanguage("en")} aria-pressed={lang === "en"}>EN</button></div>
      </header>

      <main id="research-content" className="research-detail-main">
        <a className="research-detail-back" href={back}><ArrowLeft size={17} aria-hidden="true" />{t("返回科学研究", "Back to the science programme")}</a>
        <div className="research-detail-kicker"><span>{t("核心研究方向", "CORE RESEARCH PROGRAMME")}</span><span>{reaction.type[l]}</span></div>
        <div className="research-detail-intro"><div><p className="research-detail-formula">{reaction.formula}</p><h1>{reaction.title[l]}</h1><p className="research-detail-context">{reaction.text[l]}</p></div><aside className="research-detail-goal"><span>01 / {t("实验目标", "EXPERIMENTAL GOAL")}</span><p>{reaction.task[l]}</p><div><span>{t("入射体系", "INCIDENT SYSTEM")}</span><strong>{reaction.input}</strong><ArrowRight size={20} aria-hidden="true" /><span>{t("反应产物", "REACTION PRODUCTS")}</span><strong>{reaction.product}</strong></div></aside></div>

        <section className="research-detail-measurement" aria-labelledby="research-measurement-heading"><div className="research-detail-section-heading"><div><span className="research-detail-section-number">02 / {t("从核反应到实验记录", "FROM REACTION TO MEASUREMENT")}</span><h2 id="research-measurement-heading">{t("探索测量过程", "Explore the measurement")}</h2></div><p>{reaction.detector[l]}</p></div><div className="research-detail-explorer"><ReactionExplorer reaction={reaction} lang={l} motion={motion} /></div><div className="research-detail-motion"><button onClick={changeMotion} role="switch" aria-checked={motion} disabled={reduceMotion}><span aria-hidden="true" className={motion ? "is-on" : ""} />{t("自动演示", "Automatic demonstration")}</button><p>{reduceMotion ? t("已遵循系统减少动效设置，可使用分步按钮探索。", "Following the system’s reduced-motion setting. Explore using the step controls.") : t("可暂停、单步前进或直接选择步骤。离开可视区域后自动演示暂停。", "Pause, advance one step or select a stage. Automatic playback pauses when the guide leaves the viewport.")}</p></div></section>

        <section className="research-detail-progress" aria-labelledby="research-progress-heading"><div><span className="research-detail-section-number">03 / {t("公开进展与目标", "PUBLIC PROGRESS & GOALS")}</span><h2 id="research-progress-heading">{t("连接实验与恒星模型", "Connecting experiments to stellar models")}</h2><p>{reaction.publicProgress[l]}</p><p className="research-detail-note">{t("下列论文提供本研究方向的公开依据。实验数值、方法与结论范围以期刊发表版本为准。", "The publications below provide public references for this programme. Consult the journal versions for numerical results, methods and the scope of the conclusions.")}</p></div><div className="research-detail-papers">{references.map((paper) => <article key={paper.slug}><span>{paper.journal} / {paper.year} · {paper.kind === "review" ? t("综述", "Review") : t("研究论文", "Research article")}</span><h3><a href={assetPath(`/publications/${paper.slug}/?lang=${lang}`)}>{paper.title[l]}<ArrowUpRight size={21} aria-hidden="true" /></a></h3><p>{paper.summary[l]}</p><a className="research-detail-doi" href={paper.url} target="_blank" rel="noreferrer">DOI: {paper.doi}<ExternalLink size={13} aria-hidden="true" /></a></article>)}</div></section>

        <nav className="research-detail-programmes" aria-label={t("其他核心研究方向", "Other core research programmes")}><span className="research-detail-section-number">{t("探索其他研究方向", "EXPLORE THE PROGRAMME")}</span><div>{reactions.map((item) => <a key={item.id} aria-current={item.id === reaction.id ? "page" : undefined} href={assetPath(`/research/${item.id}/?lang=${lang}`)}><strong>{item.formula}</strong><span>{item.tag[l]}</span><ArrowUpRight size={18} aria-hidden="true" /></a>)}</div></nav>
      </main>
      <footer className="research-detail-footer"><a href={back}><ArrowLeft size={16} aria-hidden="true" />{t("返回 JUNA 科学研究", "Return to JUNA science")}</a><p>{t("锦屏深地核天体物理实验", "Jinping Underground Experiment for Nuclear Astrophysics")}</p></footer>
    </div>
  );
}
