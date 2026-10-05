const Table = require('../models/Table');
const Restaurant = require('../models/Restaurant');
const crypto = require('crypto');

exports.getTables = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    const tables = await Table.find({ restaurantId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: { tables } });
  } catch (error) {
    next(error);
  }
};

exports.getTable = async (req, res, next) => {
  try {
    const table = await Table.findOne({ _id: req.params.id, restaurantId: req.user.restaurantId });
    if (!table) return res.status(404).json({ success: false, message: 'Table not found' });
    res.status(200).json({ success: true, data: { table } });
  } catch (error) {
    next(error);
  }
};

exports.createTable = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { tableNumber, tableName } = req.body;

    const existingTable = await Table.findOne({ restaurantId, tableNumber });
    if (existingTable) {
      return res.status(409).json({ success: false, message: 'Table number already exists in your restaurant' });
    }

    const qrToken = crypto.randomBytes(16).toString('hex');
    const table = await Table.create({
      restaurantId,
      tableNumber,
      tableName,
      qrToken,
      qrCodeUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/menu/${qrToken}`
    });

    res.status(201).json({ success: true, data: { table } });
  } catch (error) {
    next(error);
  }
};

exports.updateTable = async (req, res, next) => {
  try {
    const { tableNumber, tableName, status } = req.body;
    const updateData = {};
    if (tableNumber) updateData.tableNumber = tableNumber;
    if (tableName !== undefined) updateData.tableName = tableName;
    if (status) updateData.status = status;

    const table = await Table.findOneAndUpdate(
      { _id: req.params.id, restaurantId: req.user.restaurantId },
      updateData,
      { new: true, runValidators: true }
    );
    if (!table) return res.status(404).json({ success: false, message: 'Table not found' });
    res.status(200).json({ success: true, data: { table } });
  } catch (error) {
    next(error);
  }
};

exports.deleteTable = async (req, res, next) => {
  try {
    const table = await Table.findOneAndDelete({ _id: req.params.id, restaurantId: req.user.restaurantId });
    if (!table) return res.status(404).json({ success: false, message: 'Table not found' });
    res.status(200).json({ success: true, message: 'Table deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.regenerateQR = async (req, res, next) => {
  try {
    const table = await Table.findOne({ _id: req.params.id, restaurantId: req.user.restaurantId });
    if (!table) return res.status(404).json({ success: false, message: 'Table not found' });
    
    const qrToken = crypto.randomBytes(16).toString('hex');
    table.qrToken = qrToken;
    table.qrCodeUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/menu/${qrToken}`;
    await table.save();
    
    res.status(200).json({ success: true, data: { table } });
  } catch (error) {
    next(error);
  }
};
