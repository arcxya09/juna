import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { papers } from "../../site-data";
import { PublicationDetail } from "../../publication-detail";

export const dynamicParams = false;

export function generateStaticParams() {
  return papers.map(({ slug }) => ({ slug }));
}

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const paper = papers.find((item) => item.slug === slug);
  if (!paper) return { title: "未找到论文 · JUNA" };
  const url = `https://arcxya09.github.io/juna/publications/${paper.slug}/`;
  return {
    title: `${paper.englishTitle} · JUNA`,
    description: paper.summary[0],
    alternates: { canonical: url },
    openGraph: {
      title: paper.englishTitle,
      description: paper.summary[1],
      url,
      type: "article",
      siteName: "JUNA",
      images: [{ url: "https://arcxya09.github.io/juna/images/accelerator.webp", width: 1400, height: 1050 }],
      ...(paper.publishedOnline ? { publishedTime: paper.publishedOnline } : {}),
    },
  };
}

export default async function PublicationPage({ params }: PageProps) {
  const { slug } = await params;
  const paper = papers.find((item) => item.slug === slug);
  if (!paper) notFound();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: paper.englishTitle,
    description: paper.summary[1],
    inLanguage: "en",
    identifier: paper.doi,
    sameAs: paper.url,
    url: `https://arcxya09.github.io/juna/publications/${paper.slug}/`,
    datePublished: paper.publishedOnline ?? paper.year,
    isPartOf: {
      "@type": "PublicationIssue",
      isPartOf: { "@type": "Periodical", name: paper.journal },
    },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <PublicationDetail paper={paper} />
    </>
  );
}
