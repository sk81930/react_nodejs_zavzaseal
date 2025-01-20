const express = require('express')
const router = express.Router()
let baseResponse = require("../../Util/baseResponse.js");
const Middleware = new (require('../../middleware'))();
let taskController = new (require('../../controllers/taskController.js'))();




router.get("/getTasks", Middleware.authenticate, (req, res, next) => {
  Middleware.hasRole(req, res, next, ['admin','super_admin']);
}, async (req,res) => { 
   const response = new baseResponse(res);
   try {
     let result = await taskController.getAllTasks(req.session,req,res);
   } catch(err) {
      response.sendResponse([], false, err.message, 201);
   }
});
router.get("/getTaskById/:taskId", Middleware.authenticate, (req, res, next) => {
  Middleware.hasRole(req, res, next, ['admin','super_admin']);
}, async (req,res) => { 
   const response = new baseResponse(res);
   try {
     let result = await taskController.getTaskById(req.session,req,res);
   } catch(err) {
      response.sendResponse([], false, err.message, 201);
   }
});
router.post("/addTask", Middleware.authenticate, (req, res, next) => {
  Middleware.hasRole(req, res, next, ['admin','super_admin']);
}, async (req,res) => { 
   const response = new baseResponse(res);
   try {
     let result = await taskController.addTask(req.session,req,res);
   } catch(err) {
      response.sendResponse([], false, err.message, 201);
   }
});

router.post("/editTask/:taskId", Middleware.authenticate, (req, res, next) => {
  Middleware.hasRole(req, res, next, ['admin','super_admin']);
}, async (req,res) => { 
   const response = new baseResponse(res);
   try {
     let result = await taskController.editTask(req.session,req,res);
   } catch(err) {
      response.sendResponse([], false, err.message, 201);
   }
});

module.exports = router