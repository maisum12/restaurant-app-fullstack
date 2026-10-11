const mongoose = require('mongoose');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

exports.createOrder = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !items.length) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    let calculatedTotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.menuItem)) {
        return res.status(400).json({ message: `Invalid menu item ID: ${item.menuItem}` });
      }

      const dbItem = await MenuItem.findById(item.menuItem);
      if (!dbItem) {
        return res.status(404).json({ message: `Menu item not found: ${item.menuItem}` });
      }
      if (!dbItem.isAvailable) {
        return res.status(400).json({ message: `Item is currently unavailable: ${dbItem.name}` });
      }

      // Security: Calculate total using database prices to prevent client-side price tampering
      const quantity = Math.max(1, parseInt(item.quantity) || 1);
      calculatedTotal += dbItem.price * quantity;

      verifiedItems.push({
        menuItem: dbItem._id,
        name: dbItem.name,
        quantity,
        price: dbItem.price
      });
    }

    const order = await Order.create({
      user: req.user._id,
      items: verifiedItems,
      totalAmount: parseFloat(calculatedTotal.toFixed(2)),
      status: 'Pending'
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const allowedTransitions = {
      'Pending': ['Preparing', 'Cancelled'],
      'Preparing': ['Ready'],
      'Ready': ['Served'],
      'Served': [],
      'Cancelled': []
    };

    if (!allowedTransitions[order.status]?.includes(status)) {
      return res.status(400).json({
        message: `Invalid state transition from '${order.status}' to '${status}'.`
      });
    }

    order.status = status;
    await order.save();
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};