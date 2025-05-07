const express = require('express');
const router = express.Router();
const { StockRecLst, StockDtlLst, addStockHeader, editStockHeader,
    addStockDetail, editStockDetail, deleteStockDetail, updateStockTotals } = require('../Controllers/Transfers/stockInput');

router.get('/StockRecLst', StockRecLst)
router.get('/StockDtlLst', StockDtlLst)

router.post('/addStockHeader', addStockHeader)
router.post('/addStockDetail', addStockDetail)

router.put('/editStockDetail', editStockDetail)
router.put('/editStockHeader', editStockHeader)
router.put('/updateStockTotals', updateStockTotals)

router.delete('/deleteStockDetail/:id', deleteStockDetail); 

module.exports = router;
