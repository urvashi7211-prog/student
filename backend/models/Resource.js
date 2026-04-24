const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL / path is required'],
    },
    fileName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number, // bytes
      default: 0,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'video', 'image', 'document', 'other'],
      default: 'other',
    },
    category: {
      type: String,
      enum: ['notes', 'assignment', 'syllabus', 'question_paper', 'other'],
      default: 'notes',
    },
    subject: {
      type: String,
      trim: true,
      required: [true, 'Subject is required'],
    },
    semester: {
      type: Number,
      min: 1,
      max: 12,
      required: [true, 'Semester is required'],
    },
    topic: {
      type: String,
      trim: true,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    isApproved: {
      type: Boolean,
      default: true, // Admins can set to false to hold resources for review
    },
  },
  {
    timestamps: true,
  }
);

// ── Full-text search index ───────────────────────────────────────────────────
resourceSchema.index({ title: 'text', subject: 'text', topic: 'text', tags: 'text' });

const Resource = mongoose.model('Resource', resourceSchema);
module.exports = Resource;
