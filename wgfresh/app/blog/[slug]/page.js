import { blogPosts } from "../../../data/blog";
import BlogPost from "./BlogPost";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const post = blogPosts.find((p) => p.slug === params.slug);
  if (!post) return {};
  return {
    title: `${post.title} — WebGrid Blog`,
    description: post.excerpt,
    keywords: post.tags?.join(", "),
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default function BlogPostPage({ params }) {
  const post = blogPosts.find((p) => p.slug === params.slug);
  if (!post) notFound();

  const related = blogPosts
    .filter((p) => p.id !== post.id && (
      p.category === post.category ||
      p.tags.some((t) => post.tags.includes(t))
    ))
    .slice(0, 3);

  return <BlogPost post={post} related={related} />;
}
