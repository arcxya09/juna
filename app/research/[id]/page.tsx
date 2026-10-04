import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { reactions } from "../../site-data";
import { ResearchDetail } from "../../research-detail";

export const dynamicParams = false;

export function generateStaticParams() {
  return reactions.map(({ id }) => ({ id }));
}

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const reaction = reactions.find((item) => item.id === id);
  if (!reaction) return { title: "未找到研究方向 · JUNA" };
  const url = `https://arcxya09.github.io/juna/research/${reaction.id}/`;
  return {
    title: `${reaction.formula} · ${reaction.title[0]} · JUNA`,
    description: reaction.task[0],
    alternates: { canonical: url },
    openGraph: { title: `${reaction.formula} · JUNA`, description: reaction.task[1], url, type: "website", siteName: "JUNA", images: [{ url: "https://arcxya09.github.io/juna/images/accelerator.webp", width: 1400, height: 1050 }] },
  };
}

export default async function ResearchPage({ params }: PageProps) {
  const { id } = await params;
  const reaction = reactions.find((item) => item.id === id);
  if (!reaction) notFound();
  return <ResearchDetail reaction={reaction} />;
}
