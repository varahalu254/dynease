const bcrypt = require('bcrypt');

exports.getStaff = async (req, res, next) => {
  try {
    const User = req.tenantDb.model('User');
    // Don't return SUPER_ADMIN or CUSTOMER. Only restaurant staff/owner
    const staff = await User.find({ role: { $in: ['RESTAURANT_OWNER', 'RESTAURANT_STAFF', 'KITCHEN_STAFF'] } })
                            .populate('assignedTables', 'tableNumber tableName')
                            .sort('-createdAt');
    res.status(200).json({ success: true, data: { staff } });
  } catch (error) {
    next(error);
  }
};

exports.createStaff = async (req, res, next) => {
  try {
    const User = req.tenantDb.model('User');
    const { name, email, password, role, phone, assignedTables } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, password, and role.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists.' });
    }

    const newStaff = await User.create({
      name,
      email,
      password,
      role,
      phone,
      assignedTables: role === 'RESTAURANT_STAFF' ? (assignedTables || []) : [],
      restaurantId: req.user.restaurantId,
      isActive: true,
      emailVerified: true
    });

    res.status(201).json({ success: true, message: 'Staff member created.', data: { staff: newStaff } });
  } catch (error) {
    next(error);
  }
};

exports.updateStaff = async (req, res, next) => {
  try {
    const User = req.tenantDb.model('User');
    const { id } = req.params;
    const { name, email, role, phone, password, isActive, assignedTables } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Staff not found.' });
    }

    if (user.role === 'RESTAURANT_OWNER' && role !== 'RESTAURANT_OWNER') {
      return res.status(403).json({ success: false, message: 'Cannot change role of RESTAURANT_OWNER.' });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.phone = phone || user.phone;
    if (isActive !== undefined) user.isActive = isActive;
    if (user.role === 'RESTAURANT_STAFF' && assignedTables !== undefined) {
      user.assignedTables = assignedTables;
    } else if (user.role !== 'RESTAURANT_STAFF') {
      user.assignedTables = [];
    }
    
    if (password) {
      user.password = password; // pre-save hook will hash it
    }

    await user.save();

    res.status(200).json({ success: true, message: 'Staff updated.', data: { staff: user } });
  } catch (error) {
    next(error);
  }
};

exports.deleteStaff = async (req, res, next) => {
  try {
    const User = req.tenantDb.model('User');
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Staff not found.' });
    }

    if (user.role === 'RESTAURANT_OWNER') {
      return res.status(403).json({ success: false, message: 'Cannot delete RESTAURANT_OWNER.' });
    }

    await User.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Staff member deleted.' });
  } catch (error) {
    next(error);
  }
};
