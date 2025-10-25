const express = require('express');
const router = express.Router();
const pricing = require('../services/intelligentPrices');

router.post('/estimates', async(req, res) => {
    try{
        const {startAddress, endAddress} = req.body

        if (!startAddress || !endAddress) {
            return res.status(400).json({
                success: false,
                error: 'Please provide both start and end addresses'
            });
        }

        const result = await pricing.intelligentEstimation(startAddress, endAddress);
        res.json(result)
    }
    catch(error){
        res.status(500).json({
            success: false,
            error: error.message
        }); 
    }
})  

router.get('/factors', (req, res) => {
    const timing = pricing.getCurrentTimingInfo();
    res.json({
        success: true,
        timing,
        message: `Current time: ${timing.description} on ${timing.day}`
    });
});

module.exports = router;