const express = require('express');
const router = express.Router();
const { SalesCompStore, SalesRankBrand } = require('../Controllers/Sales/salesReport');
const { SalesRecLst, SalesDtlLst, addSalesHeader, editSalesHeader,
    addSalesDetail, editSalesDetail, deleteSalesDetail, updateSalesTotals } = require('../Controllers/Sales/salesInput');

// router.get('/sales', getSales);  // Route to get sales
// router.post('/sales', createSale);  // Route to create a sale
// router.put('/sales/:id', updateSale);  // Route to update a sale
// router.delete('/sales/:id', deleteSale);  // Route to delete a sale

router.get('/SalesRecLst', SalesRecLst)
router.get('/SalesDtlLst', SalesDtlLst)

router.get('/SalesCompStore', SalesCompStore)
router.get('/SalesRankBrand', SalesRankBrand)

router.post('/addSalesHeader', addSalesHeader)
router.post('/addSalesDetail', addSalesDetail)

router.put('/editSalesDetail', editSalesDetail)
router.put('/editSalesHeader', editSalesHeader)
router.put('/updateSalesTotals', updateSalesTotals)

router.delete('/deleteSalesDetail/:id', deleteSalesDetail); 

module.exports = router;
