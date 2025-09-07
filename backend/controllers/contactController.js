const Contact = require('../models/Contact');

// Submit contact form
const submitContact = async (req, res, next) => {
  try {
    const { name, email, phone, category, subject, message } = req.body;

    const contact = new Contact({
      name,
      email,
      phone,
      category,
      subject,
      message
    });

    await contact.save();

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon.'
    });
  } catch (error) {
    next(error);
  }
};

// Get all contacts (Admin only)
const getContacts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      resolved,
      priority,
      fromDate,
      toDate
    } = req.query;

    // Build query
    const query = {};
    if (category) query.category = category;
    if (resolved !== undefined) query.isResolved = resolved === 'true';
    if (priority) query.priority = priority;

    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate);
    }

    const contacts = await Contact.find(query)
      .populate('resolvedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Contact.countDocuments(query);

    res.json({
      success: true,
      data: {
        contacts,
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

// Get single contact (Admin only)
const getContactById = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id)
      .populate('resolvedBy', 'name');

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    res.json({
      success: true,
      data: contact
    });
  } catch (error) {
    next(error);
  }
};

// Update contact status (Admin only)
const updateContactStatus = async (req, res, next) => {
  try {
    const { isResolved, response, priority } = req.body;
    const adminId = req.user._id;

    const updateData = {};
    if (isResolved !== undefined) {
      updateData.isResolved = isResolved;
      if (isResolved) {
        updateData.resolvedBy = adminId;
        updateData.resolvedAt = new Date();
      }
    }
    if (response) updateData.response = response;
    if (priority) updateData.priority = priority;

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('resolvedBy', 'name');

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    res.json({
      success: true,
      message: 'Contact status updated successfully',
      data: contact
    });
  } catch (error) {
    next(error);
  }
};

// Delete contact (Admin only)
const deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    res.json({
      success: true,
      message: 'Contact message deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get contact statistics (Admin only)
const getContactStats = async (req, res, next) => {
  try {
    const { fromDate, toDate } = req.query;

    const matchCondition = {};
    if (fromDate || toDate) {
      matchCondition.createdAt = {};
      if (fromDate) matchCondition.createdAt.$gte = new Date(fromDate);
      if (toDate) matchCondition.createdAt.$lte = new Date(toDate);
    }

    const stats = await Contact.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $eq: ['$isResolved', true] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$isResolved', false] }, 1, 0] } },
          complaints: { $sum: { $cond: [{ $eq: ['$category', 'complaint'] }, 1, 0] } },
          questions: { $sum: { $cond: [{ $eq: ['$category', 'question'] }, 1, 0] } }
        }
      }
    ]);

    const categoryBreakdown = await Contact.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityBreakdown = await Contact.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        summary: stats[0] || {
          total: 0,
          resolved: 0,
          pending: 0,
          complaints: 0,
          questions: 0
        },
        categoryBreakdown,
        priorityBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitContact,
  getContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
  getContactStats
};
