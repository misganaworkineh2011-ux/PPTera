"use client";

import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { useLanguage } from "~/contexts/LanguageContext";
import { Users, MessageSquare, Trophy, Calendar, Star, TrendingUp, Heart, Sparkles, Plus, ThumbsUp, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { LoadingButton } from "~/components/LoadingButton";
import { toast } from "sonner";

interface CommunityPost {
  id: string;
  title: string;
  content: string;
  category: string;
  authorName: string;
  likes: number;
  views: number;
  createdAt: Date;
  comments: Array<{
    id: string;
    content: string;
    authorName: string;
  }>;
}

export default function CommunityPage() {
  const { t } = useLanguage();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "discussion",
    authorName: "",
    authorEmail: "",
  });

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const url = selectedCategory === "all"
        ? "/api/community/posts?limit=20"
        : `/api/community/posts?category=${selectedCategory}&limit=20`;
      const response = await fetch(url);
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create post");
      }

      toast.success(data.message || "Post submitted for review!", {
        duration: 5000,
        position: "top-center",
      });
      setNewPost({
        title: "",
        content: "",
        category: "discussion",
        authorName: "",
        authorEmail: "",
      });
      setShowCreateForm(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create post", {
        duration: 5000,
        position: "top-center",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const communityStats = [
    { label: "Active Members", value: "50M+", icon: Users },
    { label: "Presentations Shared", value: "100M+", icon: Star },
    { label: "Monthly Events", value: "50+", icon: Calendar },
    { label: "Success Stories", value: "10K+", icon: Trophy },
  ];

  const forumCategories = [
    {
      icon: Sparkles,
      title: "Show & Tell",
      description: "Share your amazing presentations and get feedback from the community",
      topics: 2500,
      posts: 15000,
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: MessageSquare,
      title: "General Discussion",
      description: "Talk about anything related to presentations, design, and storytelling",
      topics: 5000,
      posts: 35000,
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: TrendingUp,
      title: "Tips & Tricks",
      description: "Learn advanced techniques and best practices from experienced users",
      topics: 1800,
      posts: 12000,
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Heart,
      title: "Feature Requests",
      description: "Suggest new features and vote on what you'd like to see next",
      topics: 800,
      posts: 5000,
      color: "from-green-500 to-emerald-500"
    }
  ];

  const featuredMembers = [
    {
      name: "Sarah Chen",
      role: "Design Expert",
      contributions: 500,
      avatar: "SC"
    },
    {
      name: "Marcus Johnson",
      role: "AI Enthusiast",
      contributions: 450,
      avatar: "MJ"
    },
    {
      name: "Elena Rodriguez",
      role: "Business Pro",
      contributions: 420,
      avatar: "ER"
    },
    {
      name: "David Kim",
      role: "Educator",
      contributions: 380,
      avatar: "DK"
    }
  ];

  const upcomingEvents = [
    {
      title: "Monthly Design Challenge",
      date: "Every 1st Monday",
      description: "Compete with other members to create the best presentation on a given theme"
    },
    {
      title: "AI Prompt Workshop",
      date: "Every Wednesday",
      description: "Learn how to write better prompts for stunning AI-generated presentations"
    },
    {
      title: "Community Showcase",
      date: "Last Friday of Month",
      description: "Present your work to the community and get featured on our homepage"
    },
    {
      title: "Expert Q&A Sessions",
      date: "Bi-weekly Thursdays",
      description: "Ask questions to industry experts about design, storytelling, and presentations"
    }
  ];

  const guidelines = [
    {
      title: "Be Respectful",
      description: "Treat all community members with kindness and respect. No harassment, hate speech, or discrimination of any kind."
    },
    {
      title: "Share Quality Content",
      description: "Post presentations and content that add value to the community. Avoid spam and self-promotion."
    },
    {
      title: "Give Credit",
      description: "Always credit original creators when sharing work. Respect intellectual property rights."
    },
    {
      title: "Help Others",
      description: "Share your knowledge and help fellow members. Answer questions and provide constructive feedback."
    },
    {
      title: "Stay On Topic",
      description: "Keep discussions relevant to presentations, design, and PPTMaster features."
    },
    {
      title: "Report Issues",
      description: "If you see inappropriate content or behavior, report it to moderators immediately."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,#1e1e1e0a,transparent)]"></div>

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/50 px-4 py-2 backdrop-blur-sm animate-fade-in">
            <Users className="h-4 w-4 text-[#06b6d4]" />
            <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              {t.community || "Community"}
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 animate-fade-in-up [animation-delay:100ms]">
            Join the <span className="bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] bg-clip-text text-transparent">PPTMaster</span> Community
          </h1>

          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed animate-fade-in-up [animation-delay:200ms]">
            Connect with 50+ million creators, share your work, learn from experts, and be part of the presentation revolution.
          </p>
        </div>
      </section>

      {/* Community Stats */}
      <section className="relative px-6 pb-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-6">
            {communityStats.map((stat, index) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 bg-white p-6 text-center hover:shadow-xl transition-all animate-fade-in-up"
                style={{ animationDelay: `${300 + index * 100}ms` }}
              >
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                <div className="text-sm text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Forum Categories */}
      <section className="relative px-6 pb-16 bg-gradient-to-br from-slate-50 to-white">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-bold text-slate-900">Community Forums</h2>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white font-bold hover:shadow-xl transition-all hover:scale-105"
            >
              <Plus className="h-5 w-5" />
              Create Post
            </button>
          </div>

          {/* Create Post Form */}
          {showCreateForm && (
            <div className="mb-12 rounded-2xl border border-slate-200 bg-white p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Create New Post</h3>
              <form onSubmit={handleSubmitPost} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={newPost.authorName}
                      onChange={(e) => setNewPost({ ...newPost, authorName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#06b6d4] focus:outline-none"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Email (optional)</label>
                    <input
                      type="email"
                      value={newPost.authorEmail}
                      onChange={(e) => setNewPost({ ...newPost, authorEmail: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#06b6d4] focus:outline-none"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Category *</label>
                  <select
                    required
                    value={newPost.category}
                    onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#06b6d4] focus:outline-none"
                  >
                    <option value="show-tell">Show & Tell</option>
                    <option value="discussion">General Discussion</option>
                    <option value="tips">Tips & Tricks</option>
                    <option value="feature-request">Feature Requests</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Title *</label>
                  <input
                    type="text"
                    required
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#06b6d4] focus:outline-none"
                    placeholder="What's your post about?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Content *</label>
                  <textarea
                    required
                    rows={6}
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#06b6d4] focus:outline-none resize-none"
                    placeholder="Share your thoughts..."
                  />
                </div>
                <div className="flex gap-3">
                  <LoadingButton
                    type="submit"
                    isLoading={isSubmitting}
                    loadingText="Submitting..."
                    variant="primary"
                  >
                    Submit Post
                  </LoadingButton>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-6 py-3 rounded-full border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                </div>
                <p className="text-sm text-slate-500">* Posts require admin approval before appearing publicly</p>
              </form>
            </div>
          )}

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 mb-8">
            {["all", "show-tell", "discussion", "tips", "feature-request"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-full border text-sm font-semibold transition-all ${
                  selectedCategory === cat
                    ? "border-[#06b6d4] bg-[#06b6d4] text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </button>
            ))}
          </div>

          {/* Posts List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#06b6d4] border-r-transparent"></div>
              <p className="mt-4 text-slate-600">Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600">No posts yet. Be the first to create one!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 rounded-full bg-[#06b6d4]/10 text-[#06b6d4] text-xs font-semibold">
                          {post.category}
                        </span>
                        <span className="text-sm text-slate-500">
                          by {post.authorName}
                        </span>
                        <span className="text-sm text-slate-400">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2 hover:text-[#06b6d4] transition-colors cursor-pointer">
                        {post.title}
                      </h3>
                      <p className="text-slate-600 line-clamp-2">{post.content}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4" />
                      {post.likes} likes
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {post.views} views
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {post.comments.length} comments
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Members */}
      <section className="relative px-6 pb-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">Top Contributors</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {featuredMembers.map((member, index) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 bg-white p-6 text-center hover:shadow-xl transition-all"
              >
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                  {member.avatar}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">{member.name}</h3>
                <p className="text-sm text-slate-600 mb-3">{member.role}</p>
                <div className="flex items-center justify-center gap-1 text-sm text-slate-500">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span>{member.contributions} contributions</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="relative px-6 pb-16 bg-gradient-to-br from-slate-50 to-white">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">Upcoming Events</h2>
          <div className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{event.title}</h3>
                    <p className="text-sm text-[#06b6d4] font-semibold mb-2">{event.date}</p>
                    <p className="text-slate-600">{event.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Guidelines */}
      <section className="relative px-6 pb-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-4xl font-bold text-slate-900 mb-4 text-center">Community Guidelines</h2>
          <p className="text-xl text-slate-600 mb-12 text-center">
            Help us maintain a positive and productive community for everyone
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {guidelines.map((guideline, index) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-lg transition-all"
              >
                <h3 className="text-lg font-bold text-slate-900 mb-2">{guideline.title}</h3>
                <p className="text-slate-600 leading-relaxed">{guideline.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
