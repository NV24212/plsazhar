import { RequestHandler } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { imageStorage } from "../lib/image-storage";

// Determine uploads directory with environment override and safe fallback
const uploadsDir = process.env.UPLOADS_DIR || "/tmp/uploads";

// Detect if local storage is writable; do not crash in read-only environments
let hasLocalStorage = false;
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  fs.accessSync(uploadsDir, fs.constants.W_OK);
  hasLocalStorage = true;
} catch (e) {
  console.warn(
    "Local uploads directory is not writable. Falling back to non-persistent memory storage unless Supabase is configured.",
  );
}

// Configure multer for file uploads
// Prefer memory storage when using Supabase; otherwise use disk storage if available; else memory (non-persistent)
const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `image-${uniqueSuffix}${ext}`);
  },
});

const storage = imageStorage.isAvailable()
  ? multer.memoryStorage()
  : hasLocalStorage
    ? diskStorage
    : multer.memoryStorage();

const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export const uploadMiddleware = upload.single("image");

export const handleImageUpload: RequestHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Use Supabase storage when available
    if (imageStorage.isAvailable()) {
      const fileBlob = new Blob([new Uint8Array(req.file.buffer)], {
        type: (req.file as any).mimetype,
      });

      const folder = (req.body as any).folder || "products";
      const result = await imageStorage.uploadImageFromBlob(
        fileBlob,
        req.file.originalname,
        folder,
      );

      if (!result.success) {
        return res.status(500).json({ error: result.error });
      }

      return res.json({
        url: result.url,
        fileName: result.fileName,
        storage: "supabase",
      });
    }

    // Local writable storage fallback
    if (hasLocalStorage && (req.file as any).filename) {
      const fileUrl = `/uploads/${(req.file as any).filename}`;
      return res.json({ url: fileUrl, fileName: (req.file as any).filename, storage: "local" });
    }

    // No storage available
    return res.status(503).json({
      error: "Image storage unavailable. Configure Supabase or set UPLOADS_DIR to a writable path (e.g., /tmp/uploads).",
    });
  } catch (error: any) {
    console.error("Error handling image upload:", error);
    return res.status(500).json({ error: "Failed to process image upload" });
  }
};

export const handleMultipleImageUpload: RequestHandler = async (req, res) => {
  const uploadMultiple = upload.array("images", 10);

  uploadMultiple(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({ error: err.message });
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    try {
      if (imageStorage.isAvailable()) {
        const fileObjects = files.map((file) => ({
          blob: new Blob([new Uint8Array(file.buffer)], { type: file.mimetype }),
          name: file.originalname,
        }));
        const folder = (req.body as any).folder || "products";
        const results = await imageStorage.uploadMultipleImagesFromBlobs(
          fileObjects,
          folder,
        );
        const successfulUploads = results.filter((r) => r.success);
        const failedUploads = results.filter((r) => !r.success);
        return res.json({ success: successfulUploads, failed: failedUploads, storage: "supabase" });
      }

      if (hasLocalStorage) {
        const urls = files.map((file: any) => ({
          success: true,
          url: `/uploads/${file.filename}`,
          fileName: file.filename,
        }));
        return res.json({ success: urls, failed: [], storage: "local" });
      }

      return res.status(503).json({
        error: "Image storage unavailable. Configure Supabase or set UPLOADS_DIR to a writable path (e.g., /tmp/uploads).",
      });
    } catch (error) {
      console.error("Error handling multiple image upload:", error);
      return res.status(500).json({ error: "Failed to process image uploads" });
    }
  });
};

export const deleteImage: RequestHandler = async (req, res) => {
  const { filename } = req.params as { filename: string };
  const { storage } = req.query as { storage?: string };

  try {
    if (storage === "supabase" && imageStorage.isAvailable()) {
      const result = await imageStorage.deleteImage(filename);
      if (!result.success) {
        return res.status(500).json({ error: result.error });
      }
      return res.status(204).send();
    }

    if (hasLocalStorage) {
      const filePath = path.join(uploadsDir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return res.status(204).send();
      }
      return res.status(404).json({ error: "File not found" });
    }

    return res.status(503).json({ error: "No storage available" });
  } catch (error) {
    console.error("Error deleting file:", error);
    return res.status(500).json({ error: "Failed to delete file" });
  }
};

export const getStorageInfo: RequestHandler = (_req, res) => {
  const storageType = imageStorage.isAvailable()
    ? "supabase"
    : hasLocalStorage
      ? "local"
      : "none";
  res.json({
    storageType,
    supabaseAvailable: imageStorage.isAvailable(),
    localAvailable: hasLocalStorage,
    uploadsDir,
    maxFileSize: "10MB",
    allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  });
};
