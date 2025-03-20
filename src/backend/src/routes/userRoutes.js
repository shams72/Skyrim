const express = require('express');
const {
    login,
    addRoutesToUser,
    createUser,
    deleteSpecificRoute,
    deleteAllRoutes,
    searchRoutes,
    sortRoutes,
    handleNavServiceReply,
} = require('../controllers/userController');

const router = express.Router();

//user routes
router.post('/createUser', createUser);
router.put('/addRoutesToUser', addRoutesToUser);
router.post('/login', login);
//delete routes
router.delete('/deleteSpecificRoute', deleteSpecificRoute);
router.delete('/deleteAllRoutes', deleteAllRoutes);
// Search and sort routes
router.get('/searchRoutes', searchRoutes);
router.get('/sortRoutes', sortRoutes);

router.post('/handleNavReply', handleNavServiceReply);

module.exports = router;
