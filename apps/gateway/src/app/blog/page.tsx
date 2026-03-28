import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "Blog — DataToRAG",
  description:
    "Insights on connecting enterprise data to AI assistants through the Model Context Protocol.",
  openGraph: {
    title: "Blog — DataToRAG",
    description:
      "Insights on connecting enterprise data to AI assistants through the Model Context Protocol.",
    type: "website",
    url: "https://datatorag.com/blog",
  },
};

export default function BlogListingPage() {
  const posts = getAllPosts();

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
          <div className="animate-fade-in-up">
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Blog
            </h1>
            <p className="mt-3 text-muted-foreground">
              Insights on making your data AI-ready.
            </p>
          </div>

          {posts.length === 0 ? (
            <p className="mt-16 text-center text-muted-foreground">
              Articles coming soon.
            </p>
          ) : (
            <div className="mt-12 space-y-6">
              {posts.map((post, i) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="animate-fade-in-up group block rounded-2xl border border-border p-6 transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-0.5"
                  style={{ animationDelay: `${0.1 + i * 0.05}s` }}
                >
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
                  <h2 className="mt-2 font-display text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
