const Order = require('../models/Order');
const Task = require('../models/Task');




const addOrder = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Please log in first.' });
        }


        if (req.user.role !== 'customer') {
            return res.status(403).json({
                message: 'Only customers can create orders.',
            });
        }

        // ValidateOrderInput middleware have checked items ID format and quantity
        const selectedItems = req.body.items;
        const orderItems = [];
        let total = 0;

        for (const selectedItem of selectedItems) {
            const menuItem = await Task.findById(selectedItem.menuItem);

            if (!menuItem) {
                return res.status(404).json({
                    message: 'A selected menu item was not found.',
                });
            }

            const unitPrice = menuItem.price;
            const subtotal = unitPrice * selectedItem.quantity;

            orderItems.push({
                menuItem: menuItem._id,
                name: menuItem.title,
                quantity: selectedItem.quantity,
                unitPrice: unitPrice,
                subtotal: subtotal,
            });

            total += subtotal;
        }

        const order = await Order.create({
            customer: req.user.id,
            items: orderItems,
            totalAmount: total,
        });

        return res.status(201).json({
            message: 'Order created successfully.',
            order,
        });

    } catch (error) {
        console.error('Order creation failed:', error);

        return res.status(500).json({ message: 'Unable to create the order.', });
    }
};

const getOrders = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Please log in first.' });
    }

    if (req.user.role !== 'customer' && req.user.role !== 'restaurant') {
      return res.status(403).json({ message: 'Not allowed to view orders.' });
    }

    const filter =
      req.user.role === 'customer'
        ? { customer: req.user.id }
        : {};

    let query = Order.find(filter).sort({ createdAt: -1 });

    if (req.user.role === 'restaurant') {
      query = query.populate('customer', 'name email');
    }

    const orders = await query;
    return res.status(200).json(orders);
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return res.status(500).json({ message: 'Unable to fetch orders.' });
  }
};

module.exports = { addOrder, getOrders };
