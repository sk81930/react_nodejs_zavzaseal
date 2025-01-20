const baseResponse = require("../Util/baseResponse.js");
const jwtHelper = require('../Util/jwtHelper');
const Task = require('../models/Task'); 

class TaskController {
    /**
     * Constructor to initialize any defaults or dependencies
     */
    constructor() {}

    /**
     * Method to create a task
     * @param {Object} req - The request object containing task data
     * @param {Object} res - The response object
     */
    addTask = async (session, req, res) => {
        const response = new baseResponse(res);
        try {

            const {  deal_id, title, start: start_datetime, end: end_datetime,  color, crewMembers: crew_members, products } = req.body;

            if (!title || !start_datetime || !end_datetime) {
                return response.sendResponse(null, false, "Title, start and end dates are required", 400);
            }

            const taskId = await Task.addTask({
                user_id : session.id,
                deal_id,
                title,
                start_datetime,
                end_datetime,
                color,
                crew_members,
                products
            });

            return response.sendResponse({ taskId }, true, "Task created successfully", 201);
        } catch (error) {
            return response.sendResponse(null, false, "Failed to create task: " + error.message, 500);
        }
    }
    editTask = async (session, req, res) => {
        const response = new baseResponse(res);
        try {

            const taskId = req.params.taskId;

            if (!taskId) {
                return response.sendResponse(null, false, "Task ID is required", 400);
            }


            const {   status, priority, start_datetime, end_datetime, crew_members, checkedProduct = [] } = req.body;

            const {   noteText } = req.body;

            const {   commentText = "" } = req.body;


            const { noteFiles = null, noteImages = null } = req.files || {};

            if (!start_datetime || !end_datetime) {
                return response.sendResponse(null, false, "start and end dates are required", 400);
            }

            const taskData = await Task.editTask({
                taskId,
                status,
                priority,
                start_datetime,
                end_datetime,
                crew_members,
                checkedProduct
            });

            const notesData = await Task.editNotes({
                user_id: session.id,
                taskId,
                noteText,
                noteFiles,
                noteImages,
            });

            if(commentText != ""){

                const notesData = await Task.addComment({
                    user_id: session.id,
                    taskId,
                    commentText
                });

            }

            

            

            return response.sendResponse({  }, true, "Task updated successfully", 201);
        } catch (error) {
            return response.sendResponse(null, false, "Failed to create task: " + error.message, 500);
        }
    }

    /**
     * Method to get task details by task ID
     * @param {Object} req - The request object containing task ID in params
     * @param {Object} res - The response object
     */
    getTaskById = async (session, req, res) => {
        const response = new baseResponse(res);
        try {
            const taskId = req.params.taskId;

            if (!taskId) {
                return response.sendResponse(null, false, "Task ID is required", 400);
            }

            const task = await Task.getTaskById(taskId);

            if (!task) {
                return response.sendResponse(null, false, "Task not found", 404);
            }

            return response.sendResponse(task, true, "Task retrieved successfully", 200);
        } catch (error) {
            console.error(error);
            return response.sendResponse(null, false, "Failed to retrieve task: " + error.message, 500);
        }
    }
    getNotes = async (session, req, res) => {
        const response = new baseResponse(res);
        try {
            const taskId = req.params.taskId;

            if (!taskId) {
                return response.sendResponse(null, false, "Task ID is required", 400);
            }

            const task = await Task.getNotes(taskId);

            if (!task) {
                return response.sendResponse(null, false, "Notes not found", 200);
            }

            return response.sendResponse(task, true, "Notes retrieved successfully", 200);
        } catch (error) {
            console.error(error);
            return response.sendResponse(null, false, "Failed to retrieve Notes: " + error.message, 500);
        }
    }

    getComments = async (session, req, res) => {
        const response = new baseResponse(res);
        try {
            const taskId = req.params.taskId;

            if (!taskId) {
                return response.sendResponse(null, false, "Task ID is required", 400);
            }

            const task = await Task.getComments(taskId);

            if (!task) {
                return response.sendResponse(null, false, "Comments not found", 200);
            }

            return response.sendResponse(task, true, "Comments retrieved successfully", 200);
        } catch (error) {
            console.error(error);
            return response.sendResponse(null, false, "Failed to retrieve Comments: " + error.message, 500);
        }
    }

    /**
     * Method to get all tasks
     * @param {Object} req - The request object
     * @param {Object} res - The response object
     */
    getAllTasks = async (session, req, res) => {
        const response = new baseResponse(res);
        try {
            const tasks = await Task.getTasks();

            if (!tasks || tasks.length === 0) {
                return response.sendResponse(null, false, "No tasks found", 404);
            }

            return response.sendResponse(tasks, true, "Tasks retrieved successfully", 200);
        } catch (error) {
            console.error(error);
            return response.sendResponse(null, false, "Failed to retrieve tasks: " + error.message, 500);
        }
    }
}

module.exports = TaskController;
