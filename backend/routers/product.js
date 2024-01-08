const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const { Product } = require("../model/product");
const { Category } = require("../model/category");

// GET ALL PRODUCTS
// router.get("/", async (req, res) => {
//   const productList = await Product.find().populate('category');
//   // NB: SENDING SOME FIELDS WITHIN THE OBJECT 
//   // USE "-fieldName" to exclude the field from the response 
//   // ALSO FIELDS SEPARATED WITH SPACES ARE RETURNED AS PART OF THE RESPONSE.
//   // </> const productList = await Product.find().select('name image -_id');
//   if (!productList) {
//     res.status(500).json({
//       success: false,
//       message: "Could not fetch Data",
//     });
//   }
//   res.send(productList);
// });

// GET ALL PRODUCTS FILTERING WITH LISTS OF CATEGORIES THATS ENHANCE OF THE GET ALL PRODUCTS
router.get("/", async (req, res) => {
  let filter = {}
  if(req.query.categories){
    filter = {category: req.query.categories.split(',')};
  }
  const productList = await Product.find(filter).populate('category');
  if (!productList) {
    res.status(500).json({
      success: false,
      message: "Could not fetch Data",
    });
  }
  res.send(productList);
});


router.get("/:id", async (req, res) => {
  // POPULATE(CATEGORY) ADDS THE CATEGORY OBJ TO THE 
  const product = await Product.findById(req.params.id).populate('category');
  if (!product) {
    res.status(500).json({
      success: false,
      message: "No Product Found With the Given ID",
    });
  }
  res.send(product);
});

// CREATE PRODUCT PROMISE PATTERN
// router.post("/", (req, res) => {
//   const newProduct = new Product({
//     name: req.body.name,
//     description: req.body.description,
//     richDescription: req.body.richDescription,
//     image: req.body.image,
//     brand: req.body.brand,
//     price: req.body.price,
//     category: req.body.category,
//     countInStock: req.body.countInStock,
//     rating: req.body.rating,
//     numReviews: req.body.numReviews,
//     isFeatured: req.body.isFeatured,
//   });
//   newProduct.save().then((createdProduct) => {
//       res.status(201).json(createdProduct);
//     })
//     .catch((err) => {
//       res.status(500).json({
//         error: err,
//         success: false,
//       });
//     });
//   console.log(newProduct);
// });

// ASYNC PATTERN
router.post("/", async (req, res) => {
  // VALIDATE CATEGORY ID
  try{
    const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).json({success: false, message: "Invalid Category"});
  let product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: req.body.image,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  });

  product = await product.save();
  if (!product) return res.status(500).json({success: false, message: "Product cannot be created"});
  return res.send(product);
  } catch(error){
    console.log(error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error', reason: "Invalid ID" });
  }
  
});

// UPDATE PRODUCT 
router.put('/:id', async (req, res)=> {
  // checks the type of id parsed.
 if(!mongoose.isValidObjectId(req.params.id)){
  return res.status(400).json({success: false, message: "Invalid Product ID"});
 }
  // validating category 
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).json({success: false, message: "Invalid Category"});
  const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
      },
      // Returns old category without the {new: true }, although the object is updated 
      {new: true }
  )
  if(!product) return res.status(400).send("Product not updated");
  return res.send(product);
})

// DELETE PRODUCT 
router.delete('/:id', (req, res)=> {
  if(!mongoose.isValidObjectId(req.params.id)){
    return res.status(400).json({success: false, message: "Invalid Product ID"});
   }
  Product.findByIdAndDelete(req.params.id).then(product => {
   return product ? res.status(200).json({success: true, message : "Product deleted successfully"}) 
   : res.status(404).json({success: false, message: "product not Found"})
      // if(product){
      //     return res.status(200).json({success: true, message : "Product deleted successfully"})
      // }else{
      //     return res.status(404).json({success: false, message: "product not Found"})
      // }
  }).catch(err => {
      return res.status(400).json({success: false, error: err})
  })
})

// PRODUCT STATISTICS 
router.get('/get/count', async (req, res)=> {
  // res.send({productCount: productCount})
  const productCount = await Product.countDocuments({});
  return productCount ? res.send({success: true, numProduct: productCount}) : res.status(400).json({success: false, message: "No Product count"}) 
})

// FEATURED PRODUCTS 
router.get('/get/featured/:count', async (req, res)=> {
  const count = req.params.count ? req.params.count : 0;
  const products = await Product.find({isFeatured: true}).limit(count);
  return products ? res.send(products) : res.status(400).json({success: false, message: "No Product count"}) 
})


// RESEARCH VERSION 
// router.get('/get/count', async (req, res) => {
//   try {
//     const productCount = await Product.countDocuments({});
//     if (productCount) {
//       res.send({ success: true, numProduct: productCount });
//     } else {
//       res.status(400).json({ success: false, message: "No Product count" });
//     }
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// });


module.exports = router;
