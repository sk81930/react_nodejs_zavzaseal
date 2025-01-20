const express = require('express')
const router = express.Router()
let baseResponse = require("../Util/baseResponse.js");
let callLogsController = new (require('../controllers/callLogsController.js'))();
let bitrixLeadsController = new (require('../controllers/bitrixLeadsController.js'))();
let bitrixDealsController = new (require('../controllers/bitrixDealsController.js'))();


// router.get("/", async (req, res) => {
// 	const response = new baseResponse(res);
// 	try {
// 		res.render("videocall")
// 	} catch(err) {
// 		response.sendResponse([], false, err.message, 201);
// 	}
// });

router.get("/test", async (req, res) => {
	const response = new baseResponse(res);
	try {
		response.sendResponse([], true, "Working", 200);
	} catch(err) {
		response.sendResponse([], false, err.message, 201);
	}
});

router.get("/fetch-call-logs", async (req, res) => {
	const response = new baseResponse(res);
	try {
		let result = await callLogsController.fetch(req.body,res);
	} catch(err) {
		response.sendResponse([], false, err.message, 201);
	}
});
router.get("/getBitrixLeads", async (req, res) => {
	const response = new baseResponse(res);
	try {
		let result = await bitrixLeadsController.getBitrixLeads(req.body,res);
	} catch(err) {
		response.sendResponse([], false, err.message, 201);
	}
});

router.get("/getBitrixDeals", async (req, res) => {
	const response = new baseResponse(res);
	try {
		let result = await bitrixDealsController.getBitrixDeals(req.body,res);
	} catch(err) {
		response.sendResponse([], false, err.message, 201);
	}
});

module.exports = router