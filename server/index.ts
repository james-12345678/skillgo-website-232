import express from "express";
import cors from "cors";
import morgan from "morgan";
import { createProxyMiddleware, responseInterceptor } from "http-proxy-middleware";

const app = express();
const port = 3001;

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Helper function to calculate ISO week number
function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// Analytics handler function (reused by both endpoints)
async function handleAnalyticsRequest(req: express.Request, res: express.Response) {
  try {
    // Handle both "From"/"To" and "from"/"to" parameter names
    const fromParam = (req.query.From || req.query.from) as string;
    const toParam = (req.query.To || req.query.to) as string;

    if (!fromParam || !toParam) {
      return res.status(400).json({
        error: "Missing required query parameters: From and To (ISO 8601 datetime format)"
      });
    }

    // Parse and validate date parameters
    const fromDate = new Date(fromParam);
    const toDate = new Date(toParam);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return res.status(400).json({
        error: "Invalid date format. Use ISO 8601 format (e.g., 2024-01-01T00:00:00Z)"
      });
    }

    if (fromDate > toDate) {
      return res.status(400).json({
        error: "From date must be before To date"
      });
    }

    // Fetch completed interviews from the staging API
    const token = req.headers.authorization;
    const headers: Record<string, string> = {
      "Accept": "application/json",
    };
    if (token) {
      headers["Authorization"] = token;
    }

    // Fetch paginated interview data to find completed sessions
    let allCompletedInterviews: any[] = [];
    let pageNumber = 1;
    const pageSize = 50;
    let hasMore = true;

    while (hasMore) {
      try {
        const interviewUrl = `https://skillgo.africa/staging/api/interviews?pageNumber=${pageNumber}&pageSize=${pageSize}`;
        const response = await fetch(interviewUrl, { headers });

        if (!response.ok) {
          console.error(`Failed to fetch interviews page ${pageNumber}: ${response.status}`);
          break;
        }

        const data = await response.json();
        const interviews = Array.isArray(data) ? data : (data?.data || data?.interviews || []);

        if (!interviews || interviews.length === 0) {
          hasMore = false;
          break;
        }

        // Filter for completed interviews within date range
        const completedInRange = interviews.filter((interview: any) => {
          if (!interview.isCompleted && interview.isCompleted !== true) {
            return false;
          }

          // Check if completion date is within range
          const completedDate = interview.completedDate || interview.dateCompleted || interview.createdDate;
          if (!completedDate) return false;

          const completed = new Date(completedDate);
          return completed >= fromDate && completed <= toDate;
        });

        allCompletedInterviews.push(...completedInRange);
        pageNumber++;

        // Stop if we got fewer results than requested (last page)
        if (interviews.length < pageSize) {
          hasMore = false;
        }
      } catch (error) {
        console.error(`Error fetching interviews page ${pageNumber}:`, error);
        break;
      }
    }

    // Aggregate data by day, week, and month
    const dailyMap = new Map<string, number>();
    const weeklyMap = new Map<string, number>();
    const monthlyMap = new Map<string, number>();

    allCompletedInterviews.forEach((interview: any) => {
      const dateStr = interview.completedDate || interview.dateCompleted || interview.createdDate;
      if (!dateStr) return;

      const date = new Date(dateStr);

      // Daily: YYYY-MM-DD
      const dailyKey = date.toISOString().split('T')[0];
      dailyMap.set(dailyKey, (dailyMap.get(dailyKey) || 0) + 1);

      // Weekly: YYYY-Www (ISO week)
      const weekNumber = getISOWeek(date);
      const year = date.getFullYear();
      const weeklyKey = `${year}-W${String(weekNumber).padStart(2, '0')}`;
      weeklyMap.set(weeklyKey, (weeklyMap.get(weeklyKey) || 0) + 1);

      // Monthly: YYYY-MM
      const monthlyKey = date.toISOString().slice(0, 7);
      monthlyMap.set(monthlyKey, (monthlyMap.get(monthlyKey) || 0) + 1);
    });

    // Convert maps to sorted arrays
    const daily = Array.from(dailyMap.entries())
      .map(([period, count]) => ({ period, count }))
      .sort((a, b) => a.period.localeCompare(b.period));

    const weekly = Array.from(weeklyMap.entries())
      .map(([period, count]) => ({ period, count }))
      .sort((a, b) => a.period.localeCompare(b.period));

    const monthly = Array.from(monthlyMap.entries())
      .map(([period, count]) => ({ period, count }))
      .sort((a, b) => a.period.localeCompare(b.period));

    const total = allCompletedInterviews.length;

    res.json({
      daily,
      weekly,
      monthly,
      total,
      from: fromParam,
      to: toParam,
      recordsProcessed: allCompletedInterviews.length
    });
  } catch (error) {
    console.error("Analytics endpoint error:", error);
    res.status(500).json({
      error: "Failed to generate analytics",
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

// Register analytics endpoint at both paths for flexibility
app.get("/api/analytics", handleAnalyticsRequest);
app.get("/api/analytics/sessions", handleAnalyticsRequest);

// Payment endpoint
app.post("/api/payment/general-payment", async (req, res) => {
  try {
    const { customer, phoneNumber, amount } = req.body;

    if (!customer || !phoneNumber || !amount) {
      return res.status(400).json({
        error: "Missing required fields: customer, phoneNumber, amount"
      });
    }

    const payload = {
      customer,
      phoneNumber,
      amount
    };

    console.log("[Payment] Forwarding to staging API:", payload);

    const response = await fetch("https://skillgo.africa/staging/api/payment/general-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.text();

    if (!response.ok) {
      console.error("[Payment] API returned error:", response.status, data);
      return res.status(response.status).send(data);
    }

    console.log("[Payment] Success:", data);
    res.status(response.status).send(data);
  } catch (error: any) {
    console.error("[Payment] Error:", error.message);
    res.status(500).json({
      error: "Payment processing failed",
      message: error.message
    });
  }
});

// Payment response verification endpoint
app.get("/api/payment/response-page", async (req, res) => {
  try {
    const orderTrackingId = req.query.OrderTrackingId as string;
    const orderMerchantReference = req.query.OrderMerchantReference as string;
    const orderNotificationType = req.query.OrderNotificationType as string;

    if (!orderTrackingId) {
      return res.status(400).json({
        error: "Missing required parameter: OrderTrackingId"
      });
    }

    const params = new URLSearchParams();
    params.append("OrderTrackingId", orderTrackingId);
    if (orderMerchantReference) {
      params.append("OrderMerchantReference", orderMerchantReference);
    }
    if (orderNotificationType) {
      params.append("OrderNotificationType", orderNotificationType);
    }

    console.log("[Payment Response] Verifying payment:", { orderTrackingId, orderMerchantReference, orderNotificationType });

    const response = await fetch(`https://skillgo.africa/staging/api/payment/response-page?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[Payment Response] API returned error:", response.status, data);
      return res.status(response.status).json(data);
    }

    console.log("[Payment Response] Success:", data);
    res.status(200).json(data);
  } catch (error: any) {
    console.error("[Payment Response] Error:", error.message);
    res.status(500).json({
      error: "Payment verification failed",
      message: error.message
    });
  }
});

// Education levels endpoint
app.get("/api/users/education-levels", (req, res) => {
  const educationLevels = [
    {
      "label": "Certificate",
      "value": "certificate"
    },
    {
      "label": "Diploma",
      "value": "diploma"
    },
    {
      "label": "Degree",
      "value": "degree"
    },
    {
      "label": "Masters",
      "value": "masters"
    },
    {
      "label": "PhD",
      "value": "phd"
    }
  ];
  res.json(educationLevels);
});

// In-memory blog storage with initial seed data
let blogs: any[] = [
  {
    id: 1,
    title: "What Is the Global AI Talent Market?",
    content: "The Global AI Talent Market is the emerging ecosystem where AI‑native workers—engineers, designers, marketers, students, and independent builders—are connected, matched, and verified using AI‑driven tools.\n\nUnlike traditional job boards, the Global AI Talent Market doesn't just match resumes to titles. It focuses on AI‑literacy, prompt‑driven problem‑solving, and human‑AI collaboration as core, measurable skills.\n\nEmployers are no longer asking only \"Can you code?\" but \"Can you think with AI?\" This shift is creating a new class of roles—AI‑product owners, AI‑project managers, AI‑community builders, and AI‑augmented frontline workers—whose skills are fluid, project‑based, and hard to assess with old‑style CVs.\n\nSkillgo is part of this movement, helping AI‑native builders prove their Human‑AI Craft through real projects and reflective workflows, and enabling recruiters to see how candidates actually work with AI.",
    slug: "what-is-global-ai-talent-market",
    imageUrl: "",
    ogImage: "",
    isPublished: true,
    metaTitle: "What Is the Global AI Talent Market?",
    metaDescription: "The emerging ecosystem where AI‑native workers are connected, matched, and verified using AI‑driven tools.",
    createdAt: new Date("2024-01-15").toISOString(),
    updatedAt: new Date("2024-01-15").toISOString(),
  },
  {
    id: 2,
    title: "Why the Global AI Talent Market Is Growing Fast",
    content: "The Global AI Talent Market is growing fast because AI is no longer a \"nice‑to‑have\" but a core requirement across almost every domain—technology, education, healthcare, finance, and even manufacturing.\n\nWorkforce‑research reports show that AI model and application development and AI‑literacy are among the hardest‑to‑fill skills worldwide, with large gaps between what companies need and what talent is available.\n\nThis is where the Global AI Talent Market steps in. Instead of waiting for universities to catch up, companies are turning to hybrid, AI‑native talent pools—freelancers, gig workers, and self‑taught builders who are already shipping AI‑powered projects.\n\nSkillgo supports this shift by giving AI‑native builders a way to verify their Human‑AI Craft once and reuse it everywhere, while giving recruiters clearer, project‑based proof of AI‑savviness.",
    slug: "why-global-ai-talent-market-growing",
    imageUrl: "",
    ogImage: "",
    isPublished: true,
    metaTitle: "Why the Global AI Talent Market Is Growing Fast",
    metaDescription: "Workforce talent shortages and the rise of AI-native builders are reshaping how companies find and hire.",
    createdAt: new Date("2024-01-10").toISOString(),
    updatedAt: new Date("2024-01-10").toISOString(),
  },
  {
    id: 3,
    title: "How the Global AI Talent Market Changes Hiring",
    content: "The Global AI Talent Market is quietly changing how hiring actually works—from CV‑centric resumes to behavior‑centric verification of AI‑driven work.\n\nIn the past, recruiters relied on degrees, experience, and short interviews. Today, AI‑agents can draft job descriptions, screen cover letters, and even schedule interviews, freeing up humans to focus on real‑world judgment.\n\nThe Global AI Talent Market turbo‑charges this shift by:\n\n• Turning AI‑native builders' projects into verifiable proof\n\n• Enabling recruiters to see workflows, iteration, and collaboration, not just final outputs\n\n• Making Human‑AI Craft a repeatable, standardized skill that can be trusted across geographies\n\nSkillgo is building into this ecosystem, giving builders a way to show and verify their skills, and giving recruiters a way to trust what they see without relying only on generic claims.",
    slug: "global-ai-talent-market-changes-hiring",
    imageUrl: "",
    ogImage: "",
    isPublished: true,
    metaTitle: "How the Global AI Talent Market Changes Hiring",
    metaDescription: "From CV‑centric resumes to behavior‑centric verification of AI‑driven work.",
    createdAt: new Date("2024-01-05").toISOString(),
    updatedAt: new Date("2024-01-05").toISOString(),
  },
];
let blogIdCounter = 4;

// Helper to verify JWT and extract user (basic implementation)
function verifyJWT(token: string): { role?: string; userId?: string } | null {
  if (!token) return null;
  try {
    // In production, use proper JWT verification with secret
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

// Helper to check if user is SuperAdmin
function isSuperAdmin(req: express.Request): boolean {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return false;
  const token = authHeader.slice(7);
  const payload = verifyJWT(token);
  return payload?.role === 'SuperAdmin';
}

// Blog routes

// GET /api/blogs/public - Get all published blogs (public)
app.get("/api/blogs/public", (req, res) => {
  const pageIndex = parseInt(req.query.pageIndex as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;

  const published = blogs.filter(b => b.isPublished);
  const totalItems = published.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const startIndex = (pageIndex - 1) * pageSize;
  const items = published.slice(startIndex, startIndex + pageSize);

  res.json({
    pageSize,
    pageIndex,
    totalPages,
    totalItems,
    items,
    hasPreviousPage: pageIndex > 1,
    hasNextPage: pageIndex < totalPages,
  });
});

// GET /api/blogs/slug/:slug - Get blog by slug (public)
app.get("/api/blogs/slug/:slug", (req, res) => {
  const blog = blogs.find(b => b.slug === req.params.slug && b.isPublished);
  if (!blog) {
    return res.status(404).json({ error: "Blog not found" });
  }
  res.json(blog);
});

// GET /api/blogs/search - Search blogs (public)
app.get("/api/blogs/search", (req, res) => {
  const query = (req.query.q as string || '').toLowerCase();
  if (!query) {
    return res.status(400).json({ error: "Query parameter 'q' is required" });
  }
  const results = blogs.filter(b =>
    b.isPublished && (
      b.title.toLowerCase().includes(query) ||
      b.content.toLowerCase().includes(query) ||
      b.metaDescription.toLowerCase().includes(query)
    )
  );
  res.json(results);
});

// Admin endpoints (require SuperAdmin JWT)

// GET /api/blogs - Get all blogs (admin only)
app.get("/api/blogs", (req, res) => {
  if (!isSuperAdmin(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const pageIndex = parseInt(req.query.pageIndex as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;

  const totalItems = blogs.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const startIndex = (pageIndex - 1) * pageSize;
  const items = blogs.slice(startIndex, startIndex + pageSize);

  res.json({
    pageSize,
    pageIndex,
    totalPages,
    totalItems,
    items,
    hasPreviousPage: pageIndex > 1,
    hasNextPage: pageIndex < totalPages,
  });
});

// GET /api/blogs/:id - Get single blog including drafts (admin only)
app.get("/api/blogs/:id", (req, res) => {
  if (!isSuperAdmin(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const blog = blogs.find(b => b.id === parseInt(req.params.id));
  if (!blog) {
    return res.status(404).json({ error: "Blog not found" });
  }
  res.json(blog);
});

// POST /api/blogs - Create blog (admin only)
app.post("/api/blogs", (req, res) => {
  if (!isSuperAdmin(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { title, content, imageUrl, ogImage, isPublished, metaTitle, metaDescription } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required" });
  }

  // Generate slug from title
  const slug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  const newBlog = {
    id: blogIdCounter++,
    title,
    content,
    slug,
    imageUrl: imageUrl || '',
    ogImage: ogImage || '',
    isPublished: isPublished || false,
    metaTitle: metaTitle || title,
    metaDescription: metaDescription || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  blogs.push(newBlog);
  res.status(201).json(newBlog);
});

// PUT /api/blogs/:id - Edit blog (admin only)
app.put("/api/blogs/:id", (req, res) => {
  if (!isSuperAdmin(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const blog = blogs.find(b => b.id === parseInt(req.params.id));
  if (!blog) {
    return res.status(404).json({ error: "Blog not found" });
  }

  const { title, content, imageUrl, ogImage, isPublished, metaTitle, metaDescription } = req.body;

  if (title) blog.title = title;
  if (content) blog.content = content;
  if (imageUrl !== undefined) blog.imageUrl = imageUrl;
  if (ogImage !== undefined) blog.ogImage = ogImage;
  if (isPublished !== undefined) blog.isPublished = isPublished;
  if (metaTitle) blog.metaTitle = metaTitle;
  if (metaDescription) blog.metaDescription = metaDescription;

  blog.updatedAt = new Date().toISOString();

  res.json(blog);
});

// DELETE /api/blogs/:id - Delete blog (admin only)
app.delete("/api/blogs/:id", (req, res) => {
  if (!isSuperAdmin(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const index = blogs.findIndex(b => b.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: "Blog not found" });
  }

  const deleted = blogs.splice(index, 1);
  res.json(deleted[0]);
});

// Proxy for the standard API (proxies all other /api/* requests)
app.use(
  "/api",
  createProxyMiddleware({
    target: "https://skillgo.africa/staging/api",
    changeOrigin: true,
    pathRewrite: {
      "^/api": "", // Remove /api prefix when forwarding to staging/api
    },
    secure: false,
    logger: console,
    onProxyReq: (proxyReq, req, res) => {
      // Ensure Authorization header is forwarded
      if (req.headers.authorization) {
        console.log("[Proxy] Forwarding Authorization header");
        proxyReq.setHeader('Authorization', req.headers.authorization);
      }
      console.log(`[Proxy] Target URL: https://skillgo.africa/staging/api${req.url}`);
    },
    onProxyRes: (proxyRes, req, res) => {
      // Log response status
      console.log(`[Proxy Response] Status: ${proxyRes.statusCode} for ${req.url}`);
    },
    onError: (err, req, res) => {
      console.error("[Proxy Error]", err.message);
      res.status(500).json({ error: err.message });
    },
  })
);

// Basic error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(port, () => {
  console.log(`Admin support server running at http://localhost:${port}`);
});
