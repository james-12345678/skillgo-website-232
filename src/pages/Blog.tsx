import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { apiFetch } from "@/lib/api";
import Footer from "@/components/Footer";

const ARTICLES_PER_PAGE = 10;

const Blog = () => {
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(ARTICLES_PER_PAGE);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await apiFetch('/api/blogs/public');
        if (!response.ok) {
          throw new Error(`Failed to fetch blogs: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Server returned non-JSON response');
        }

        const data = await response.json();
        // Handle both array and paginated response formats
        const posts = Array.isArray(data) ? data : (data?.items || []);
        setBlogPosts(posts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load blogs');
        setBlogPosts([]);
        console.error('Error fetching blogs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-12 sm:py-16 border-b-2 border-logo-gold/30 bg-gradient-to-br from-logo-gold/5 to-transparent">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl text-center">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-logo-blue to-logo-gold bg-clip-text text-transparent mb-4">
            Blog
          </h1>
          <p className="text-sm text-foreground/70 leading-relaxed max-w-2xl mx-auto">
            Insights and perspectives on AI, skills development, and the future of work.
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          {loading && (
            <div className="text-center py-16">
              <p className="text-base text-foreground/60">Loading blogs...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-16">
              <p className="text-base text-red-600">{error}</p>
            </div>
          )}

          {!loading && !error && blogPosts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-base text-foreground/60">No blogs published yet.</p>
            </div>
          )}

          {!loading && !error && blogPosts.length > 0 && (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
                {blogPosts.slice(0, displayCount).map((post) => (
                  <div
                    key={post.blogId || post.slug}
                    className="border border-logo-gold/20 rounded-lg p-4 hover:border-logo-gold/50 hover:bg-logo-gold/5 transition-colors"
                  >
                    <div className="space-y-3 h-full flex flex-col">
                      <h2 className="text-xs sm:text-sm font-bold text-foreground line-clamp-2">
                        {post.title}
                      </h2>
                      <p className="text-xs text-foreground/60">
                        {new Date(post.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-foreground/70 leading-relaxed flex-grow line-clamp-3">
                        {post.metaDescription}
                      </p>
                      <Link to={`/blog/${post.slug}`} className="mt-auto">
                        <Button
                          size="sm"
                          className="bg-logo-gold text-white hover:bg-logo-gold/90 text-xs h-auto px-3 py-1.5 w-full"
                        >
                          Read Article
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {displayCount < blogPosts.length && (
                <div className="mt-16 pt-12 border-t-2 border-logo-gold/30">
                  <h2 className="text-lg sm:text-xl font-bold text-foreground mb-8">More Articles</h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {blogPosts.slice(displayCount).map((post) => (
                      <div
                        key={post.blogId || post.slug}
                        className="border border-logo-gold/20 rounded-lg p-4 hover:border-logo-gold/50 hover:bg-logo-gold/5 transition-colors"
                      >
                        <div className="space-y-3 h-full flex flex-col">
                          <h3 className="text-xs sm:text-sm font-bold text-foreground line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-xs text-foreground/60">
                            {new Date(post.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                          <p className="text-xs text-foreground/70 leading-relaxed flex-grow line-clamp-3">
                            {post.metaDescription}
                          </p>
                          <Link to={`/blog/${post.slug}`} className="mt-auto">
                            <Button
                              size="sm"
                              className="bg-logo-gold text-white hover:bg-logo-gold/90 text-xs h-auto px-3 py-1.5 w-full"
                            >
                              Read Article
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
