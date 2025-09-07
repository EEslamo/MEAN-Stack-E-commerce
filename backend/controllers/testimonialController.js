const Testimonial = require('../models/Testimonial');

// Get approved testimonials (public)
const getTestimonials = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, rating } = req.query;

    const query = { isApproved: true };
    if (rating) {
      query.rating = parseInt(rating);
    }

    const testimonials = await Testimonial.find(query)
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Testimonial.countDocuments(query);

    res.json({
      success: true,
      data: {
        testimonials,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create testimonial (authenticated users only)
const createTestimonial = async (req, res, next) => {
  try {
    const { content, rating } = req.body;
    const userId = req.user._id;

    // Check if user already has a testimonial
    const existingTestimonial = await Testimonial.findOne({ user: userId });
    if (existingTestimonial) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a testimonial'
      });
    }

    const testimonial = new Testimonial({
      user: userId,
      content,
      rating
    });

    await testimonial.save();
    await testimonial.populate('user', 'name');

    res.status(201).json({
      success: true,
      message: 'Testimonial submitted successfully. It will be reviewed before being published.',
      data: testimonial
    });
  } catch (error) {
    next(error);
  }
};

// Get user's testimonial
const getUserTestimonial = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const testimonial = await Testimonial.findOne({ user: userId })
      .populate('user', 'name');

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'No testimonial found'
      });
    }

    res.json({
      success: true,
      data: testimonial
    });
  } catch (error) {
    next(error);
  }
};

// Update user's testimonial
const updateTestimonial = async (req, res, next) => {
  try {
    const { content, rating } = req.body;
    const userId = req.user._id;

    const testimonial = await Testimonial.findOneAndUpdate(
      { user: userId },
      { content, rating, isApproved: false, isSeen: false }, // Reset approval status
      { new: true, runValidators: true }
    ).populate('user', 'name');

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    res.json({
      success: true,
      message: 'Testimonial updated successfully. It will be reviewed again before being published.',
      data: testimonial
    });
  } catch (error) {
    next(error);
  }
};

// Delete user's testimonial
const deleteTestimonial = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const testimonial = await Testimonial.findOneAndDelete({ user: userId });

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    res.json({
      success: true,
      message: 'Testimonial deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get pending testimonials (Admin only)
const getPendingTestimonials = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, isSeen } = req.query;

    const query = {};
    if (isSeen !== undefined) {
      query.isSeen = isSeen === 'true';
    }

    const testimonials = await Testimonial.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Testimonial.countDocuments(query);

    res.json({
      success: true,
      data: {
        testimonials,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Approve/reject testimonial (Admin only)
const updateTestimonialStatus = async (req, res, next) => {
  try {
    const { isApproved, rejectionReason } = req.body;
    const adminId = req.user._id;
    const testimonialId = req.params.id;

    const updateData = {
      isApproved,
      isSeen: true,
      approvedBy: adminId,
      approvedAt: new Date()
    };

    if (!isApproved && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    const testimonial = await Testimonial.findByIdAndUpdate(
      testimonialId,
      updateData,
      { new: true }
    ).populate('user', 'name email');

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    res.json({
      success: true,
      message: `Testimonial ${isApproved ? 'approved' : 'rejected'} successfully`,
      data: testimonial
    });
  } catch (error) {
    next(error);
  }
};

// Delete testimonial (Admin only)
const deleteTestimonialAdmin = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    res.json({
      success: true,
      message: 'Testimonial deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get testimonial statistics (Admin only)
const getTestimonialStats = async (req, res, next) => {
  try {
    const stats = await Testimonial.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          approved: { $sum: { $cond: [{ $eq: ['$isApproved', true] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$isSeen', false] }, 1, 0] } },
          averageRating: { $avg: '$rating' }
        }
      }
    ]);

    const ratingBreakdown = await Testimonial.aggregate([
      { $match: { isApproved: true } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        summary: stats[0] || {
          total: 0,
          approved: 0,
          pending: 0,
          averageRating: 0
        },
        ratingBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTestimonials,
  createTestimonial,
  getUserTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getPendingTestimonials,
  updateTestimonialStatus,
  deleteTestimonialAdmin,
  getTestimonialStats
};
