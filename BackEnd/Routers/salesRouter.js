const express = require('express');
const router = express.Router();
const { SalesRankStore, SalesRankBrand } = require('../Controllers/salesController');
const { SalesRecLst, SalesDtlLst, addSalesHeader, 
    addSalesDetail, editSalesDetail, updateSalesTotals } = require('../Controllers/salesInput');

// router.get('/sales', getSales);  // Route to get sales
// router.post('/sales', createSale);  // Route to create a sale
// router.put('/sales/:id', updateSale);  // Route to update a sale
// router.delete('/sales/:id', deleteSale);  // Route to delete a sale

router.get('/SalesRecLst', SalesRecLst)
router.get('/SalesDtlLst', SalesDtlLst)

router.get('/SalesRankStore', SalesRankStore)
router.get('/SalesRankBrand', SalesRankBrand)

router.post('/addSalesHeader', addSalesHeader)
router.post('/addSalesDetail', addSalesDetail)

router.put('/editSalesDetail', editSalesDetail)
router.put('/updateSalesTotals', updateSalesTotals)

module.exports = router;
