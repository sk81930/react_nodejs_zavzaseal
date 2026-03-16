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

            const {  lead_id, deal_id, title, start_date, end_date,  color, crewMembers: crew_members, products } = req.body;

            if (!title || !start_date || !end_date) {
                return response.sendResponse(null, false, "Title, start and end dates are required", 400);
            }

            const taskId = await Task.addTask({
                user_id : session.id,
                lead_id,
                deal_id,
                title,
                start_date,
                end_date,
                color,
                crew_members,
                products
            });

            return response.sendResponse({ taskId }, true, "Task created successfully", 201);
        } catch (error) {
            return response.sendResponse(null, false, "Failed to create task: " + error.message, 500);
        }
    }
	
	createNote = async (session, req, res) => {
        const response = new baseResponse(res);
		
        try {

            const { user_id, task_id, description,type} = req.body;
			
			const noteId = await Task.createNote({
                user_id : session.id,
                task_id,
                description,
                type:'notes',
             });

            return response.sendResponse({ noteId }, true, "Note added successfully", 201);
        } catch (error) {
            return response.sendResponse(null, false, "Failed to create note: " + error.message, 500);
        }
    }
	
	updateNote = async (session, req, res) => {
        const response = new baseResponse(res);

        try {
            const { TaskId, formData } = req.body;

            // formData must be the actual columns, not wrapped in another object
            const noteData = {
                description: formData.description,
            };

            const note = await Task.updateNote(TaskId, noteData);

            return response.sendResponse({ noteId: note.id }, true, "Note updated successfully", 201);
        } catch (error) {
            return response.sendResponse(null, false, "Failed to update note: " + error.message, 500);
        }
    }
	
	
    addComment = async (session, req, res) => {
        const response = new baseResponse(res);
        try {

            const taskId = req.params.taskId;

            if (!taskId) {
                return response.sendResponse(null, false, "Task ID is required", 400);
            }

            const {   commentText = "" } = req.body;



            if (commentText == "") {
                return response.sendResponse(null, false, "commentText required", 400);
            }


            const commentData = await Task.addComment({
                user_id: session.id,
                taskId,
                commentText
            });

            return response.sendResponse({  }, true, "Comment add successfully", 201);
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


            const {   status, priority, start_date, end_date, crew_members, checkedProduct = [] } = req.body;

            const {   noteText } = req.body;

            const {   commentText = "" } = req.body;


            const { noteFiles = null, noteImages = null } = req.files || {};

            if (!start_date || !end_date) {
                return response.sendResponse(null, false, "start and end dates are required", 400);
            }

            const taskData = await Task.editTask({
                taskId,
                status,
                priority,
                start_date,
                end_date,
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
	
	getNotesByType = async (session, req, res) => {
        const response = new baseResponse(res);
        try {
            const taskId = req.params.taskId;

            if (!taskId) {
                return response.sendResponse(null, false, "Task ID is required", 400);
            }

            const task = await Task.getNotesByType(taskId);

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
            const tasks = await Task.getTasks(session);

            if (!tasks || tasks.length === 0) {
                return response.sendResponse(null, false, "No tasks found", 404);
            }

            return response.sendResponse(tasks, true, "Tasks retrieved successfully", 200);
        } catch (error) {
            console.error(error);
            return response.sendResponse(null, false, "Failed to retrieve tasks: " + error.message, 500);
        }
    }

    /**
     * Get tasks with crew assignments (paginated)
     * Query params: page (default: 1), limit (default: 10)
     */
    getTasksWithCrew = async (session, req, res) => {
        const response = new baseResponse(res);
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            if (page < 1) {
                return response.sendResponse(null, false, "Page must be greater than 0", 400);
            }
            if (limit < 1 || limit > 100) {
                return response.sendResponse(null, false, "Limit must be between 1 and 100", 400);
            }

            const result = await Task.getTasksWithCrew(page, limit);
            return response.sendResponse(result, true, "Tasks with crew retrieved successfully", 200);
        } catch (error) {
            console.error(error);
            return response.sendResponse(null, false, "Failed to retrieve tasks with crew: " + error.message, 500);
        }
    }

    /**
     * Save per-day crew assignments for a task
     * Body: { assignments: [{ work_date: 'YYYY-MM-DD', user_ids: [1,2,3] }, ...] }
     */
    saveCrewAssignments = async (session, req, res) => {
        const response = new baseResponse(res);
        try {
            const taskId = req.params.taskId;
            const { assignments } = req.body || {};

            if (!taskId) {
                return response.sendResponse(null, false, "Task ID is required", 400);
            }

            await Task.saveCrewAssignments(taskId, assignments || []);

            return response.sendResponse(null, true, "Crew assignments saved successfully", 200);
        } catch (error) {
            console.error(error);
            return response.sendResponse(null, false, "Failed to save crew assignments: " + error.message, 500);
        }
    }


    async getTasksData(session, req, res) {

        const response = new baseResponse(res);

        try {
            // Support both query params (for GET) and body (for POST)
            let {page = 1, size = 50, search = ""} = req.query.page ? req.query : req.body;


            let tasksData = await Task.getTasksData(parseInt(page),parseInt(size),search);


            let data = {
                tasksData 
            };

            return response.sendResponse(data, true, "", 200);

        } catch (error) {
            console.error('Error during fetch operation1:', error.message);
            response.sendResponse(null, false, error.message, 500);
        }
    }
}

module.exports = TaskController;
