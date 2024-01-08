const { Category } = require("../model/category");
const express = require("express");
const router = express.Router();

// ALL CATEGORIES 
router.get("/", async (req, res) => {
  const categoryList = await Category.find();
  if (!categoryList) {
    res.status(500).json({
      success: false,
      message: "Could not fetch Data",
    });
  }
  res.status(200).send(categoryList);
});

// GET CATEGORY 
router.get('/:id', async (req, res)=> {
    const category = await Category.findById(req.params.id);
    if(!category){
        return res.status(500).json({success: false, message: "Category with given ID not found"})
    }
    res.status(200).send(category);
})

router.put('/:id', async (req, res)=> {
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            icon: req.body.icon || category.icon,
            color: req.body.color
        },
        // Returns old category without the {new: true }, although the object is updated 
        {new: true }
    )
    if(!category) return res.status(400).send("Category not updated successfully");
    return res.send(category);
})

// CREATE CATEGORY
router.post("/", async (req, res) => {
  let category = new Category({
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
  });
  category = await category.save();
  if (!category) return res.status(404).send("Category not created");
  res.send(category);
});

// DELETING WITH THE PROMISE WAY 
// findByIdAndRemove is the same as findByIdDelete
router.delete('/:id', (req, res)=> {
    Category.findByIdAndDelete(req.params.id)
    .then(category => {
        if(category){
            return res.status(200).json({success: true, message : "Category deleted successfully"})
        }else{
            return res.status(404).json({success: false, message: "Category not Found"})
        }
    }).catch(err => {
        return res.status(400).json({success: false, error: err})
    })
})

module.exports = router;
