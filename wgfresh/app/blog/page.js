import { blogPosts } from "../../data/blog";
import BlogList from "./BlogList";

export const metadata = {
  title: "Blog — WebGrid | Web Tips, Reviews & Digital Guides",
  description: "In-depth guides, comparisons, and tips about the web's best websites. Social media, search engines, streaming, productivity, finance and more.",
};

export default function BlogPage() {
  return <BlogList posts={blogPosts} />;
}
