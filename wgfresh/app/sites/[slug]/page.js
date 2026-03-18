import { webLinks, categories } from "../../../data/links";
import SiteDetailClient from "./SiteDetailClient";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return webLinks.map((l) => ({ slug: l.slug }));
}
export async function generateMetadata({ params }) {
  const link = webLinks.find((l) => l.slug === params.slug);
  if (!link) return {};
  return {
    title: `${link.title} — WebGrid`,
    description: link.longDesc?.slice(0, 160),
    keywords: link.tags?.join(", "),
  };
}
export default function SitePage({ params }) {
  const link = webLinks.find((l) => l.slug === params.slug);
  if (!link) notFound();
  const category = categories.find((c) => c.id === link.category);
  const related = (link.related || []).map((id) => webLinks.find((l) => l.id === id)).filter(Boolean);
  return <SiteDetailClient link={link} category={category} related={related} />;
}
