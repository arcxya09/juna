"use client";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowRight, Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import "./reaction-explorer.css";

type Reaction = { id: string; input: string; product: string; particle: string; type: string[]; detector?: string[] };
const STEP_COUNT = 4;

function Photon() {
  return <svg viewBox="0 0 64 20" aria-hidden="true"><path d="M0 10Q4 -5 8 10T16 10T24 10T32 10T40 10T48 10T56 10T64 10" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>;
}

export function ReactionExplorer({ reaction: r, lang, motion }: { reaction: Reaction; lang: 0 | 1; motion: boolean }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [visible, setVisible] = useState(false);
  const [foreground, setForeground] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  const stepButtons = useRef<Array<HTMLButtonElement | null>>([]);
  const t = (zh: string, en: string) => lang === 0 ? zh : en;
  const neutron = r.id === "neutron";
  const fluorine = r.id === "fluorine";
  const magnesium = r.id === "magnesium";
  const [target, projectile] = r.input.split(" + ");
  const productNucleus = r.product.split(" + ")[0];
  const detectorName = neutron ? t("³He 中子探测阵列", "³He neutron detector array") : t("BGO γ 探测阵列", "BGO gamma detector array");
  const labels = [t("入射", "Incidence"), t("核反应", "Reaction"), t("产物", "Products"), t("探测记录", "Detection")];
  const descriptions = [
    t(`${projectile} 束流照射 ${target} 靶核；束流能量与粒子数由实验系统监测。`, `The ${projectile} beam irradiates ${target} target nuclei; beam energy and particle number are monitored.`),
    t("低能带电粒子可通过量子隧穿发生反应。绝大多数入射粒子不会发生目标反应。", "Quantum tunnelling enables reactions at low energies. Most incident particles do not undergo the target reaction."),
    fluorine
      ? t("生成氧核与 α 粒子。氧核激发态分支还会发射 γ 射线，可通过这些 γ 射线研究相应分支。", "The reaction produces oxygen and an alpha particle. Excited-state oxygen branches also emit gamma rays, which can be used to study those branches.")
      : t(`反应生成 ${r.product}。${neutron ? "释放的中子在慢化体中减速后被探测。" : "退激 γ 射线可直接发射，也可形成级联。"}`, `The reaction produces ${r.product}. ${neutron ? "Emitted neutrons are slowed in a moderator before detection." : "De-excitation gamma rays may be emitted directly or in a cascade."}`),
    neutron
      ? t("中子经聚乙烯慢化后，在 ³He 计数管中通过 ³He(n,p)³H 被俘获，产生电脉冲。脉冲幅度用于识别事件，不能直接视为入射中子能量。", "After moderation in polyethylene, neutrons are captured through ³He(n,p)³H in the counters, generating electrical pulses. Pulse height helps identify events; it is not a direct measure of the incident neutron energy.")
      : fluorine
        ? t("以公开的 ¹⁹F(p,αγ)¹⁶O 测量为例：BGO 记录氧核激发态退激 γ 射线的能量沉积，约束该分支的产额。", "In the published ¹⁹F(p,αγ)¹⁶O measurement, BGO records energy deposited by gamma rays from excited oxygen states, constraining the yield of that branch.")
        : t("γ 射线在 BGO 闪烁体中沉积能量并产生光信号，电子学记录事件。结合能谱、本底与探测效率分析，提取反应产额。", "Gamma rays deposit energy in BGO scintillators and produce light signals that are recorded as events. Energy spectra, backgrounds and detector efficiency are analysed to extract the reaction yield.")
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .15 });
    if (root.current) observer.observe(root.current);
    const visibility = () => setForeground(!document.hidden);
    visibility();
    document.addEventListener("visibilitychange", visibility);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", visibility); };
  }, []);

  useEffect(() => { setStep(0); setPlaying(true); }, [r.id]);

  useEffect(() => {
    if (!motion || !playing || !visible || !foreground) return;
    const timer = window.setTimeout(() => setStep(s => (s + 1) % STEP_COUNT), step === 3 ? 7000 : 3600);
    return () => window.clearTimeout(timer);
  }, [motion, playing, visible, foreground, step]);

  function selectStep(index: number) { setPlaying(false); setStep(index); }

  function navigateStep(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % STEP_COUNT;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index + STEP_COUNT - 1) % STEP_COUNT;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = STEP_COUNT - 1;
    else return;
    event.preventDefault(); selectStep(next); stepButtons.current[next]?.focus();
  }

  const activeMotion = motion && visible && foreground;
  return <div ref={root} className="reaction-visual explorer detection-explorer" data-animate={activeMotion}>
    <div className="visual-top"><span>REACTION EXPLORER</span><span>{String(step + 1).padStart(2, "0")} / 04</span></div>
    {step === 3 ? <div className={`detection-stage ${neutron ? "neutron-detection" : "gamma-detection"}`} role="img" aria-label={descriptions[3]}>
      <div className="detector-source"><strong>{productNucleus}{fluorine ? "*" : ""}</strong><span>{fluorine ? t("氧激发态分支", "Excited oxygen branch") : t("反应靶区", "Reaction target")}</span></div>
      <div className="detector-radiation"><span>{neutron ? "n" : "γ"}</span>{neutron ? <i /> : <Photon />}<ArrowRight size={17} aria-hidden="true" /></div>
      <div className="detector-body">
        <svg className="detector-icon" viewBox="0 0 120 88" aria-hidden="true">
          {neutron ? <><rect x="11" y="9" width="98" height="70" rx="4" className="detector-moderator" />{[30, 50, 70, 90].map(x => <g key={x}><rect x={x - 5} y="19" width="10" height="50" rx="5" /><path d={`M${x} 24V64`} /></g>)}</> : <>{[0, 60, 120, 180, 240, 300].map(angle => <path key={angle} d="M55 10H65L70 28L60 34L50 28Z" transform={`rotate(${angle} 60 44)`} />)}<circle cx="60" cy="44" r="14" /><path d="M44 44H76M60 28V60" className="detector-cross" /></>}
        </svg>
        <strong>{neutron ? "³He" : "BGO"}</strong><span>{neutron ? t("慢化 → 俘获", "Moderate → capture") : t("能量沉积 → 闪烁光", "Energy deposit → light")}</span>
      </div>
      <div className="detection-label">{detectorName}</div>
    </div> : <div className={`nuclear-stage stage-${step}`} role="img" aria-label={descriptions[step]}>
      <div className="nuclear-track" />
      <span className="nuclear-projectile">{projectile}</span>
      <div className="nuclear-core"><span>{step === 2 ? productNucleus : target}</span><small>{step === 2 ? t("产物核", "PRODUCT") : t("靶核", "TARGET")}</small></div>
      <span className={`nuclear-emission ${r.particle === "γ" ? "photon" : ""}`}>{r.particle === "γ" && <Photon />}{r.particle}</span>
      {fluorine && step === 2 && <span className="branch-emission"><Photon /><span>γ</span><small>{t("激发态分支", "Excited-state branch")}</small></span>}
    </div>}
    <div className="reaction-equation"><span>{r.input}</span><span className="equation-yields">⟶</span><strong>{r.product}</strong></div>
    <div className="reaction-steps" role="group" aria-label={t("分步探索：方向键切换步骤", "Explore steps: use arrow keys to navigate")}>{labels.map((label, i) => <button key={i} ref={element => { stepButtons.current[i] = element; }} aria-pressed={step === i} onClick={() => selectStep(i)} onKeyDown={event => navigateStep(event, i)}><span>0{i + 1}</span>{label}</button>)}</div>
    <p className="step-description" aria-live={playing && motion ? "off" : "polite"}>{descriptions[step]}</p>
    <div className="detection-records" data-active={step === 3} aria-label={t("从探测记录到反应产额的分析路径", "Analysis from detector records to reaction yield")}>
      <div><span>01</span><strong>{t("事件记录", "Events")}</strong><p>{t("记录脉冲与探测器信息", "Record pulses and detector information")}</p></div>
      <div><span>02</span><strong>{neutron ? t("中子计数", "Neutron counts") : t("能谱分析", "Energy spectra")}</strong><p>{neutron ? t("脉冲筛选与本底扣除", "Pulse selection and background subtraction") : t("选取信号，评估本底", "Select signals and evaluate backgrounds")}</p></div>
      <div><span>03</span><strong>{t("反应产额", "Reaction yield")}</strong><p>{t("结合效率、束流与靶信息", "Use efficiency, beam and target information")}</p></div>
    </div>
    <div className="visual-bottom"><span>{t("概念示意 · 无实验数据或真实时间尺度", "CONCEPTUAL · NO EXPERIMENTAL DATA OR REAL TIMESCALE")}</span><div className="explorer-controls"><button className="animation-control" onClick={() => selectStep(0)} aria-label={t("重置反应", "Reset reaction")} title={t("重置", "Reset")}><RotateCcw size={16} /></button><button className="animation-control" onClick={() => selectStep((step + 1) % STEP_COUNT)} aria-label={t("下一步", "Next step")} title={t("下一步", "Next step")}><SkipForward size={16} /></button><button className="animation-control" onClick={() => setPlaying(p => !p)} disabled={!motion} aria-label={playing && motion ? t("暂停反应动画", "Pause reaction animation") : t("播放反应动画", "Play reaction animation")} title={!motion ? t("关闭动效时可手动切换步骤", "Select steps manually when motion is off") : playing ? t("暂停", "Pause") : t("播放", "Play")} aria-pressed={playing && motion}>{playing && motion ? <Pause size={16} /> : <Play size={16} />}</button></div></div>
    <p className="reaction-caveat">{fluorine ? t("探测示例对应 ¹⁹F(p,αγ)¹⁶O 分支；通向氧基态的 (p,α₀) 分支需单独测量。", "The detection example shows the ¹⁹F(p,αγ)¹⁶O branch. The (p,α₀) branch leading to the oxygen ground state requires a separate measurement.") : magnesium ? t("²⁶Al 基态与同质异能态需分别处理。这里的 γ 是俘获退激辐射；星际 1.809 MeV 谱线来自基态 ²⁶Al 后续衰变形成的 ²⁶Mg 激发态。", "Ground and isomeric states of ²⁶Al require separate treatment. These gamma rays come from capture de-excitation; the interstellar 1.809 MeV line comes from excited ²⁶Mg following ground-state ²⁶Al decay.") : neutron ? t("中子探测效率随中子能量等条件变化，必须标定。中子事件计数需要结合本底、效率、束流及靶信息分析。", "Neutron detection efficiency depends on neutron energy and other conditions and must be calibrated. Counts are analysed with backgrounds, efficiency, beam and target information.") : t("γ 为光子，α 为氦-4 核。BGO 测量的是能量沉积；不完全吸收、级联与探测效率均需在分析中考虑。", "γ denotes a photon and α a helium-4 nucleus. BGO measures energy deposition; incomplete absorption, cascades and detection efficiency must be included in the analysis.")}</p>
  </div>;
}
