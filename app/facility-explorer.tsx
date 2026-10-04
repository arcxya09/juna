"use client";

import { useEffect, useRef, useState } from "react";
import { Activity, ArrowRight, ExternalLink, Focus, Radio, Zap } from "lucide-react";
import { Tabs as TabsPrimitive } from "radix-ui";
import { assetPath } from "@/lib/asset-path";
import "./facility-explorer.css";

const review = "https://doi.org/10.1007/s41365-024-01590-3";
type Pair = [string, string];
type Stage = {
  id: string;
  name: Pair;
  short: Pair;
  role: Pair;
  description: Pair;
  fact: Pair;
  value: string | Pair;
  note: Pair;
  source: Pair;
  icon: typeof Radio;
};

const stages: Stage[] = [
  {
    id: "source", name: ["强流离子源", "High-current ion source"], short: ["产生离子", "Produce ions"],
    role: ["把反应所需的粒子准备好", "Prepare the incident particles"],
    description: ["电子回旋共振（ECR）离子源提供质子及氦离子束。强流束流增加入射粒子数，为低概率反应积累足够的测量信号。", "An electron cyclotron resonance (ECR) source supplies proton and helium-ion beams. Intense beams increase the number of incident particles available for rare reactions."],
    fact: ["公开束流种类", "Reported ion species"], value: "H⁺ · He⁺ · He²⁺",
    note: ["电荷态决定离子通过电势差时获得的动能；同一种元素可以具有不同电荷态。", "Charge state determines the energy gained across a potential difference; one element can have different charge states."],
    source: ["装置综述 §2.1 · 离子源与加速器", "Facility review §2.1 · Sources and accelerator"], icon: Radio,
  },
  {
    id: "accelerator", name: ["静电加速器", "Electrostatic accelerator"], short: ["控制能量", "Set beam energy"],
    role: ["给束流设定反应能量", "Set the energy for the reaction"],
    description: ["加速电场使离子获得动能，束流能量经过校准后用于核反应测量。终端电压、离子电荷态与实验能量需要分别说明。", "The accelerating field gives ions kinetic energy. Calibrated beam energies are used for reaction measurements; terminal voltage and ion charge state have distinct meanings."],
    fact: ["标称终端电压", "Nominal terminal voltage"], value: "400 kV",
    note: ["能量增量 ΔE = qΔV。相同电势差下，He²⁺ 的能量增量是 He⁺ 的两倍；实验室系能量与质心系能量仍需转换。", "The energy gain is ΔE = qΔV. He²⁺ gains twice as much energy as He⁺ across the same potential difference. Laboratory and centre-of-mass energies require conversion."],
    source: ["装置综述 §2.1 · 400 kV 静电加速", "Facility review §2.1 · 400 kV electrostatic acceleration"], icon: Zap,
  },
  {
    id: "target", name: ["束流输运与靶站", "Beam transport & targets"], short: ["发生反应", "Induce reactions"],
    role: ["让束流与选定的靶核相遇", "Bring the beam to the target nuclei"],
    description: ["束流经过输运与聚焦后到达靶站。靶材料、冷却及束斑条件共同影响靶的稳定性和反应产额。", "Beam transport and focusing deliver ions to the target. Target composition, cooling and beam profile influence target stability and reaction yield."],
    fact: ["公开靶站方案", "Reported target setup"], value: ["冷却固体靶", "Cooled solid targets"],
    note: ["Run-1 公开方案包括冷却的高纯度同位素富集靶。靶材料及实验几何按具体反应配置。", "Published Run-1 setups include cooled, high-purity isotope-enriched targets. Materials and geometry depend on the reaction."],
    source: ["装置综述 §2.2 · 探测器与靶", "Facility review §2.2 · Detectors and targets"], icon: Focus,
  },
  {
    id: "detector", name: ["低本底探测", "Low-background detection"], short: ["记录信号", "Record signals"],
    role: ["把反应产物转换为测量数据", "Turn reaction products into measured data"],
    description: ["围绕反应靶布置的探测器记录反应信号。深地环境、材料选择与屏蔽共同降低本底，帮助识别稀少事件。", "Detectors around the target record reaction signals. The underground environment, material selection and shielding reduce background and help identify rare events."],
    fact: ["公开 γ / 中子探测系统", "Reported gamma / neutron detectors"], value: "BGO / ³He",
    note: ["BGO 阵列用于 γ 射线探测，³He 正比计数器阵列用于中子探测。探测效率和本底需按各实验独立评估。", "BGO arrays detect gamma rays; ³He proportional-counter arrays detect neutrons. Efficiency and background are assessed for each experiment."],
    source: ["装置综述 §2.2 · BGO 与 ³He 阵列", "Facility review §2.2 · BGO and ³He arrays"], icon: Activity,
  },
];

export function FacilityExplorer({ lang, motion }: { lang: 0 | 1; motion: boolean }) {
  const [selected, setSelected] = useState("accelerator");
  const [visible, setVisible] = useState(false);
  const [foreground, setForeground] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  const t = (zh: string, en: string) => lang === 0 ? zh : en;

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .08 });
    if (root.current) observer.observe(root.current);
    const update = () => setForeground(!document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", update); };
  }, []);

  return <div ref={root} className="facility-explorer" data-moving={motion && visible && foreground}>
    <TabsPrimitive.Root value={selected} onValueChange={setSelected} className="facility-explorer-tabs">
      <div className="facility-explorer-flow-head">
        <p className="facility-explorer-label">{t("从离子束到实验数据", "FROM ION BEAM TO EXPERIMENTAL DATA")}</p>
        <span className="facility-explorer-hint">{t("选择环节，查看功能与参数", "Select a stage to explore its role")}</span>
      </div>
      <TabsPrimitive.List className="facility-explorer-flow" aria-label={t("装置功能环节", "Facility stages")}>
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          return <TabsPrimitive.Trigger key={stage.id} value={stage.id} className="facility-explorer-node">
            <span className="facility-explorer-step">0{index + 1}</span>
            <span className="facility-explorer-symbol"><Icon size={28} strokeWidth={1.3} aria-hidden="true" /></span>
            <span className="facility-explorer-node-text"><strong>{stage.name[lang]}</strong><span>{stage.short[lang]}</span></span>
            {index < 3 && <span className={`facility-explorer-connector ${index === 2 ? "facility-explorer-connector-signal" : ""}`} aria-hidden="true"><i /><ArrowRight size={14} /></span>}
          </TabsPrimitive.Trigger>;
        })}
      </TabsPrimitive.List>
      <p className="facility-explorer-flow-note">{t("功能流程示意 · 非装置工程布局。前两段箭头表示束流，靶站至探测器的虚线表示反应信号。", "Functional schematic · Not an engineering layout. The first two arrows represent the beam; the dashed link from target to detector represents reaction signals.")}</p>
      <div className="facility-explorer-body">
        <figure className="facility-explorer-photo">
          <div className="facility-explorer-image-wrap"><img src={assetPath("/images/accelerator.webp")} alt={t("JUNA 加速器在地下实验大厅的真实全景照片", "Photograph of the JUNA accelerator in the underground experimental hall")} width={1400} height={1050} loading="lazy" decoding="async" /><span className="facility-explorer-photo-mark">JUNA · CJPL-II</span></div>
          <figcaption><span>{t("JUNA 加速器实景", "JUNA accelerator · Real facility photograph")}</span><a href="https://inrio.net/facilities" target="_blank" rel="noreferrer">{t("图片来源", "Image source")}<ExternalLink size={12} aria-hidden="true" /></a></figcaption>
        </figure>
        <div className="facility-explorer-detail-wrap">
          {stages.map((stage, index) => <TabsPrimitive.Content key={stage.id} value={stage.id} className="facility-explorer-detail">
            <p className="facility-explorer-detail-index">0{index + 1} <span>/</span> {stage.short[lang]}</p>
            <h3>{stage.role[lang]}</h3>
            <p className="facility-explorer-description">{stage.description[lang]}</p>
            <dl className="facility-explorer-fact"><div><dt>{stage.fact[lang]}</dt><dd>{typeof stage.value === "string" ? stage.value : stage.value[lang]}</dd></div></dl>
            <p className="facility-explorer-science-note">{stage.note[lang]}</p>
            <a className="facility-explorer-source" href={review} target="_blank" rel="noreferrer"><span>{stage.source[lang]}<small>NUCL SCI TECH 35, 217 (2024)</small></span><ExternalLink size={16} aria-hidden="true" /></a>
          </TabsPrimitive.Content>)}
        </div>
      </div>
    </TabsPrimitive.Root>
  </div>;
}
