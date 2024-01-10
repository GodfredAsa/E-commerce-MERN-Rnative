const express = require("express");
const multer = require('multer'); // library for file upload 
const router = express.Router();
const mongoose = require('mongoose');
const { Product } = require("../model/product");
const { Category } = require("../model/category");

// image upload configuration with mutler 
const FILE_TYPE_MAP = {
  // MIME TYPE FORMAT 
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg'
}
const storage = multer.diskStorage({
  destination: function(req, file, cb){
    const isValidFile = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error('Invalid Image Type');
    if(isValidFile){
      uploadError = null;
    }
    cb(uploadError, 'public/uploads')
  }, 
  filename: function(req, file, cb){
    const fileName = file.originalname.replace(' ', '-');
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`)
  }
})

const uploadOptions = multer({storage: storage})


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


// ASYNC PATTERN CREATING A PRODUCT WITH AN IMAGE 
router.post("/", uploadOptions.single('image'),  async (req, res) => {
  // VALIDATE CATEGORY ID
  try{
    const category = await Category.findById(req.body.category);
    // CHECKING FILE ADDITION IN PRODUCT CREATION.
    const file = req.file;
    if(!file) return res.json({success: false, message: "No Image Added Added"});
  if (!category) return res.status(400).json({success: false, message: "Invalid Category"});
  const fileName = req.file.filename;
  const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

  let product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${basePath}${fileName}`,
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


// ADDING GALLERY IMAGES TO A CREATED PRODUCT, MAX NUMBER OF IMAGES PER PRODUCT IS 10 
router.put('/gallery-images/:id', uploadOptions.array('images', 10),  async (req, res, next )=> {
  if(!mongoose.isValidObjectId(req.params.id)){
    return res.status(400).json({success: false, message: "Invalid Product ID"});
   }
   const files = req.files;
   let imagesPaths = [];
   const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
   if(files){files.map( file => {
    console.log("File uploaded Name: ",file.fileName)
    imagesPaths.push(`${basePath}${file.filename}`)
  })}

  console.log("Images Pathways: ", imagesPaths)
   const product = await Product.findByIdAndUpdate(
    req.params.id,{images: imagesPaths}, { new: true }
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

module.exports = router;
