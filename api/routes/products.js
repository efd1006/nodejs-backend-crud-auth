const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const checkAuth = require('../middleware/check-auth')

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

const Product = require('../models/product');

/* All product */
router.get('/', (req, res, next) => {
  Product.find()
  .select("name price _id productImage")
  .exec()
  .then(datas  => {
    const response = {
      count: datas.length,
      products: datas.map(data => {
        return {
          _id: data._id,
          name: data.name,
          price: data.price,
          productImage: data.productImage,
          request: {
            type: 'GET',
            url: 'http:localhost:3000/products/'+ data._id
          }
        }
      })
    }
    if(datas.length > 0) {
      res.status(200).json(response);
    }else {
      res.status(404).json({message: 'No entries found'});
    }
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({error: err});
  });
});

/* Single product */
router.get('/:id', (req, res, next) => {
  const id = req.params.id;
  Product.findById(id)
  .select("name price _id productImage")
  .exec()
  .then(data => {
    if(data) {
      res.status(200).json({
        product: data,
        request: {
          type: 'GET',
          url: 'http:localhost:3000/products/'
        }
      });
    }else {
      res.status(404).json({message: 'No valid entry found for provided ID'});
    }
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({error: err});
  });

});

/* SAVE Product */ 
router.post('/', checkAuth, upload.single('productImage'), (req, res, next) => {
  console.log(req.file.path);
  //create new product object
  const product = new Product({
    name: req.body.name,
    price: req.body.price,
    productImage: req.file.path
  });
  // save it to database
  product.save()
  .then(result => {
    console.log(result);
    res.status(201).json({
      message: 'Product Created',
      createdProduct: {
        _id: result._id,
        name: result.name,
        price: result.price,
        request: {
          type: 'GET',
          url: 'http:localhost:3000/products/'+ result._id
        }
      }
    });
  })
  .catch((err) => { 
    console.log(err);
    res.status(500).json({error: err});
  });
});

/* Update Product */
router.patch('/:id', checkAuth, (req, res, next) => {
  const id = req.params.id
  const updateOps = {};
  for(const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  Product.update({ _id: id}, { $set: updateOps })
  .exec()
  .then(result => {
    res.status(200).json({
      message: 'Product Updated',
      request: {
        type: 'GET',
        url: 'http://localhost:3000/products/'+id
      }
    });
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({error: err})
  })
}); 

/* Delete product */ 
router.delete('/:id', checkAuth, (req, res, next) => {
  const id = req.params.id;
  Product.remove({ _id: id })
  .exec()
  .then(result => {
    res.status(200).json({
      message: 'Product Deleted',
      request: {
        type: 'POST',
        url: 'http://localhost:3000/products/',
        body: {name: 'String', price: 'Number'}
      }
    });
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({
      error: err
    })
  })
});


module.exports = router;