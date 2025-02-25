const express = require('express');
const router = express.Router();
const {  SalesRankStore, SalesRankBrand } = require('../Controllers/salesController');

// router.get('/sales', getSales);  // Route to get sales
// router.post('/sales', createSale);  // Route to create a sale
// router.put('/sales/:id', updateSale);  // Route to update a sale
// router.delete('/sales/:id', deleteSale);  // Route to delete a sale

router.get('/SalesRankStore', SalesRankStore)
router.get('/SalesRankBrand', SalesRankBrand)

module.exports = router;
