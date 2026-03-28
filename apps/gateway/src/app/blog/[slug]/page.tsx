import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { Navbar } from "@/components/navbar";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Not Found" };

  return {
    title: `${post.title} — DataToRAG`,
    description: post.excerpt,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      url: `https://datatorag.com/blog/${slug}`,
      ...(post.ogImage ? { images: [{ url: post.ogImage }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: { "@type": "Organization", name: post.author },
    publisher: {
      "@type": "Organization",
      name: "DataToRAG",
      url: "https://datatorag.com",
    },
    mainEntityOfPage: `https://datatorag.com/blog/${slug}`,
  };

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <article className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />

          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M10 12L6 8l4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Blog
          </Link>

          <header className="mt-8">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <span className="text-border">·</span>
              <span>{post.readTime}</span>
            </div>
            <h1 className="mt-4 font-display text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
              {post.title}
            </h1>
          </header>

          <div
            className="prose mt-10"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
        </article>
      </main>
    </>
  );
}
