import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getCurrentUser } from "@/lib/auth";
 
const f = createUploadthing();
 
export const ourFileRouter = {
  pdfUploader: f({ pdf: { maxFileSize: "8MB", maxFileCount: 1 } })
    .middleware(async () => {
      const user = await getCurrentUser();
      if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.url };
    }),
    
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const user = await getCurrentUser();
      if (!user) throw new Error("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.url };
    }),
    
  videoUploader: f({ video: { maxFileSize: "32MB", maxFileCount: 1 } })
    .middleware(async () => {
      const user = await getCurrentUser();
      if (!user) throw new Error("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.url };
    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;
