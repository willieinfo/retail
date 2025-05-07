const express = require('express');
const router = express.Router();
const { StockEndingByLocation } = require('../Controllers/Inventory/invenReport');

router.get('/StockEndingByLocation', StockEndingByLocation);  

module.exports = router;
