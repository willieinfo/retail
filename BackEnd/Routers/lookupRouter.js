const express = require('express');
const router = express.Router();
const { listGrup, listSupp, createTables,
    listUser, addAppUsers, editAppUsers, checkLogIn, deleteAppUsers,
    listLoca, editLocation, addLocation, deleteLocation} = require('../Controllers//Products/lookupController');

router.get('/storegrp', listGrup);  
router.get('/supplier', listSupp);  

router.get('/appusers', listUser);  
router.post('/addAppUsers', addAppUsers);  
router.put('/editAppUsers', editAppUsers);  
router.get('/loggedin', checkLogIn);  
router.delete('/deleteAppUsers/:id', deleteAppUsers);  
router.post('/createTables', createTables);

router.get('/location', listLoca);  
router.post('/addLocation', addLocation);  
router.put('/editLocation', editLocation);  
router.delete('/deleteLocation/:id', deleteLocation);  // Route to delete a location

module.exports = router;
