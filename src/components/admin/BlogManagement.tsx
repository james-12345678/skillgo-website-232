import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

interface Blog {
  id: number;
  title: string;
  slug: string;
  content: string;
  metaDescription: string;
  metaTitle: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export const BlogManagement = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    metaDescription: "",
    metaTitle: "",
    isPublished: false,
  });

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await apiFetch("/api/blogs");
      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Unauthorized. You must be logged in as an admin.");
        } else {
          throw new Error("Failed to fetch blogs");
        }
        setBlogs([]);
        return;
      }
      const data = await response.json();
      // Handle both array and paginated response formats
      let blogList = Array.isArray(data) ? data : (data?.items || []);

      // Normalize blog objects to ensure they have 'id' field
      blogList = blogList.map(blog => ({
        ...blog,
        id: blog.id || blog.blogId,
      }));

      setBlogs(blogList);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      toast.error("Failed to load blogs");
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (blog?: Blog) => {
    if (blog) {
      setEditingBlog(blog);
      setFormData({
        title: blog.title,
        content: blog.content,
        metaDescription: blog.metaDescription,
        metaTitle: blog.metaTitle,
        isPublished: blog.isPublished,
      });
    } else {
      setEditingBlog(null);
      setFormData({
        title: "",
        content: "",
        metaDescription: "",
        metaTitle: "",
        isPublished: false,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.title || !formData.content) {
        toast.error("Title and content are required");
        return;
      }

      if (editingBlog && !editingBlog.id) {
        throw new Error("Blog ID is missing. Cannot update blog.");
      }

      const url = editingBlog ? `/api/blogs/${editingBlog.id}` : "/api/blogs";
      const method = editingBlog ? "PUT" : "POST";

      console.log(`${method} ${url}`, formData);

      const response = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to ${editingBlog ? "update" : "create"} blog`);
        } catch (e) {
          throw new Error(`Failed to ${editingBlog ? "update" : "create"} blog (Status: ${response.status})`);
        }
      }

      let result;
      try {
        result = await response.json();
      } catch (e) {
        throw new Error("Invalid response from server");
      }

      if (editingBlog) {
        setBlogs(blogs.map(b => (b.id === result.id || b.id === result.blogId ? result : b)));
        toast.success("Blog updated successfully");
        await fetchBlogs();
      } else {
        setBlogs([result, ...blogs]);
        toast.success("Blog created successfully");
        await fetchBlogs();
      }

      setIsDialogOpen(false);
      setEditingBlog(null);
      setFormData({
        title: "",
        content: "",
        metaDescription: "",
        metaTitle: "",
        isPublished: false,
      });
    } catch (error) {
      console.error("Error saving blog:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save blog");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) {
      return;
    }

    try {
      if (!id) {
        throw new Error("Blog ID is missing. Cannot delete blog.");
      }

      setIsDeleting(true);
      console.log(`DELETE /api/blogs/${id}`);
      const response = await apiFetch(`/api/blogs/${id}`, { method: "DELETE" });

      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete blog");
        } catch (e) {
          throw new Error(`Failed to delete blog (Status: ${response.status})`);
        }
      }

      setBlogs(blogs.filter(b => b.id !== id));
      toast.success("Blog deleted successfully");
      await fetchBlogs();
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete blog");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Blog Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="bg-gradient-to-r from-logo-blue to-logo-gold hover:from-logo-blue/90 hover:to-logo-gold/90 text-white font-bold"
              onClick={() => handleOpenDialog()}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Blog
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingBlog ? "Edit Blog" : "Create New Blog"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Blog title"
                />
              </div>

              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Blog content"
                  rows={6}
                />
              </div>

              <div>
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Input
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, metaDescription: e.target.value })
                  }
                  placeholder="Short description for previews"
                />
              </div>

              <div>
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, metaTitle: e.target.value })
                  }
                  placeholder="SEO title"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) =>
                    setFormData({ ...formData, isPublished: e.target.checked })
                  }
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isPublished" className="mb-0 cursor-pointer">
                  Publish this blog
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setEditingBlog(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-logo-blue to-logo-gold hover:from-logo-blue/90 hover:to-logo-gold/90 text-white font-bold"
              >
                {editingBlog ? "Update Blog" : "Create Blog"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-logo-blue" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">All Blogs</CardTitle>
          </CardHeader>
          <CardContent>
            {blogs.length === 0 ? (
              <p className="text-center py-8 text-foreground/60">
                No blogs yet. Create one to get started!
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow key="header">
                      <TableHead className="text-xs">Title</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Created</TableHead>
                      <TableHead className="text-right text-xs">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blogs.map((blog) => (
                      <TableRow key={`blog-${blog.id}`}>
                        <TableCell className="font-medium text-xs max-w-xs truncate">{blog.title}</TableCell>
                        <TableCell>
                          <Badge
                            variant={blog.isPublished ? "default" : "secondary"}
                            className={
                              blog.isPublished
                                ? "bg-logo-blue/20 text-logo-blue border-logo-blue text-xs"
                                : "text-xs"
                            }
                          >
                            {blog.isPublished ? "Published" : "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(blog.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDialog(blog)}
                              className="text-logo-blue hover:bg-logo-blue/10"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(blog.id)}
                              disabled={isDeleting}
                              className="text-red-600 hover:bg-red-50"
                            >
                              {isDeleting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
