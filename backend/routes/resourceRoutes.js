const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  uploadResource,
  getResources,
  getResourceById,
  updateResource,
  deleteResource,
  downloadResource,
} = require('../controllers/resourceController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// ── Multer storage config ────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'video/mp4',
    'video/webm',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
});

// ── Routes ───────────────────────────────────────────────
router.get('/', protect, getResources);
router.post('/', protect, upload.single('file'), uploadResource);
router.get('/:id', protect, getResourceById);
router.put('/:id', protect, updateResource);
router.delete('/:id', protect, deleteResource);
router.get('/:id/download', protect, downloadResource);

module.exports = router;
