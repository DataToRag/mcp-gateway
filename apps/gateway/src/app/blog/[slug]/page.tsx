import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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

function AuthorAvatar({
  author,
  authorImage,
}: {
  author: string;
  authorImage?: string;
}) {
  if (authorImage) {
    return (
      <Image
        src={authorImage}
        alt={author}
        width={32}
        height={32}
        className="rounded-full object-cover"
      />
    );
  }

  const initials = author
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
      {initials}
    </div>
  );
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
    author: {
      "@type": "Person",
      name: post.author,
      ...(post.authorImage
        ? { image: `https://datatorag.com${post.authorImage}` }
        : {}),
    },
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
            {post.category && (
              <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                {post.category}
              </span>
            )}
            <h1
              className={`font-display text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl ${post.category ? "mt-3" : ""}`}
            >
              {post.title}
            </h1>

            <div className="mt-5 flex items-center gap-3">
              <AuthorAvatar
                author={post.author}
                authorImage={post.authorImage}
              />
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
                <span className="font-medium text-foreground">
                  {post.author}
                </span>
                <span className="text-border">·</span>
                <time
                  dateTime={post.date}
                  className="text-muted-foreground"
                >
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                <span className="text-border">·</span>
                <span className="text-muted-foreground">{post.readTime}</span>
              </div>
            </div>
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
