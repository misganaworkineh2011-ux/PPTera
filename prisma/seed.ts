import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  await prisma.inspirationGallery.deleteMany({});

  console.log("Cleared existing data");

  // Seed Inspiration Gallery - 14 items with NEW Cloudinary images
  const inspirationItems = await prisma.inspirationGallery.createMany({
    data: [
      {
        title: "Elegant Noir Business Presentation",
        description:
          "Sophisticated dark theme perfect for executive presentations and corporate pitches",
        imageUrl:
          "https://res.cloudinary.com/di76ibrro/image/upload/v1766151444/pptmaster_business_nnjnqx.png",
        category: "business",
        tags: ["elegant", "dark", "corporate", "professional"],
        likes: 342,
        views: 2150,
        authorName: "Marcus Rodriguez",
        isPublic: true,
        isFeatured: true,
      },
      {
        title: "Arctic Frost Minimal Design",
        description:
          "Clean and minimalist light theme ideal for modern startups and tech companies",
        imageUrl:
          "https://res.cloudinary.com/di76ibrro/image/upload/v1766151567/arctic_frost_pptmaster_jm2g28.png",
        category: "business",
        tags: ["minimal", "light", "modern", "startup"],
        likes: 289,
        views: 1890,
        authorName: "Sophia Williams",
        isPublic: true,
        isFeatured: true,
      },
      {
        title: "Sunset Gradient Creative Deck",
        description:
          "Vibrant gradient theme perfect for creative agencies and design portfolios",
        imageUrl:
          "https://res.cloudinary.com/di76ibrro/image/upload/v1766151668/sunset_pptmaster_ktz0ij.png",
        category: "creative",
        tags: ["gradient", "creative", "colorful", "design"],
        likes: 412,
        views: 2680,
        authorName: "Isabella Chen",
        isPublic: true,
        isFeatured: true,
      },
      {
        title: "Ocean Depths Data Visualization",
        description:
          "Professional blue theme optimized for data-driven presentations and analytics",
        imageUrl:
          "https://res.cloudinary.com/di76ibrro/image/upload/v1766151759/ocean_pptmaster_firmv1.png",
        category: "data",
        tags: ["data", "analytics", "professional", "blue"],
        likes: 267,
        views: 1720,
        authorName: "Daniel Kim",
        isPublic: true,
        isFeatured: false,
      },
      {
        title: "Aurora Borealis Tech Presentation",
        description:
          "Dynamic theme with northern lights aesthetics for technology and innovation talks",
        imageUrl:
          "https://res.cloudinary.com/di76ibrro/image/upload/v1766151827/aestetics_pptmaster_rymd3m.png",
        category: "technology",
        tags: ["tech", "innovation", "dynamic", "modern"],
        likes: 398,
        views: 2340,
        authorName: "Olivia Thompson",
        isPublic: true,
        isFeatured: true,
      },
      {
        title: "Ember Forge Startup Pitch",
        description:
          "Energetic warm theme designed for startup pitches and fundraising decks",
        imageUrl:
          "https://res.cloudinary.com/di76ibrro/image/upload/v1766151912/Ember_pptmaster_iw5jax.png",
        category: "startup",
        tags: ["startup", "pitch", "energetic", "warm"],
        likes: 445,
        views: 3120,
        authorName: "Ethan Martinez",
        isPublic: true,
        isFeatured: true,
      },
      {
        title: "Midnight Garden Nature Theme",
        description:
          "Organic dark theme perfect for environmental and sustainability presentations",
        imageUrl:
          "https://res.cloudinary.com/di76ibrro/image/upload/v1766155051/Screenshot_2025-12-19_063703_d9geba.png",
        category: "environment",
        tags: ["nature", "sustainability", "organic", "dark"],
        likes: 234,
        views: 1560,
        authorName: "Ava Johnson",
        isPublic: true,
        isFeatured: false,
      },
      {
        title: "Cyber Neon Tech Conference",
        description:
          "Futuristic neon theme ideal for tech conferences and cybersecurity talks",
        imageUrl:
          "https://res.cloudinary.com/di76ibrro/image/upload/v1766152376/cyberpunk_pptmaster_nqny1d.png",
        category: "technology",
        tags: ["cyber", "neon", "futuristic", "tech"],
        likes: 521,
        views: 3890,
        authorName: "Noah Anderson",
        isPublic: true,
        isFeatured: true,
      },
      {
        title: "Alien Tech Sci-Fi Presentation",
        description:
          "Unique extraterrestrial theme for innovative product launches and sci-fi content",
        imageUrl:
          "https://res.cloudinary.com/di76ibrro/image/upload/v1766152111/alien_pptmaster_ldo5wm.png",
        category: "creative",
        tags: ["sci-fi", "innovative", "unique", "futuristic"],
        likes: 367,
        views: 2240,
        authorName: "Mia Davis",
        isPublic: true,
        isFeatured: false,
      },
      {
        title: "Corporate Clean Business Report",
        description:
          "Professional corporate theme for quarterly reports and board presentations",
        imageUrl:
          "https://res.cloudinary.com/di76ibrro/image/upload/v1766152472/corporate_pptmaster_gcvo7p.png",
        category: "business",
        tags: ["corporate", "professional", "clean", "business"],
        likes: 298,
        views: 1980,
        authorName: "Liam Wilson",
        isPublic: true,
        isFeatured: false,
      },
      {
        title: "Hacker Terminal Developer Deck",
        description:
          "Code-inspired terminal theme perfect for developer conferences and tech talks",
        imageUrl:
          "https://res.cloudinary.com/di76ibrro/image/upload/v1766151237/pptmasterHacking_uccgma.png",
        category: "technology",
        tags: ["developer", "code", "terminal", "tech"],
        likes: 589,
        views: 4120,
        authorName: "Emma Garcia",
        isPublic: true,
        isFeatured: true,
      },
      {
        title: "Architectural Mono Design Portfolio",
        description:
          "Minimalist monochrome theme for architecture and design portfolios",
        imageUrl:
          "https://res.cloudinary.com/di76ibrro/image/upload/v1766152567/Architectural_pptmaster_a18ccs.png",
        category: "design",
        tags: ["architecture", "minimal", "monochrome", "portfolio"],
        likes: 312,
        views: 2050,
        authorName: "Charlotte Brown",
        isPublic: true,
        isFeatured: false,
      },
      {
        title: "Cosmic Voyage Space Exploration",
        description:
          "Space-themed presentation for astronomy, science, and exploration topics",
        imageUrl:
          "https://res.cloudinary.com/di76ibrro/image/upload/v1766152672/Screenshot_2025-12-19_055737_hhnqpt.png",
        category: "science",
        tags: ["space", "science", "astronomy", "exploration"],
        likes: 456,
        views: 2890,
        authorName: "James Taylor",
        isPublic: true,
        isFeatured: false,
      },
      {
        title: "Anime Dreamscape Creative Showcase",
        description:
          "Vibrant anime-inspired theme for creative showcases and entertainment content",
        imageUrl:
          "https://res.cloudinary.com/di76ibrro/image/upload/v1766152753/anime_pptmaster_iiz00a.png",
        category: "creative",
        tags: ["anime", "creative", "vibrant", "entertainment"],
        likes: 678,
        views: 4560,
        authorName: "Amelia White",
        isPublic: true,
        isFeatured: true,
      },
    ],
  });

  console.log(`Created ${inspirationItems.count} inspiration items`);

  // Clear existing blog posts
  await prisma.insightPost.deleteMany({});
  console.log("Cleared existing blog posts");

  // Seed 4 Design Blog Posts
  const blogPosts = await prisma.insightPost.createMany({
    data: [
      {
        title: "The Evolution of Presentation Design: From Static Slides to AI-Powered Creativity",
        slug: "evolution-of-presentation-design-ai-powered",
        excerpt: "Discover how AI powerpoint generator tools are revolutionizing the way designers create stunning presentations, making professional design accessible to everyone.",
        content: `# The Evolution of Presentation Design: From Static Slides to AI-Powered Creativity

The world of presentation design has undergone a remarkable transformation over the past decade. What once required hours of manual work and advanced design skills can now be accomplished in minutes with the help of modern technology.

## The Traditional Design Challenge

Creating compelling presentations has always been a time-consuming process. Designers would spend hours selecting color palettes, arranging layouts, and ensuring visual consistency across dozens of slides. For non-designers, the challenge was even greater—resulting in presentations that often looked unprofessional or cluttered.

## Enter the AI Powerpoint Generator Era

Today's **ai powerpoint generator** tools have democratized professional design. These intelligent systems understand design principles, color theory, and visual hierarchy, applying them automatically to create stunning presentations. Whether you're a startup founder pitching to investors or a teacher preparing educational content, AI-powered tools level the playing field.

## What Makes Modern PPT Master Tools Different?

The latest generation of **ppt master** platforms goes beyond simple templates. They offer:

- **Intelligent Layout Suggestions**: AI analyzes your content and recommends the most effective visual structure
- **Dynamic Color Schemes**: Automatically generated palettes that match your brand or topic
- **Smart Content Adaptation**: Text and images are automatically sized and positioned for optimal readability
- **Real-time Collaboration**: Multiple team members can work together seamlessly

## Design Principles That Never Change

While technology evolves, fundamental design principles remain constant:

1. **Clarity Over Complexity**: Less is often more in presentation design
2. **Visual Hierarchy**: Guide your audience's attention deliberately
3. **Consistency**: Maintain uniform styling throughout your deck
4. **Whitespace**: Give your content room to breathe

## The Future of Presentation Design

As AI continues to advance, we can expect even more sophisticated features. Imagine presentations that adapt in real-time based on audience engagement, or AI that suggests content improvements based on your speaking style. The future is bright for anyone who needs to communicate ideas visually.

## Conclusion

The combination of human creativity and AI assistance represents the sweet spot in modern presentation design. Tools that act as a **ppt master** don't replace designers—they empower everyone to create professional-quality work. Whether you're using an **ai powerpoint generator** or traditional software, understanding design fundamentals will always give you an edge.

The question is no longer whether you can create beautiful presentations, but rather how quickly you can bring your ideas to life.`,
        coverImage: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=1200&h=630&fit=crop&q=80",
        category: "Design Trends",
        tags: ["AI", "Design", "Presentation", "Technology", "Innovation"],
        author: "Sarah Mitchell",
        authorImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&q=80",
        readTime: 8,
        views: 1247,
        likes: 89,
        isPublished: true,
        isFeatured: true,
        publishedAt: new Date("2024-12-15"),
      },
      {
        title: "Mastering Visual Storytelling: Design Techniques That Captivate Audiences",
        slug: "mastering-visual-storytelling-design-techniques",
        excerpt: "Learn the art of visual storytelling and how modern ppt master tools help you craft narratives that resonate with your audience on a deeper level.",
        content: `# Mastering Visual Storytelling: Design Techniques That Captivate Audiences

Great presentations don't just inform—they tell stories that resonate emotionally with audiences. Visual storytelling is the bridge between data and human connection, and mastering it can transform your presentations from forgettable to unforgettable.

## The Psychology Behind Visual Stories

Our brains process visual information 60,000 times faster than text. When you combine compelling visuals with a strong narrative structure, you create an experience that sticks with your audience long after the presentation ends.

## Building Your Visual Narrative

### 1. Start With a Clear Arc

Every great story has a beginning, middle, and end. Your presentation should follow a similar structure:

- **Opening**: Hook your audience with a compelling question or statement
- **Development**: Build tension or interest through your main points
- **Resolution**: Provide solutions or conclusions that satisfy the journey

### 2. Use Visual Metaphors

Metaphors help audiences understand complex concepts quickly. Instead of explaining abstract ideas with bullet points, show them through imagery. Modern **ai powerpoint generator** tools can suggest relevant visuals based on your content, making this process faster than ever.

## Color Psychology in Design

Colors evoke emotions and set the tone for your entire presentation:

- **Blue**: Trust, professionalism, stability
- **Red**: Energy, urgency, passion
- **Green**: Growth, harmony, freshness
- **Purple**: Creativity, luxury, wisdom
- **Orange**: Enthusiasm, warmth, confidence

A skilled **ppt master** understands how to leverage these associations to reinforce their message. Whether you're pitching a startup or presenting quarterly results, your color choices should align with your narrative goals.

## The Power of Data Visualization

Numbers tell stories too, but only when presented effectively. Transform raw data into compelling visuals:

- Use charts that match your data type (line graphs for trends, pie charts for proportions)
- Highlight key insights with contrasting colors
- Animate data reveals to build suspense
- Keep visualizations simple and focused

## Typography as a Design Element

Font choices communicate personality and professionalism. Pair fonts strategically:

- **Serif fonts** (like Times New Roman) convey tradition and reliability
- **Sans-serif fonts** (like Helvetica) feel modern and clean
- **Display fonts** add personality but should be used sparingly

## Leveraging Modern Tools

Today's **ai powerpoint generator** platforms understand these principles and apply them automatically. They analyze your content, suggest appropriate visuals, and ensure design consistency—allowing you to focus on your story rather than technical details.

## Creating Emotional Connections

The most memorable presentations create emotional resonance:

- Use human faces in your imagery (we're hardwired to connect with faces)
- Include personal anecdotes or case studies
- Show the human impact of your ideas
- Use contrast to emphasize important moments

## Practical Exercise

Take your next presentation and ask yourself:

1. What emotion do I want my audience to feel?
2. What's the one thing I want them to remember?
3. How can visuals reinforce my core message?

## Conclusion

Visual storytelling isn't about making pretty slides—it's about creating experiences that move people to action. Whether you're using advanced **ppt master** techniques or simple design principles, the goal remains the same: connect with your audience on a human level.

The tools have evolved, but the fundamental truth remains: stories change minds, and visuals make stories unforgettable.`,
        coverImage: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=630&fit=crop&q=80",
        category: "Design Techniques",
        tags: ["Storytelling", "Visual Design", "Presentation Skills", "Communication", "Design Psychology"],
        author: "Marcus Chen",
        authorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&q=80",
        readTime: 10,
        views: 2134,
        likes: 156,
        isPublished: true,
        isFeatured: true,
        publishedAt: new Date("2024-12-10"),
      },
      {
        title: "Minimalism vs. Maximalism: Finding Your Presentation Design Style",
        slug: "minimalism-vs-maximalism-presentation-design-style",
        excerpt: "Explore the spectrum between minimalist and maximalist design approaches, and discover how ai powerpoint generator tools adapt to both aesthetics.",
        content: `# Minimalism vs. Maximalism: Finding Your Presentation Design Style

In the world of presentation design, two philosophies dominate: minimalism and maximalism. Both have their place, and understanding when to use each approach can dramatically improve your communication effectiveness.

## The Minimalist Approach

### Less is More

Minimalist design strips away everything unnecessary, leaving only the essential elements. This approach:

- Creates focus by eliminating distractions
- Conveys sophistication and professionalism
- Works exceptionally well for data-heavy presentations
- Allows your message to take center stage

### When to Go Minimal

Choose minimalism when:
- Presenting to executive audiences
- Dealing with complex data or technical content
- Your brand identity is clean and modern
- You want to emphasize clarity over creativity

Modern **ppt master** tools excel at creating minimalist designs, automatically applying generous whitespace and clean typography that lets your content breathe.

## The Maximalist Approach

### More is More

Maximalist design embraces abundance—rich colors, layered textures, and bold visual elements. This style:

- Creates memorable, distinctive presentations
- Expresses creativity and personality
- Engages audiences through visual excitement
- Works well for creative industries and brand storytelling

### When to Go Maximal

Choose maximalism when:
- Presenting creative work or artistic concepts
- Your audience expects entertainment alongside information
- Building brand identity for lifestyle or creative brands
- You want to make a bold, unforgettable impression

## The Spectrum Between

Most effective presentations don't live at the extremes—they find a sweet spot that serves their specific purpose. An **ai powerpoint generator** can help you explore this spectrum, offering variations that range from austere to abundant.

## Finding Your Style

### Consider Your Context

1. **Industry Norms**: Tech startups might lean minimal, while fashion brands embrace maximalism
2. **Audience Expectations**: Know what resonates with your specific viewers
3. **Content Type**: Data presentations often benefit from minimalism, while creative pitches can go bold
4. **Brand Identity**: Your design should align with your overall brand aesthetic

### Hybrid Approaches

The most sophisticated presentations often blend both philosophies:

- **Minimal structure with maximal accents**: Clean layouts with bold color moments
- **Maximal visuals with minimal text**: Rich imagery paired with concise copy
- **Progressive revelation**: Start minimal, build to maximal climax

## Design Elements to Consider

### Typography

- **Minimalist**: One or two clean fonts, generous spacing
- **Maximalist**: Multiple font weights, decorative elements, varied sizes

### Color

- **Minimalist**: Monochromatic or limited palette (2-3 colors)
- **Maximalist**: Rich, varied palette with bold contrasts

### Imagery

- **Minimalist**: Selective, high-quality images with purpose
- **Maximalist**: Layered visuals, patterns, textures, and overlays

### Layout

- **Minimalist**: Grid-based, symmetrical, predictable
- **Maximalist**: Dynamic, asymmetrical, surprising

## Tools for Both Approaches

Whether you prefer minimal or maximal, modern **ppt master** platforms support both aesthetics. The key is understanding the principles behind each approach so you can guide the tools effectively.

An **ai powerpoint generator** can create variations across the spectrum, allowing you to experiment and find what works best for your specific needs.

## Case Studies

### Minimalist Success: Apple Keynotes

Apple's presentations are masterclasses in minimalism—simple slides with large images and minimal text. This approach puts focus entirely on the product and the presenter.

### Maximalist Success: Creative Agency Pitches

Design agencies often use rich, layered presentations that showcase their creative capabilities while presenting ideas. The presentation itself becomes a demonstration of their skills.

## Making Your Choice

Ask yourself:

1. What's the primary goal of this presentation?
2. Who is my audience, and what do they expect?
3. What does my brand identity suggest?
4. What feels authentic to my message?

## Conclusion

There's no universally "correct" design style—only the right style for your specific situation. Whether you embrace minimalism's clarity or maximalism's energy, the key is intentionality. Every design choice should serve your message and resonate with your audience.

The beauty of modern design tools is that they empower you to explore both ends of the spectrum quickly, helping you discover your authentic presentation voice.`,
        coverImage: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&h=630&fit=crop&q=80",
        category: "Design Philosophy",
        tags: ["Minimalism", "Maximalism", "Design Theory", "Style Guide", "Visual Identity"],
        author: "Elena Rodriguez",
        authorImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&q=80",
        readTime: 9,
        views: 1876,
        likes: 142,
        isPublished: true,
        isFeatured: true,
        publishedAt: new Date("2024-12-08"),
      },
      {
        title: "The Science of Slide Design: Evidence-Based Techniques for Better Presentations",
        slug: "science-of-slide-design-evidence-based-techniques",
        excerpt: "Dive into research-backed design principles that make presentations more effective, and learn how ppt master tools implement these scientific insights.",
        content: `# The Science of Slide Design: Evidence-Based Techniques for Better Presentations

Effective presentation design isn't just about aesthetics—it's rooted in cognitive science and psychology. Understanding how our brains process visual information can transform your slides from merely attractive to genuinely effective.

## Cognitive Load Theory

### The Three Types of Cognitive Load

1. **Intrinsic Load**: The inherent difficulty of your content
2. **Extraneous Load**: Unnecessary mental effort caused by poor design
3. **Germane Load**: Productive mental effort that aids learning

Good design minimizes extraneous load while supporting germane load. This is where **ai powerpoint generator** tools shine—they automatically apply principles that reduce cognitive friction.

## The Picture Superiority Effect

Research shows that people remember images better than words. After three days, people retain:

- **10% of information** heard
- **65% of information** paired with relevant images

### Practical Application

- Replace bullet points with relevant visuals whenever possible
- Use icons to represent concepts
- Include diagrams that illustrate relationships
- Choose images that reinforce rather than decorate

A skilled **ppt master** knows that every visual element should serve a purpose, not just fill space.

## The Multimedia Principle

People learn better from words and pictures than from words alone. However, there's a catch: the images must be relevant and well-integrated.

### What Works

- Diagrams with integrated labels
- Process flows with explanatory text
- Before/after comparisons
- Annotated screenshots

### What Doesn't Work

- Decorative clipart that adds no meaning
- Stock photos that don't relate to content
- Overly complex diagrams that confuse rather than clarify

## The Modality Effect

When presenting, spoken words paired with visuals are more effective than written text on slides. This is why reading slides verbatim is so ineffective—it creates redundancy that actually impairs learning.

### Design Implications

- Keep text minimal on slides
- Use visuals to support your spoken narrative
- Avoid full sentences when possible
- Let your voice provide the details

## Color and Contrast Science

### The Von Restorff Effect

Items that stand out are more memorable. Use contrast strategically to highlight key information:

- **High contrast** for important elements (dark text on light backgrounds)
- **Color contrast** to draw attention to critical data
- **Size contrast** to establish hierarchy

### Color Associations

Colors trigger psychological responses:

- **Warm colors** (red, orange) increase arousal and attention
- **Cool colors** (blue, green) promote calm and trust
- **High saturation** creates energy and excitement
- **Low saturation** feels sophisticated and professional

Modern **ai powerpoint generator** platforms understand these principles and apply them automatically, selecting color schemes that support your message's emotional tone.

## The Serial Position Effect

People remember the first and last items in a sequence best. This has major implications for slide order:

### Primacy Effect

Your opening slides are crucial. Use them to:
- Establish credibility
- Hook attention
- Frame the narrative

### Recency Effect

Your closing slides are equally important:
- Summarize key takeaways
- End with a strong call to action
- Leave a memorable final impression

## Gestalt Principles in Slide Design

Our brains naturally organize visual information according to specific patterns:

### Proximity

Elements close together are perceived as related. Group related information visually.

### Similarity

Similar elements are perceived as belonging together. Use consistent styling for related content.

### Continuity

Our eyes follow lines and curves. Use this to guide attention through your slides.

### Closure

We mentally complete incomplete shapes. This can create engaging, sophisticated designs.

## The Spacing Effect

Information is better retained when learning is distributed over time. For presentations:

- Break complex topics across multiple slides
- Use progressive disclosure to reveal information gradually
- Include recap slides to reinforce key points
- Space similar concepts throughout your deck

## Evidence-Based Typography

### Readability Research

Studies show that:

- **Sans-serif fonts** are easier to read on screens
- **Font size** should be at least 24pt for body text
- **Line length** should be 50-75 characters maximum
- **Line spacing** of 1.5x improves readability by 20%

### Font Psychology

Different typefaces convey different messages:

- **Serif fonts**: Traditional, trustworthy, established
- **Sans-serif fonts**: Modern, clean, approachable
- **Script fonts**: Elegant, personal, creative (use sparingly)

## The Testing Effect

People learn better when they actively retrieve information. In presentations:

- Ask questions that prompt thinking
- Include interactive elements when possible
- Use polls or quizzes to engage audiences
- Create moments for reflection

## Applying the Science

### Checklist for Evidence-Based Design

✓ Does each visual serve a clear purpose?
✓ Is text minimal and easy to read?
✓ Are colors used strategically, not decoratively?
✓ Is information chunked into digestible pieces?
✓ Does the design reduce cognitive load?
✓ Are key messages emphasized through contrast?

## The Role of AI in Scientific Design

Modern **ppt master** tools incorporate these research findings into their algorithms. An **ai powerpoint generator** doesn't just make slides look good—it applies cognitive science principles to make them more effective.

These tools analyze your content and automatically:
- Optimize text-to-visual ratios
- Apply appropriate color psychology
- Structure information to minimize cognitive load
- Suggest layouts that support learning

## Conclusion

Great presentation design isn't subjective—it's grounded in how humans process information. By applying these evidence-based principles, you create presentations that don't just look professional but actually work better.

Whether you're designing manually or using an **ai powerpoint generator**, understanding the science behind effective slides gives you a significant advantage. Your audience may not consciously notice these principles at work, but their brains will—and that's what matters.

The future of presentation design lies in the intersection of human creativity and scientific understanding, supported by tools that make best practices accessible to everyone.`,
        coverImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=630&fit=crop&q=80",
        category: "Design Science",
        tags: ["Cognitive Science", "Psychology", "Research", "Best Practices", "Learning Design"],
        author: "Dr. James Patterson",
        authorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&q=80",
        readTime: 12,
        views: 3421,
        likes: 267,
        isPublished: true,
        isFeatured: true,
        publishedAt: new Date("2024-12-05"),
      },
    ],
  });

  console.log(`Created ${blogPosts.count} design blog posts`);
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
