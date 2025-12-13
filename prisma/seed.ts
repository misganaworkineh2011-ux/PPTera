import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  // Seed Job Postings
  const jobs = await prisma.jobPosting.createMany({
    data: [
      {
        title: "Senior Frontend Engineer",
        department: "Engineering",
        location: "Remote",
        type: "Full-time",
        description: "We're looking for an experienced frontend engineer to help build the future of AI-powered presentations.",
        requirements: "5+ years of React experience, TypeScript, Next.js, strong design sense",
        benefits: "Competitive salary, equity, unlimited PTO, remote work",
        isActive: true,
      },
      {
        title: "Product Designer",
        department: "Design",
        location: "San Francisco, CA",
        type: "Full-time",
        description: "Join our design team to create beautiful, intuitive user experiences.",
        requirements: "3+ years of product design experience, Figma expert, portfolio required",
        benefits: "Competitive salary, equity, health insurance, gym membership",
        isActive: true,
      },
      {
        title: "AI/ML Engineer",
        department: "Engineering",
        location: "Remote",
        type: "Full-time",
        description: "Help us improve our AI models for presentation generation.",
        requirements: "PhD or Masters in CS/ML, experience with LLMs, Python, PyTorch",
        benefits: "Top-tier compensation, equity, flexible hours, conference budget",
        isActive: true,
      },
    ],
  });

  console.log(`Created ${jobs.count} job postings`);

  // Seed Inspiration Gallery
  const inspirationItems = await prisma.inspirationGallery.createMany({
    data: [
      {
        title: "Modern Business Pitch",
        description: "Clean and professional pitch deck for startups",
        imageUrl: "/placeholder-business.jpg",
        category: "business",
        tags: ["pitch", "startup", "modern"],
        likes: 245,
        views: 1520,
        authorName: "Sarah Chen",
        isPublic: true,
        isFeatured: true,
      },
      {
        title: "Marketing Strategy 2025",
        description: "Comprehensive marketing plan template",
        imageUrl: "/placeholder-marketing.jpg",
        category: "marketing",
        tags: ["marketing", "strategy", "planning"],
        likes: 189,
        views: 980,
        authorName: "Marcus Johnson",
        isPublic: true,
        isFeatured: false,
      },
      {
        title: "Product Launch Deck",
        description: "Launch your product with impact",
        imageUrl: "/placeholder-product.jpg",
        category: "product",
        tags: ["product", "launch", "presentation"],
        likes: 312,
        views: 1850,
        authorName: "Elena Rodriguez",
        isPublic: true,
        isFeatured: true,
      },
    ],
  });

  console.log(`Created ${inspirationItems.count} inspiration items`);

  // Seed Insight Posts
  const insightPosts = await prisma.insightPost.createMany({
    data: [
      {
        title: "The Future of AI in Presentations",
        slug: "future-of-ai-presentations",
        excerpt: "Discover how artificial intelligence is transforming the way we create and deliver presentations.",
        content: "Full article content here...",
        coverImage: "/placeholder-ai.jpg",
        category: "ai-technology",
        tags: ["AI", "technology", "future"],
        author: "Dr. Sarah Chen",
        authorImage: "/avatar-sarah.jpg",
        readTime: 8,
        views: 5420,
        likes: 342,
        isPublished: true,
        isFeatured: true,
        publishedAt: new Date("2025-01-10"),
      },
      {
        title: "10 Design Trends for 2025",
        slug: "design-trends-2025",
        excerpt: "Stay ahead of the curve with these emerging design trends that will dominate presentations this year.",
        content: "Full article content here...",
        coverImage: "/placeholder-design.jpg",
        category: "design",
        tags: ["design", "trends", "2025"],
        author: "Marcus Johnson",
        authorImage: "/avatar-marcus.jpg",
        readTime: 6,
        views: 3890,
        likes: 278,
        isPublished: true,
        isFeatured: false,
        publishedAt: new Date("2025-01-12"),
      },
      {
        title: "Maximizing Engagement in Virtual Meetings",
        slug: "virtual-meeting-engagement",
        excerpt: "Learn proven strategies to keep your audience engaged during remote presentations.",
        content: "Full article content here...",
        coverImage: "/placeholder-engagement.jpg",
        category: "best-practices",
        tags: ["engagement", "virtual", "meetings"],
        author: "Elena Rodriguez",
        authorImage: "/avatar-elena.jpg",
        readTime: 5,
        views: 2340,
        likes: 156,
        isPublished: true,
        isFeatured: false,
        publishedAt: new Date("2025-01-14"),
      },
    ],
  });

  console.log(`Created ${insightPosts.count} insight posts`);

  console.log("Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
