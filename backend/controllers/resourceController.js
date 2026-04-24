const path = require('path');
const fs = require('fs');
const Resource = require('../models/Resource');

// ─────────────────────────────────────────────────────────
//  @desc    Upload a new resource
//  @route   POST /api/resources
//  @access  Private (Student / Admin)
// ─────────────────────────────────────────────────────────
const uploadResource = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }

  const { title, description, category, subject, semester, topic, tags } = req.body;

  if (!title || !subject || !semester) {
    return res
      .status(400)
      .json({ success: false, message: 'Title, subject, and semester are required.' });
  }

  try {
    // Determine file type from mime type
    const mime = req.file.mimetype;
    let fileType = 'other';
    if (mime === 'application/pdf') fileType = 'pdf';
    else if (mime.startsWith('video/')) fileType = 'video';
    else if (mime.startsWith('image/')) fileType = 'image';
    else if (mime.includes('word') || mime.includes('document')) fileType = 'document';

    const resource = await Resource.create({
      title,
      description,
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType,
      category: category || 'notes',
      subject,
      semester: Number(semester),
      topic: topic || '',
      tags: tags ? tags.split(',').map((t) => t.trim()) : [],
      uploadedBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: 'Resource uploaded successfully.',
      resource,
    });
  } catch (error) {
    console.error('uploadResource error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─────────────────────────────────────────────────────────
//  @desc    Get all resources (with search & filter)
//  @route   GET /api/resources
//  @access  Private
// ─────────────────────────────────────────────────────────
const getResources = async (req, res) => {
  try {
    const {
      search,
      subject,
      semester,
      category,
      fileType,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = { isApproved: true };

    // Full-text search
    if (search) {
      query.$text = { $search: search };
    }

    // Filters
    if (subject) query.subject = { $regex: subject, $options: 'i' };
    if (semester) query.semester = Number(semester);
    if (category) query.category = category;
    if (fileType) query.fileType = fileType;

    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    const [resources, total] = await Promise.all([
      Resource.find(query)
        .populate('uploadedBy', 'name email')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(Number(limit)),
      Resource.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      resources,
    });
  } catch (error) {
    console.error('getResources error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─────────────────────────────────────────────────────────
//  @desc    Get single resource by ID
//  @route   GET /api/resources/:id
//  @access  Private
// ─────────────────────────────────────────────────────────
const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).populate(
      'uploadedBy',
      'name email course semester'
    );

    if (!resource || !resource.isApproved) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }

    return res.status(200).json({ success: true, resource });
  } catch (error) {
    console.error('getResourceById error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─────────────────────────────────────────────────────────
//  @desc    Update resource metadata
//  @route   PUT /api/resources/:id
//  @access  Private (owner or admin)
// ─────────────────────────────────────────────────────────
const updateResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }

    // Only owner or admin can update
    const isOwner = resource.uploadedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ success: false, message: 'Not authorized to update this resource.' });
    }

    const { title, description, category, subject, semester, topic, tags } = req.body;

    if (title) resource.title = title;
    if (description !== undefined) resource.description = description;
    if (category) resource.category = category;
    if (subject) resource.subject = subject;
    if (semester) resource.semester = Number(semester);
    if (topic !== undefined) resource.topic = topic;
    if (tags) resource.tags = tags.split(',').map((t) => t.trim());

    const updated = await resource.save();
    return res.status(200).json({ success: true, resource: updated });
  } catch (error) {
    console.error('updateResource error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─────────────────────────────────────────────────────────
//  @desc    Delete a resource
//  @route   DELETE /api/resources/:id
//  @access  Private (owner or admin)
// ─────────────────────────────────────────────────────────
const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }

    const isOwner = resource.uploadedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ success: false, message: 'Not authorized to delete this resource.' });
    }

    // Remove physical file from disk
    const filePath = path.join(__dirname, '..', resource.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await resource.deleteOne();
    return res.status(200).json({ success: true, message: 'Resource deleted.' });
  } catch (error) {
    console.error('deleteResource error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─────────────────────────────────────────────────────────
//  @desc    Download a resource file
//  @route   GET /api/resources/:id/download
//  @access  Private
// ─────────────────────────────────────────────────────────
const downloadResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource || !resource.isApproved) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }

    const filePath = path.join(__dirname, '..', resource.fileUrl);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on server.' });
    }

    // Increment download count
    resource.downloadCount += 1;
    await resource.save();

    return res.download(filePath, resource.fileName);
  } catch (error) {
    console.error('downloadResource error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  uploadResource,
  getResources,
  getResourceById,
  updateResource,
  deleteResource,
  downloadResource,
};
