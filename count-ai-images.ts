import { db } from "./src/server/db";

async function countImages() {
  const images = await db.image.count();
  const cloudinaryImages = await db.image.count({
    where: {
      url: { contains: "res.cloudinary.com" }
    }
  });

  const activities = await db.activity.count({
    where: { type: "image_generate" }
  });

  console.log("\n=== AI Image Generation Stats ===");
  console.log("Total Images in DB Table:", images);
  console.log("Total AI Images (Cloudinary) in DB Table:", cloudinaryImages);
  console.log("Total 'generate image' Actions Logged:", activities);
  console.log("=================================\n");
}

countImages().catch(console.error).finally(() => process.exit());
