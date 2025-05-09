const express = require('express');
const router = express.Router();
const { StockEndingByLocation, StockEndingByBrand } = require('../Controllers/Inventory/invenReport');

router.get('/StockEndingByLocation', StockEndingByLocation);  
router.get('/StockEndingByBrand', StockEndingByBrand);  

module.exports = router;
