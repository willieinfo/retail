const express = require('express');
const router = express.Router();
const { PurchRecLst, PurchDtlLst, addPurchHeader, editPurchHeader,
    addPurchDetail, editPurchDetail, deletePurchDetail, updatePurchTotals } = require('../Controllers/Purchases/purchInput');
const { PurchRepoStock, PurchSumType, PurchSumSupp, PurchSumBrnd  } = require('../Controllers/Purchases/purchReport')

router.get('/PurchRecLst', PurchRecLst)
router.get('/PurchDtlLst', PurchDtlLst)
router.get('/PurchRepoStock', PurchRepoStock)
router.get('/PurchSumType', PurchSumType)
router.get('/PurchSumSupp', PurchSumSupp)
router.get('/PurchSumBrnd', PurchSumBrnd)

router.post('/addPurchHeader', addPurchHeader)
router.post('/addPurchDetail', addPurchDetail)

router.put('/editPurchDetail', editPurchDetail)
router.put('/editPurchHeader', editPurchHeader)
router.put('/updatePurchTotals', updatePurchTotals)

router.delete('/deletePurchDetail/:id', deletePurchDetail); 



module.exports = router;
