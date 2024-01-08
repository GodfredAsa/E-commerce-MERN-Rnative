const { Order } = require('../model/order');
const express = require('express');
const router  = express.Router();

// GET ALL Users
router.get('/', async (req, res) => {
    const orderList = await Order.find();
    if(!orderList){
        res.status(500).json({
            success: false,
            message: "Could not fetch Data"
        })
    }
    res.send(orderList);
})

module.exports = router;