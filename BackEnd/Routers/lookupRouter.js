const express = require('express');
const router = express.Router();
const { listGrup, listLoca, listSupp, editLocation, addLocation, deleteLocation } = require('../Controllers//Products/lookupController');

router.get('/listgrup', listGrup);  
router.get('/location', listLoca);  
router.get('/supplier', listSupp);  
router.post('/addLocation', addLocation);  
router.put('/editLocation', editLocation);  
router.delete('/deleteLocation/:id', deleteLocation);  // Route to delete a location


module.exports = router;
