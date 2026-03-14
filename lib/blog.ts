import fs from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

import type { BlogPost, BlogPostFrontmatter } from "@/lib/types";

const postsDirectory = path.join(process.cwd(), "content", "blog");

function sortByDateDescending<T extends { date: string }>(items: T[]) {
  return [...items].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getBlogPosts(): Promise<BlogPostFrontmatter[]> {
  const files = await fs.readdir(postsDirectory);
  const posts = await Promise.all(
    files
      .filter((file) => file.endsWith(".md"))
      .map(async (file) => {
        const filePath = path.join(postsDirectory, file);
        const source = await fs.readFile(filePath, "utf8");
        const { data } = matter(source);

        return data as BlogPostFrontmatter;
      })
  );

  return sortByDateDescending(posts).filter((post) => post.published);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await fs.readdir(postsDirectory);
  const match = posts.find((file) => file === `${slug}.md`);

  if (!match) {
    return null;
  }

  const source = await fs.readFile(path.join(postsDirectory, match), "utf8");
  const { data, content } = matter(source);
  const rendered = await remark().use(html).process(content);

  return {
    ...(data as BlogPostFrontmatter),
    content: rendered.toString()
  };
}
