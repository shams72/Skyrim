const express = require('express');
const {
    getMapDataByName,
    getRoutesFromMap,
    getHealthStatus,
    getRoutesFromMapStream,
    getAllMapNames,
} = require('../controllers/mapController');

const router = express.Router();

router.get('/getMapDataByName/:mapname', getMapDataByName);
router.get('/getAllMapNames', getAllMapNames);
router.get('/getRoutesFromMapByName', getRoutesFromMap);
router.get('/getRoutesFromMapStream', getRoutesFromMapStream);
router.get('/healthz', getHealthStatus);

module.exports = router;
