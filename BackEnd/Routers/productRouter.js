const express = require('express');
const router = express.Router();
const { listItem, listBrnd, listType, listDept, listCate,
    checkUsersCde, checkOtherCde, editItemList, deleteItemList, getItemReco, addItemList
} = require('../Controllers/productController');

router.get('/listItem', listItem);  
router.get('/brands', listBrnd);  
router.get('/itemtype', listType);  
router.get('/itemdept', listDept);  
router.get('/categnum', listCate);  
router.get('/getItemReco', getItemReco);  

router.get('/checkUsersCde', checkUsersCde);  
router.get('/checkOtherCde', checkOtherCde);  

router.post('/addItemList', addItemList);  
router.put('/editItemList', editItemList);  
router.delete('/deleteItemList', deleteItemList);  


module.exports = router;
