import multer from "multer";
import path from "path";
import fs from "fs";

const uploadPath = "uploads/profile";

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpg|jpeg|png|webp/;

  if (
    allowed.test(file.mimetype) &&
    allowed.test(path.extname(file.originalname).toLowerCase())
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only image files allowed"));
  }
};

export const uploadProfile = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

