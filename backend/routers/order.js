const { Order } = require('../model/order');
const { user } = require('../model/user');

const express = require('express');
const { OrderItem } = require('../model/order-item');
const router  = express.Router();

// GET ALL ORDERS
router.get('/', async (req, res) => {
    // returns user email and name in descending order by orderedDate 
    const orderList = await Order.find().populate('user', 'name email').sort({'dateOrdered': -1});
    if(!orderList){
        res.status(500).json({
            success: false,
            message: "Could not fetch Data"
        })
    }
    res.send(orderList);
})

// GET ORDER
router.get('/:id', async (req, res) => {
    // returns user email and name in descending order by orderedDate 
    // this structure is used for getting nested objects
    const orderDetail 
        = await Order.findById(req.params.id)
        .populate('user', 'name email')
        .populate(
            {path: "orderItems", populate: 
            {path: "product", populate: "category"}
        });

    if(!orderDetail){
        res.status(500).json({
            success: false,
            message: "Could not fetch Data"
        })
    }
    res.send(orderDetail);
})

router.post("/", async (req, res) => {
    // creating order items and returning the IDs
    // Promise.all encircle bcos we are sending an array of object and need to wait for all the promises to 
    // be resolved 
    const orderItemsIds = Promise.all(req.body.orderItems.map(async orderItem => {
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product,

        })
        newOrderItem = await newOrderItem.save();
        return newOrderItem._id
    }));

    // without resolving the IDs with await it will send promises.
    const orderItemsResolvedIds = await orderItemsIds;
    const totalPrices = await Promise.all(
        orderItemsResolvedIds.map(async orderItemId => {
            // gets each order items price 
            const orderItem = await OrderItem.findById(orderItemId).populate("product", "price");
            const totalPrice = orderItem.product.price * orderItem.quantity;
            // resolves to an array of total prices 
            return totalPrice;
        })
    )
    // summing the array of order prices 
    const orderTotalPrice = totalPrices.reduce((a, b)=> a + b, 0)

    let order = new Order({
        orderItems: orderItemsResolvedIds,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: orderTotalPrice,
        user: req.body.user,
    });
    order = await order.save();
    if (!order) return res.status(404).send("Category not created");
    res.send(order);
});

// UPDATE ORDER 
router.put('/:id', async (req, res)=> {
    const orderDetails = await Order.findByIdAndUpdate(
        req.params.id, {status: req.body.status},
        // Returns old category without the {new: true }, 
        // although the object is updated 
        { new: true }
    )
    if(!orderDetails) return res.status(400).send("Order not updated");
    return res.send(orderDetails);
})

// DELETING AN ORDER 
// deletes order item before deleting the order.
router.delete('/:id', (req, res)=> {
    Order.findByIdAndDelete(req.params.id)
    .then(async order => {
        await order.orderItems.map( async orderItem => {
            await OrderItem.findByIdAndDelete(orderItem)
        });
        return order 
            ? res.status(200).json({success: true, message : "Order deleted successfully"})
            : res.status(404).json({success: false, message: "Order not Found"})
    }).catch(err => {
        return res.status(400).json({success: false, error: err})
    })
})

router.get('/get/totalSales', async (req, res)=> {
    const orders = await Order.find();
    const totalSales = orders.map(order => order.totalPrice).reduce((a, b)=> a + b, 0);
    return res.json({totalSales: totalSales, numOrders: orders.length})
})

router.get('/get/count', async (req, res)=> {
    const orderCount = await Order.countDocuments({});
    return orderCount ? res.send({success: true, orderCount: orderCount}) : res.status(400).json({success: false, message: "No Product count"}) 
  })

module.exports = router;