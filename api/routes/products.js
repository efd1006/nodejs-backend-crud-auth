const express = require('express');
const router = express.Router();
const multer = require('multer');
const checkAuth = require('../middleware/check-auth')

const ProductController = require('../controllers/products')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + file.originalname);
  }
});

const fileFilter = (req, file ,cb) => {
  // reject a file
  if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
  // store the file
  cb(null, true);
  }else{
    cb(null, false);
  }  
}

const upload = multer({
  storage: storage, 
  limits: {
    fieldSize: 1024 * 1204 * 5
  },
  fileFilter: fileFilter
});

/* All product */
router.get('/', ProductController.products_get_all);

/* Single product */
router.get('/:id', ProductController.products_get_product);

/* SAVE Product */ 
router.post('/', checkAuth, upload.single('productImage'), ProductController.products_create_product);

/* Update Product */
router.patch('/:id', checkAuth, ProductController.products_update_product); 

/* Delete product */ 
router.delete('/:id', checkAuth, ProductController.products_delete_product);

module.exports = router;