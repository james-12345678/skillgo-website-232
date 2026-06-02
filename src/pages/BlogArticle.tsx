import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface BlogArticle {
  id: number;
  slug: string;
  title: string;
  content: string;
  metaDescription: string;
  metaTitle: string;
  createdAt: string;
  isPublished: boolean;
}

const BlogArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<BlogArticle | null>(null);
  const [allBlogs, setAllBlogs] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!slug) {
        setError('Invalid article slug');
        setLoading(false);
        return;
      }

      try {
        const response = await apiFetch(`/api/blogs/slug/${slug}`);
        if (!response.ok) {
          throw new Error('Blog not found');
        }
        const data = await response.json();
        setArticle(data);

        // Fetch all blogs for related articles
        const allBlogsResponse = await apiFetch('/api/blogs/public');
        if (allBlogsResponse.ok) {
          const blogsData = await allBlogsResponse.json();
          // Handle both array and paginated response formats
          const blogs = Array.isArray(blogsData) ? blogsData : (blogsData?.items || []);
          setAllBlogs(blogs);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load blog');
        console.error('Error fetching blog:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground/60">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!article || error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
          <Button asChild>
            <Link to="/blog">Back to Blog</Link>
          </Button>
        </div>
      </div>
    );
  }

  const relatedArticles = allBlogs.filter((a) => a.slug !== slug).slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      {/* Article Header */}
      <section className="py-8 sm:py-10 border-b border-slate-200/50">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <Link
            to="/blog"
            className="inline-flex items-center text-xs font-semibold text-logo-blue hover:text-logo-gold transition-colors mb-4"
          >
            <ArrowLeft className="mr-2 h-3 w-3" />
            Back to Blog
          </Link>

          <h1 className="text-lg sm:text-xl font-bold text-foreground mb-3">
            {article.title}
          </h1>
          <p className="text-sm text-foreground/70 leading-relaxed mb-4">
            {article.metaDescription}
          </p>
          <p className="text-xs text-foreground/60">
            {new Date(article.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-8 sm:py-10">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <div className="prose prose-sm max-w-none">
            {article.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-sm text-foreground/80 leading-relaxed mb-4 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-10 pt-8 border-t border-slate-200/50">
            <Link
              to="/blog"
              className="inline-flex items-center text-sm font-semibold text-logo-blue hover:text-logo-gold transition-colors"
            >
              ← Back to all articles
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BlogArticle;
