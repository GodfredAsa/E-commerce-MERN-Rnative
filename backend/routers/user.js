const { User } = require("../model/user");
const mongoose = require('mongoose');
require("dotenv/config");
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken')
const router = express.Router();

// GET ALL Users
router.get("/", async (req, res) => {
  const userList = await User.find().select("-passwordHash");
  if (!userList) {
    res.status(500).json({
      success: false,
      message: "Could not fetch Data",
    });
  }
  res.send(userList);
});

// CREATE CATEGORY
router.post("/", async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    isAdmin: req.body.isAdmin,
    phone: req.body.phone,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    street: req.body.street,
    apartment: req.body.apartment,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,
  });
  user = await user.save();
  if (!user) return res.status(404).send("User not created");
  res.send(user);
});

router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id).select("-passwordHash");
  if (!user) {
    return res.status(500).json({ success: false, message: "User with given ID not found" });
  }
  res.status(200).send(user);
});

// AUTHENTICATION 
router.post('/login', async (req, res)=> {
    const user  = await User.findOne({email: req.body.email});
    if(!user) return res.status(400).json({success: false, message: "User does not exists"});
    if(user && bcrypt.compareSync(req.body.password, user.passwordHash)){
      // isAdmin is added to the token generation to protect the app, 
      // so users don't login as admins and perform admin functionalities.
        const token = jwt.sign(
            {
              userId: user.id,
              isAdmin: user.isAdmin
            }, 
            process.env.AUTH_SECRET, 
            {expiresIn: '1d'}
        )
        return res.status(200).send(
            {
                success: true,
                user: user,
                token: token, 
                message: "Authentication Successful"
        })    
    }else{
        res.status(400).send({success: false, message: "Invalid user password"})
    }
})

// PRODUCT COUNT STATISTICS 
router.get('/get/count', async (req, res)=> {
  const userCount = await User.countDocuments({});
  return userCount ? res.send({success: true, userCount: userCount}) : res.status(400).json({success: false, message: "No User count"}) 
})

router.delete('/:id', (req, res)=> {
  if(!mongoose.isValidObjectId(req.params.id)){
    return res.status(400).json({success: false, message: "Invalid User ID"});
   }
  User.findByIdAndDelete(req.params.id).then(user => {
   return user ? res.status(200).json({success: true, message : "User deleted successfully"}) 
   : res.status(404).json({success: false, message: "User not Found"})
  }).catch(err => {
      return res.status(400).json({success: false, error: err})
  })
})

module.exports = router;
