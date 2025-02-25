const express = require('express');
const router = express.Router();
const { listLoca, editLocation, addLocation, deleteLocation } = require('../Controllers/lookupController');

router.get('/location', listLoca);  
router.put('/editLocation', editLocation);  
router.post('/addLocation', addLocation);  
router.delete('/deleteLocation/:id', deleteLocation);  // Route to delete a location


module.exports = router;
