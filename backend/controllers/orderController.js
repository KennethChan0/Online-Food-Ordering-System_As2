const Order = require('../models/Order');
const Task = require('../models/Task');
const mongoose = require('mongoose');




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

const updateOrderStatus = async (req,res) => {
    if(!req.user) {
        return res.status(401).json({message:'Please log in first'});
    }

    if(req.user.role !=='restaurant'){
        return res.status(403).json({
            message: 'Only restaurant staff can update order status.'
        });
    }

    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).json({message:'Invalid order ID.'});
    }

    const {status} = req.body || {};
    const allowedStatuses = Order.schema.path('status').enumValues;

    if(!allowedStatuses.includes(status)){
        return res.status(400).json({
            message:`Status must be one of: ${allowedStatuses.join(', ')}.`,

        });
    }

    try{
        const order = await Order.findById(req.params.id);

        if(!order){
            return res.status(404).json({message:'Order not found.'});
        }
        
        // firstly save to memory not database
        order.status = status;
        //new status to database
        await order.save();
        //the customer Id of order change to name and email
        await order.populate('customer','name email' );

        return res.status(200).json({
            message:'Order status updated successfully',order,
        });
    }catch (error){
        console.error('Order update failed:', error);
        return res.status(500).json({
            message:'Unable to update order status',
        })
    }
}

const deleteOrder = async (req, res) => {
  if (!req.user || req.user.role !== 'restaurant') {
    return res.status(403).json({
      message: 'Only restaurant staff can delete orders.',
    });
  }

  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid order ID.' });
  }

  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    return res.status(200).json({
      message: 'Order deleted successfully.',
    });
  } catch (error) {
    console.error('Order deletion failed:', error);
    return res.status(500).json({
      message: 'Unable to delete the order.',
    });
  }
};

module.exports = { addOrder, getOrders,updateOrderStatus, deleteOrder };
