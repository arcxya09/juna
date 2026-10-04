"use client";
import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";

type Reaction = { id:string; input:string; product:string; particle:string; type:string[] };
export function ReactionExplorer({ reaction:r, lang, motion }: { reaction:Reaction; lang:0|1; motion:boolean }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [visible, setVisible] = useState(false);
  const [foreground, setForeground] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  const t = (zh:string,en:string) => lang===0 ? zh : en;
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {threshold:.15});
    if(root.current) observer.observe(root.current);
    const visibility = () => setForeground(!document.hidden);
    visibility(); document.addEventListener("visibilitychange", visibility);
    return () => {observer.disconnect(); document.removeEventListener("visibilitychange",visibility);};
  }, []);
  useEffect(() => {
    if(!motion || !playing || !visible || !foreground) return;
    const timer = window.setInterval(() => setStep(s => (s+1)%3), 2300);
    return () => window.clearInterval(timer);
  },[motion,playing,visible,foreground]);
  const labels = [t("入射粒子","Incident particle"),t("核反应","Nuclear reaction"),t("反应产物","Reaction products")];
  const descriptions = [
    t(`${r.input.split(" + ")[1]} 粒子接近 ${r.input.split(" + ")[0]} 靶核。`,`${r.input.split(" + ")[1]} approaches the ${r.input.split(" + ")[0]} target nucleus.`),
    t("低能带电粒子可通过量子隧穿发生反应；绝大多数入射粒子不会发生目标反应。","Quantum tunnelling enables reactions at low energies; most incident particles do not undergo the target reaction."),
    t(`反应生成 ${r.product}。`, `The reaction produces ${r.product}.`)
  ];
  return <div ref={root} className="reaction-visual explorer">
    <div className="visual-top"><span>REACTION EXPLORER</span><span>{r.type[lang]}</span></div>
    <div className={`nuclear-stage stage-${step}`} role="img" aria-label={descriptions[step]}>
      <div className="nuclear-track" />
      <span className="nuclear-projectile">{r.input.split(" + ")[1]}</span>
      <div className="nuclear-core"><span>{step===2 ? r.product.split(" + ")[0] : r.input.split(" + ")[0]}</span><small>{step===2 ? t("产物核","PRODUCT") : t("靶核","TARGET")}</small></div>
      <span className={`nuclear-emission ${r.particle==='γ' ? 'photon' : ''}`}>{r.particle==='γ' && <svg viewBox="0 0 64 20" aria-hidden="true"><path d="M0 10Q4 -5 8 10T16 10T24 10T32 10T40 10T48 10T56 10T64 10" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>}{r.particle}</span>
    </div>
    <div className="reaction-equation"><span>{r.input}</span><span className="equation-yields">⟶</span><strong>{r.product}</strong></div>
    <div className="reaction-steps" aria-label={t("分步探索反应","Explore reaction steps")}>{labels.map((label,i)=><button key={label} aria-pressed={step===i} onClick={()=>{setPlaying(false);setStep(i);}}><span>0{i+1}</span>{label}</button>)}</div>
    <p className="step-description" aria-live={playing&&motion ? "off" : "polite"}>{descriptions[step]}</p>
    <div className="visual-bottom"><span>{t("概念示意 · 非轨迹或时间尺度模拟","CONCEPTUAL · NOT A TRAJECTORY OR TIMESCALE MODEL")}</span><div className="explorer-controls"><button className="animation-control" onClick={()=>{setStep(0);setPlaying(false);}} aria-label={t("重置反应","Reset reaction")}><RotateCcw size={16}/></button><button className="animation-control" onClick={()=>{setPlaying(false);setStep(s=>(s+1)%3);}} aria-label={t("下一步","Next step")}><SkipForward size={16}/></button><button className="animation-control" onClick={()=>setPlaying(p=>!p)} disabled={!motion} aria-label={playing&&motion ? t("暂停反应动画","Pause reaction animation") : t("播放反应动画","Play reaction animation")}>{playing&&motion ? <Pause size={16}/> : <Play size={16}/>}</button></div></div>
    <p className="reaction-caveat">{r.id==='fluorine' ? t("部分氧核激发态分支还会发射 γ 射线。","Excited-state oxygen branches can also emit gamma rays.") : r.id==='magnesium' ? t("²⁶Al 的基态与同质异能态需分别处理；此处 γ 表示俘获时的退激辐射，并非后续衰变的 1.809 MeV 谱线。","Ground and isomeric states of ²⁶Al require separate treatment. Here γ denotes capture de-excitation, not the later 1.809 MeV decay line.") : t("γ 为光子，n 为中子，p 为质子，α 为氦-4 原子核；γ 可包含级联辐射。","γ: photon · n: neutron · p: proton · α: helium-4 nucleus. Gamma emission may occur in a cascade.")}</p>
  </div>;
}
