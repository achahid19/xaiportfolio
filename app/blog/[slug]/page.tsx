import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getBlogPostBySlug, getBlogPosts } from "@/lib/blog";

type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.excerpt
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <section className="section page-hero">
      <article className="container hero-card">
        <span className="eyebrow">{post.tags.join(" / ")}</span>
        <h1 className="article-title hero-title">{post.title}</h1>
        <p className="article-copy">{post.excerpt}</p>
        <div className="meta-row">
          <span className="chip">{post.date}</span>
          <span className="chip">Markdown-powered</span>
        </div>
        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </section>
  );
}
