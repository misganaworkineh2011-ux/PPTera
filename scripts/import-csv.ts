import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

// Improved CSV parser that handles multiline content within quoted fields
function parseCSV(content: string): Record<string, string>[] {
  const rows: Record<string, string>[] = [];
  let headers: string[] = [];
  
  // State machine for parsing
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;
  let i = 0;
  
  while (i < content.length) {
    const char = content[i];
    const nextChar = content[i + 1];
    
    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote
          currentField += '"';
          i += 2;
          continue;
        } else {
          // End of quoted field
          inQuotes = false;
          i++;
          continue;
        }
      } else {
        currentField += char;
        i++;
        continue;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
        continue;
      } else if (char === ',') {
        currentRow.push(currentField);
        currentField = "";
        i++;
        continue;
      } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
        currentRow.push(currentField);
        currentField = "";
        
        if (headers.length === 0) {
          headers = currentRow;
        } else if (currentRow.length === headers.length) {
          const row: Record<string, string> = {};
          headers.forEach((header, idx) => {
            row[header] = currentRow[idx] || "";
          });
          rows.push(row);
        }
        
        currentRow = [];
        i += (char === '\r' && nextChar === '\n') ? 2 : 1;
        continue;
      } else if (char === '\r') {
        // Handle standalone \r
        i++;
        continue;
      } else {
        currentField += char;
        i++;
        continue;
      }
    }
  }
  
  // Handle last row if no trailing newline
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    if (currentRow.length === headers.length) {
      const row: Record<string, string> = {};
      headers.forEach((header, idx) => {
        row[header] = currentRow[idx] || "";
      });
      rows.push(row);
    }
  }
  
  return rows;
}

function parseValue(value: string, type: "string" | "int" | "bool" | "date" | "json" | "array"): any {
  if (value === "" || value === "null" || value === undefined) return null;
  
  switch (type) {
    case "int":
      const num = parseInt(value, 10);
      return isNaN(num) ? 0 : num;
    case "bool":
      return value === "true" || value === "t";
    case "date":
      const date = new Date(value);
      return isNaN(date.getTime()) ? new Date() : date;
    case "json":
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    case "array":
      // PostgreSQL array format: {item1,item2} or JSON format: ["item1","item2"]
      if (value.startsWith("[")) {
        try {
          return JSON.parse(value);
        } catch {
          return [];
        }
      }
      if (value.startsWith("{") && value.endsWith("}")) {
        const inner = value.slice(1, -1);
        if (!inner) return [];
        return inner.split(",").map(s => s.replace(/^"|"$/g, "")).filter(Boolean);
      }
      return [];
    default:
      return value;
  }
}

async function importUsers() {
  console.log("Importing users...");
  const filePath = path.join("csvexported", "user.csv");
  if (!fs.existsSync(filePath)) {
    console.log("No user.csv found, skipping...");
    return;
  }
  const content = fs.readFileSync(filePath, "utf-8");
  const rows = parseCSV(content);
  let imported = 0;

  for (const row of rows) {
    try {
      await prisma.user.upsert({
        where: { id: row.id! },
        update: {},
        create: {
          id: row.id!,
          clerkId: row.clerkId!,
          name: row.name!,
          email: row.email!,
          emailVerified: parseValue(row.emailVerified!, "bool") ?? false,
          image: row.image || null,
          createdAt: parseValue(row.createdAt!, "date"),
          updatedAt: parseValue(row.updatedAt!, "date"),
          credits: parseValue(row.credits!, "int") ?? 0,
          subscriptionPlan: row.subscriptionPlan || null,
          subscriptionType: row.subscriptionType || null,
          productId: row.productId || null,
          nextResetDate: row.nextResetDate ? parseValue(row.nextResetDate, "date") : null,
          polarCustomerId: row.polarCustomerId || null,
          polarSubscriptionId: row.polarSubscriptionId || null,
          subscriptionStartDate: row.subscriptionStartDate ? parseValue(row.subscriptionStartDate, "date") : null,
          referralCode: row.referralCode || null,
          referredBy: row.referredBy || null,
        },
      });
      imported++;
    } catch (e: any) {
      console.error(`Error importing user ${row.id}: ${e.message}`);
    }
  }
  console.log(`Imported ${imported}/${rows.length} users`);
}

async function importThemes() {
  console.log("Importing themes...");
  const filePath = path.join("csvexported", "Theme.csv");
  if (!fs.existsSync(filePath)) {
    console.log("No Theme.csv found, skipping...");
    return;
  }
  const content = fs.readFileSync(filePath, "utf-8");
  const rows = parseCSV(content);
  let imported = 0;

  for (const row of rows) {
    try {
      await prisma.theme.upsert({
        where: { id: row.id! },
        update: {},
        create: {
          id: row.id!,
          name: row.name!,
          colors: parseValue(row.colors!, "json") || {},
          fonts: parseValue(row.fonts!, "json") || {},
          designElements: parseValue(row.designElements!, "json") || {},
          isDefault: parseValue(row.isDefault!, "bool") ?? false,
          userId: row.userId || null,
          createdAt: parseValue(row.createdAt!, "date"),
        },
      });
      imported++;
    } catch (e: any) {
      console.error(`Error importing theme ${row.id}: ${e.message}`);
    }
  }
  console.log(`Imported ${imported}/${rows.length} themes`);
}

async function importCommunityPosts() {
  console.log("Importing community posts...");
  const filePath = path.join("csvexported", "community_post.csv");
  if (!fs.existsSync(filePath)) {
    console.log("No community_post.csv found, skipping...");
    return;
  }
  const content = fs.readFileSync(filePath, "utf-8");
  const rows = parseCSV(content);
  let imported = 0;

  for (const row of rows) {
    try {
      await prisma.communityPost.upsert({
        where: { id: row.id! },
        update: {},
        create: {
          id: row.id!,
          title: row.title || "Untitled",
          content: row.content || "",
          category: row.category || "discussion",
          authorId: row.authorId || null,
          authorName: row.authorName || "Anonymous",
          authorEmail: row.authorEmail || null,
          likes: parseValue(row.likes!, "int") ?? 0,
          views: parseValue(row.views!, "int") ?? 0,
          isPinned: parseValue(row.isPinned!, "bool") ?? false,
          isApproved: parseValue(row.isApproved!, "bool") ?? false,
          createdAt: parseValue(row.createdAt!, "date"),
          updatedAt: parseValue(row.updatedAt!, "date"),
        },
      });
      imported++;
    } catch (e: any) {
      console.error(`Error importing community post ${row.id}: ${e.message}`);
    }
  }
  console.log(`Imported ${imported}/${rows.length} community posts`);
}

async function importCommunityComments() {
  console.log("Importing community comments...");
  const filePath = path.join("csvexported", "community_comment.csv");
  if (!fs.existsSync(filePath)) {
    console.log("No community_comment.csv found, skipping...");
    return;
  }
  const content = fs.readFileSync(filePath, "utf-8");
  const rows = parseCSV(content);
  let imported = 0;

  // Get existing post IDs
  const existingPosts = await prisma.communityPost.findMany({ select: { id: true } });
  const postIds = new Set(existingPosts.map(p => p.id));

  for (const row of rows) {
    try {
      // Skip if post doesn't exist
      if (!postIds.has(row.postId!)) {
        console.log(`Skipping comment ${row.id} - post ${row.postId} not found`);
        continue;
      }
      
      await prisma.communityComment.upsert({
        where: { id: row.id! },
        update: {},
        create: {
          id: row.id!,
          postId: row.postId!,
          content: row.content || "",
          authorName: row.authorName || "Anonymous",
          authorEmail: row.authorEmail || null,
          likes: parseValue(row.likes!, "int") ?? 0,
          isApproved: parseValue(row.isApproved!, "bool") ?? false,
          createdAt: parseValue(row.createdAt!, "date"),
        },
      });
      imported++;
    } catch (e: any) {
      console.error(`Error importing community comment ${row.id}: ${e.message}`);
    }
  }
  console.log(`Imported ${imported}/${rows.length} community comments`);
}

async function importInspirationGallery() {
  console.log("Importing inspiration gallery...");
  const filePath = path.join("csvexported", "inspiration_gallery.csv");
  if (!fs.existsSync(filePath)) {
    console.log("No inspiration_gallery.csv found, skipping...");
    return;
  }
  const content = fs.readFileSync(filePath, "utf-8");
  const rows = parseCSV(content);
  let imported = 0;

  for (const row of rows) {
    try {
      const createdAt = parseValue(row.createdAt!, "date") || new Date();
      const updatedAt = row.updatedAt ? parseValue(row.updatedAt, "date") : createdAt;
      
      await prisma.inspirationGallery.upsert({
        where: { id: row.id! },
        update: {},
        create: {
          id: row.id!,
          title: row.title || "Untitled",
          description: row.description || null,
          imageUrl: row.imageUrl!,
          category: row.category || "general",
          tags: parseValue(row.tags!, "array") || [],
          likes: parseValue(row.likes!, "int") ?? 0,
          views: parseValue(row.views!, "int") ?? 0,
          authorId: row.authorId || null,
          authorName: row.authorName || null,
          isPublic: parseValue(row.isPublic!, "bool") ?? true,
          isFeatured: parseValue(row.isFeatured!, "bool") ?? false,
          createdAt,
          updatedAt,
        },
      });
      imported++;
    } catch (e: any) {
      console.error(`Error importing inspiration ${row.id}: ${e.message}`);
    }
  }
  console.log(`Imported ${imported}/${rows.length} inspiration items`);
}

async function importInsightPosts() {
  console.log("Importing insight posts...");
  const filePath = path.join("csvexported", "insight_post.csv");
  if (!fs.existsSync(filePath)) {
    console.log("No insight_post.csv found, skipping...");
    return;
  }
  const content = fs.readFileSync(filePath, "utf-8");
  const rows = parseCSV(content);
  let imported = 0;

  for (const row of rows) {
    try {
      await prisma.insightPost.upsert({
        where: { id: row.id! },
        update: {},
        create: {
          id: row.id!,
          title: row.title || "Untitled",
          slug: row.slug!,
          excerpt: row.excerpt || "",
          content: row.content || "",
          coverImage: row.coverImage || "",
          category: row.category || "general",
          tags: parseValue(row.tags!, "array") || [],
          author: row.author || "Unknown",
          authorImage: row.authorImage || null,
          readTime: parseValue(row.readTime!, "int") ?? 5,
          views: parseValue(row.views!, "int") ?? 0,
          likes: parseValue(row.likes!, "int") ?? 0,
          isPublished: parseValue(row.isPublished!, "bool") ?? false,
          isFeatured: parseValue(row.isFeatured!, "bool") ?? false,
          publishedAt: row.publishedAt ? parseValue(row.publishedAt, "date") : null,
          createdAt: parseValue(row.createdAt!, "date"),
          updatedAt: parseValue(row.updatedAt!, "date"),
        },
      });
      imported++;
    } catch (e: any) {
      console.error(`Error importing insight post ${row.id}: ${e.message}`);
    }
  }
  console.log(`Imported ${imported}/${rows.length} insight posts`);
}

// Skip Image and Activity - they reference presentationId which doesn't exist
async function importImages() {
  console.log("Skipping images - they reference presentations which aren't exported");
}

async function importActivities() {
  console.log("Skipping activities - they reference presentations which aren't exported");
}

async function main() {
  console.log("Starting CSV import to new database...\n");

  try {
    // Import in order of dependencies
    await importUsers();
    await importThemes();
    await importCommunityPosts();
    await importCommunityComments();
    await importInspirationGallery();
    await importInsightPosts();
    await importImages();
    await importActivities();

    console.log("\n✅ Import completed!");
  } catch (error) {
    console.error("Import failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
