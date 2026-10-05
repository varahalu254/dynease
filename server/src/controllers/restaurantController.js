const MenuItem = require('../models/MenuItem');
const { uploadToCloudinary } = require('../utils/cloudinary');

exports.createMenuItem = async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId; 
    const { category, name, description, price, isAvailable, dietaryPreference, preparationTime } = req.body;

    let image = null;
    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(req.file.buffer, `dynease/menu/${restaurantId}`);
        image = {
          public_id: uploadResult.public_id,
          secure_url: uploadResult.secure_url
        };
      } catch (uploadError) {
        console.error("Cloudinary Upload Error:", uploadError);
        // Continue saving item even if image fails to upload
      }
    }

    const menuItem = await MenuItem.create({
      restaurantId,
      category,
      name,
      description,
      price,
      isAvailable,
      dietaryPreference,
      preparationTime,
      image
    });

    res.status(201).json({ success: true, data: { menuItem } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getMenu = async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const menuItems = await MenuItem.find({ restaurantId }).sort('-createdAt');
    res.status(200).json({ success: true, data: { menuItems } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
