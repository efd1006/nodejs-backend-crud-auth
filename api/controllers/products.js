const mongoose = require('mongoose');

const Product = require('../models/product');

exports.products_get_all = (req, res, next) => {
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
}

exports.products_get_product = (req, res, next) => {
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

}

exports.products_create_product = (req, res, next) => {
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
}

exports.products_update_product = (req, res, next) => {
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
}

exports.products_delete_product = (req, res, next) => {
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
}