const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'User is required']
  },
  content: { 
    type: String, 
    required: [true, 'Testimonial content is required'],
    trim: true,
    maxlength: [1000, 'Testimonial cannot exceed 1000 characters']
  },
  rating: { 
    type: Number, 
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  isApproved: { 
    type: Boolean, 
    default: false 
  },
  isSeen: { 
    type: Boolean, 
    default: false 
  },
  approvedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  approvedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update updatedAt field before saving
testimonialSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for better performance
testimonialSchema.index({ isApproved: 1, isSeen: 1, createdAt: -1 });
testimonialSchema.index({ user: 1, createdAt: -1 });
testimonialSchema.index({ rating: 1 });

module.exports = mongoose.model('Testimonial', testimonialSchema);
