const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth')

const Order = require('../models/order'); 
const Product = require('../models/product');


/* All order */
router.get('/', checkAuth, (req, res, next) => {
  Order.find()
  .select("product quantity _id")
  .exec()
  .then(datas => {
    res.status(200).json({
      count: datas.length,
      orders: datas.map(data => {
        return {
          _id: data.id,
          product: data.product,
          quantity: data.quantity,
          request: {
            type: 'GET',
            url: 'http://localhost:3000/orders/'+data.id
          }
        }
      })
    });
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({
      error: err
    })
  })
});

/* Single order */
router.get('/:id', checkAuth, (req, res, next) => {
  const id = req.params.id;
  Order.findById(id)
  .exec()
  .then(data => {
    if(!data) {
      return res.status(404).json({
        message: 'Order not found'
      })
    }
    res.status(200).json({
      order: data,
      request: {
        type: 'GET',
        url: 'http://localhost:3000/orders'
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

/* SAVE order */ 
router.post('/', checkAuth, (req, res, next) => {
  Product.findById(req.body.productId)
    .then(product => {
      if(!product) {
        return res.status(404).json({
          message: 'Product not found'
        })
      }
      const order = new Order({
        quantity: req.body.quantity,
        product: req.body.productId
      });
      return order.save()
    })
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: 'Order Created',
        createdObject: {
          _id: result.id,
          product: result.product,
          quantity: result.quantity
        },
        request: {
          type: 'GET',
          url: 'http://localhost:3000/order/'+result.id
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    })
});

/* Delete order */
router.delete('/:id', checkAuth, (req, res, next) => {
  const id = req.params.id;
  Order.remove({ _id: id})
  .exec()
  .then(result => {
    res.status(200).json({
      message: 'Order deleted',
      request: 'POST',
      body: { productId: '_ID', quantity: 'Number'}
    })
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({
      error: err
    })
  })
});

module.exports = router;