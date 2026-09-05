import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'audio/m4a',
    'audio/wav',
    'audio/mp3',
    'audio/aac',
    'audio/mp4',
    'audio/x-m4a',
    'image/jpeg',
    'image/png',
    'image/webp',
  ];
  if (allowedMimeTypes.includes(file.mimetype) || file.originalname.match(/\.(m4a|wav|mp3|aac|jpg|jpeg|png|webp)$/i)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only emergency audio snippets (.m4a, .wav) and images (.jpg, .png) are accepted.'), false);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
  fileFilter,
});
