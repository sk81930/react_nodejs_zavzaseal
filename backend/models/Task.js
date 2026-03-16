const db = require('../config/connection.js');

const moment = require('moment');
const path = require('path');
const fs = require('fs');
const { writeFile, readFile } = require("fs/promises");

class Task {
  constructor(data = null) {
    this.id = data?.id || null;
    this.user_id = data?.user_id || null;
    this.deal_id = data?.deal_id || null;
    this.title = data?.title || null;
    this.start_datetime = data?.start_datetime || null;
    this.end_datetime = data?.end_datetime || null;
    this.status = data?.status || null;
    this.priority = data?.priority || null;
    this.color = data?.color || null;
    this.deleted_at = data?.deleted_at || null;
  }

  static async getTasksData(page = 1, pagesize = 10, search = "") {
    page = parseInt(page);
    pagesize = parseInt(pagesize);
  
    const limit = pagesize;
    const offset = (page - 1) * limit;
  
    let baseQuery = db("tasks")
      .leftJoin("leads", "tasks.lead_id", "leads.id")
      .whereNull("tasks.deleted_at")
      .select(
        "tasks.id",
        "tasks.title",
        "tasks.lead_id",
        "tasks.start_date",
        "tasks.end_date",
  
        // Lead info
        "leads.lead_id as lead_code",
        "leads.NAME as lead_name",
        "leads.LAST_NAME as lead_last_name",
        "leads.lead_json_data"
      );
  
    // 🔎 SEARCH FILTER
    if (search && search.trim() !== "") {
      baseQuery = baseQuery.where(function () {
        this.where("tasks.title", "ILIKE", `%${search}%`)
          .orWhere("tasks.lead_id", "ILIKE", `%${search}%`)
          .orWhere("leads.NAME", "ILIKE", `%${search}%`)
          .orWhere("leads.LAST_NAME", "ILIKE", `%${search}%`)
          .orWhere("leads.lead_id", "ILIKE", `%${search}%`)
          .orWhereRaw(
            "leads.lead_json_data::text ILIKE ?",
            [`%${search}%`]
          );
      });
    }
  
    // COUNT QUERY
    const countQuery = baseQuery
      .clone()
      .clearSelect()
      .clearOrder()
      .countDistinct({ total: "tasks.id" })
      .first();
  
    const totalResult = await countQuery;
    const total = parseInt(totalResult?.total || 0);
  
    // PAGINATED DATA
    const rows = await baseQuery
      .orderBy("tasks.created_at", "desc")
      .limit(limit)
      .offset(offset);
  
    // 🔥 FORMAT RESULT
    const data = rows.map((row) => {
      const address =
        row.lead_json_data?.UF_CRM_LEAD_1708606658714 ||
        row.lead_json_data?.ADDRESS ||
        "";
  
      return {
        id: row.id,
        title: row.title,
        lead_id: row.lead_id,
        start_date: row.start_date,
        end_date: row.end_date,
  
        lead_data: row.lead_code
          ? {
              lead_id: row.lead_code,
              name: row.lead_name || "",
              last_name: row.lead_last_name || "",
              full_name: `${row.lead_name || ""} ${
                row.lead_last_name || ""
              }`.trim(),
              address,
            }
          : null,
      };
    });
  
    return {
      data,
      pagination: {
        total,
        page,
        pagesize,
        totalPages: Math.ceil(total / pagesize),
      },
    };
  }
  


  static async getAllTasks() {
      try {
      // Query to fetch all tasks with their related crew members and products
      const tasks = await db('tasks')
        .select(
          'tasks.id',
          'tasks.user_id',
          'tasks.deal_id',
          'tasks.lead_id',
          'tasks.title',
          'tasks.start_date',
          'tasks.end_date',
          'tasks.status',
          'tasks.priority',
          'tasks.color',
          'tasks.deleted_at',
          'task_crew_members.user_id as crew_member_id', // Crew member details
          'task_products.product_name', // Product details
          'task_products.product_price',
          'task_products.extra_info',
          'task_products.status as product_status'
        )
        .leftJoin('task_crew_members', 'tasks.id', 'task_crew_members.task_id') // Left join with task_crew_members table
        .leftJoin('task_products', 'tasks.id', 'task_products.task_id') // Left join with task_products table
        .whereNull('tasks.deleted_at') // Only get non-deleted tasks
        .orderBy('tasks.created_at', 'desc'); // Order by task creation date (optional)

      // Get unique task IDs
      const uniqueTaskIds = [...new Set(tasks.map(t => t.id))];
      
      // Fetch lead data for all tasks that have lead_id
      const leadIds = uniqueTaskIds.map(id => {
        const task = tasks.find(t => t.id === id);
        return task?.lead_id;
      }).filter(Boolean);
      
      const leadsMap = {};
      if (leadIds.length > 0) {
        const leads = await db('leads').whereIn('id', leadIds).select('*');
        leads.forEach(lead => {
          leadsMap[lead.id] = {
            id: lead.id,
            lead_id: lead.lead_id,
            name: lead.NAME || '',
            last_name: lead.LAST_NAME || '',
            full_name: `${lead.NAME || ''} ${lead.LAST_NAME || ''}`.trim(),
            address: lead.lead_json_data?.UF_CRM_LEAD_1708606658714 || lead.lead_json_data?.ADDRESS || '',
            lead_json_data: lead.lead_json_data,
            deal_id: lead.deal_id
          };
        });
      }

      // Process and organize the results into a structured format
      const taskResults = tasks.reduce((acc, row) => {
        // Check if the task is already in the accumulator array, if not, create a new one
        const task = acc.find(t => t.id === row.id);
        if (!task) {
          const leadData = row.lead_id ? leadsMap[row.lead_id] : null;
          const newTask = {
            id: row.id,
            user_id: row.user_id,
            deal_id: row.deal_id,
            lead_id: row.lead_id,
            title: row.title,
            start_datetime: row.start_date ? moment(row.start_date).format('YYYY-MM-DD') + ' 00:00:00' : null,
            end_datetime: row.end_date ? moment(row.end_date).format('YYYY-MM-DD') + ' 00:00:00' : null,
            status: row.status,
            priority: row.priority,
            color: row.color,
            deleted_at: row.deleted_at,
            lead_data: leadData,
            crew_members: [],
            products: []
          };
          acc.push(newTask);
        }

        // Add crew member to the task if available
        if (row.crew_member_id) {
          const task = acc.find(t => t.id === row.id);
          if (task && !task.crew_members.find(cm => cm.user_id === row.crew_member_id)) {
            task.crew_members.push({ user_id: row.crew_member_id });
          }
        }

        // Add product to the task if available
        if (row.product_name) {
          const task = acc.find(t => t.id === row.id);
          if (task && !task.products.find(p => p.product_name === row.product_name)) {
            task.products.push({
              product_name: row.product_name,
              product_price: row.product_price,
              extra_info: row.extra_info,
              product_status: row.product_status
            });
          }
        }

        return acc;
      }, []);

      return taskResults;
    } catch (error) {
      throw new Error("Error fetching tasks with relations: " + error.message);
    }
  }

  // Static method to get all tasks
  static async getTasks(session) {
    try {
        
    let query = db('tasks')
      .leftJoin('leads', 'tasks.lead_id', 'leads.id')
      .whereNull('tasks.deleted_at')
      .select(
        'tasks.*',
        'leads.id as lead_db_id',
        'leads.lead_id as lead_crm_id',
        'leads.NAME as lead_first_name',
        'leads.LAST_NAME as lead_last_name',
        'leads.lead_json_data'
    );

    // If crew member login -> only show assigned tasks
    if (session.role === "crew") {

      const tasksWithCrewIds = await db('task_crew_members')
        .where('user_id', session.id) // assuming crew_id stored
        .whereNull('deleted_at')
        .distinct('task_id')
        .pluck('task_id');

      query.whereIn('tasks.id', tasksWithCrewIds);
    }

   const tasks = await query.orderBy('tasks.created_at', 'desc');
   //const tasks = await db('tasks')
   //     .leftJoin('leads', 'tasks.lead_id', 'leads.id')
    //    .select(
    //      'tasks.*',
     //     'leads.id as lead_db_id',
    //      'leads.lead_id as lead_crm_id',
      //    'leads.NAME as lead_first_name',
     ///     'leads.LAST_NAME as lead_last_name',
      //    'leads.lead_json_data'
     //   );
  
    const formattedTasks = tasks.map((task) => {
  
        let address = '';
        if (task.lead_json_data) {
          address =
            task.lead_json_data?.UF_CRM_LEAD_1708606658714 ||
            task.lead_json_data?.ADDRESS ||
            '';
        }
  
        return {
          ...task,
  
          lead_data: task.lead_db_id
            ? {
                id: task.lead_db_id,
                lead_id: task.lead_crm_id,
                full_name: `${task.lead_first_name || ''} ${task.lead_last_name || ''}`.trim(),
                address: address
              }
            : null
        };
      });
  
      return formattedTasks;
  
    } catch (error) {
      throw new Error("Error fetching tasks: " + error.message);
    }
  }
  static async getNotes(taskId) {
    try {
      // Fetch notes for the given taskId
      const notes = await db('notes')
        .where('task_id', taskId)
        //.whereNot('type', 'notes')
        .orderBy('id', 'desc')
        .select("*");

      if (notes.length === 0) {
        return null; // No notes found for this task
      }

      // Fetch attachments for each note (if any)
      for (let note of notes) {

        const userr = await db('users')
          .where('id', note.user_id)
          .select("id","first_name","last_name","email","profile_image")
          .first();

        note.user = userr;

        const attachments = await db('attachments')
          .where('notes_id', note.id)
          .select("*");

        note.attachments = attachments; // Attach the fetched attachments to each note
      }

      return notes; // Return the notes with their attachments
    } catch (error) {
      throw new Error("Error fetching notes by task ID: " + error.message);
    }
  }
  
  static async getNotesByType(taskId) {
    try {
      // Fetch notes for the given taskId
      const notes = await db('notes')
        .where('task_id', taskId)
        .where('type', 'notes')
        .orderBy('id', 'desc')
        .first();


        if (!notes) {
		  return null; // No notes found for this task
		}
      return notes; // Return the notes with their attachments
    } catch (error) {
      throw new Error("Error fetching notes by task ID: " + error.message);
    }
  }
  static async getComments(taskId) {
    try {
      // Fetch notes for the given taskId
      const notes = await db('comments')
        .where('task_id', taskId)
        .orderBy('id', 'desc')
        .select("*");

      if (notes.length === 0) {
        return null; // No notes found for this task
      }

      // Fetch attachments for each note (if any)
      for (let note of notes) {

        const userr = await db('users')
          .where('id', note.user_id)
          .select("id","first_name","last_name","email","profile_image")
          .first();

        note.user = userr;

      }

      return notes; // Return the notes with their attachments
    } catch (error) {
      throw new Error("Error fetching comments by task ID: " + error.message);
    }
  }

  static async getTaskById(taskId) {
    try {
  
      const taskData = await db('tasks')
        .leftJoin('users', 'tasks.user_id', 'users.id')
        .where('tasks.id', taskId)
        .first()
        .select(
          'tasks.id',
          'tasks.user_id',
          'tasks.deal_id',
          'tasks.lead_id',
          'tasks.title',
          'tasks.status',
          'tasks.priority',
          'tasks.color',
          'tasks.deleted_at',
          'tasks.created_at',
          'tasks.updated_at',
  
          // 🔥 IMPORTANT FIX HERE
          db.raw("tasks.start_date::text as start_date"),
          db.raw("tasks.end_date::text as end_date"),
  
          'users.first_name as user_first_name',
          'users.last_name as user_last_name',
          'users.profile_image as user_profile_image'
        );
  
      if (!taskData) return null;
  
      /* ===========================
         LEAD DATA
      =========================== */
  
      let leadData = null;
  
      if (taskData.lead_id) {
        const lead = await db('leads')
          .where('id', taskData.lead_id)
          .first();
  
        if (lead) {
          leadData = {
            id: lead.id,
            lead_id: lead.lead_id,
            name: lead.NAME || '',
            last_name: lead.LAST_NAME || '',
            full_name: `${lead.NAME || ''} ${lead.LAST_NAME || ''}`.trim(),
            address: lead.lead_json_data?.UF_CRM_LEAD_1708606658714
                     || lead.lead_json_data?.ADDRESS
                     || '',
            lead_json_data: lead.lead_json_data,
            deal_id: lead.deal_id
          };

          const estimate = await db('estimations')
          .where('lead_id', lead.lead_id)
          .select('id')
          .first();

          if (estimate) {
            leadData.estimate_id = estimate.id;
          }
        }
      }
  
      /* ===========================
         CREW MEMBERS
      =========================== */
  
      const crewMembers = await db('task_crew_members')
        .join('users', 'task_crew_members.user_id', 'users.id')
        .where('task_crew_members.task_id', taskId)
        .whereNull('task_crew_members.deleted_at')
        .select(
          'users.id as user_id',
          'users.first_name',
          'users.last_name',
          'users.email',
          'users.profile_image',
          'users.address',
          'users.contact_number',
  
          // 🔥 Fix work_date too
          db.raw("task_crew_members.work_date::text as work_date")
        );
  
      /* ===========================
         PRODUCTS
      =========================== */
  
      const products = await db('task_products')
        .where('task_products.task_id', taskId)
        .select('*');
  
      return {
        ...taskData,
        lead_data: leadData,
        crew_members: crewMembers,
        products
      };
  
    } catch (error) {
      console.error('Error fetching task data:', error);
      return null;
    }
  }
  

  // Static method to create a new task
  static async addTask({ user_id, lead_id, deal_id, title, start_date, end_date, color, crew_members = [], products = [] }) {
    try {
      let finalDealId = deal_id;
      
      // If lead_id is provided, get deal_id from lead if it exists
      // Priority: use provided deal_id, otherwise get from lead
      if (lead_id) {
        const lead = await db('leads').where('id', lead_id).first();
        if (lead && lead.deal_id && !deal_id) {
          // Get deal id from deals table using lead's deal_id (string)
          const deal = await db('deals').where('deal_id', lead.deal_id).first();
          if (deal) {
            finalDealId = deal.id; // Use deals.id (integer) not deal_id (string)
          }
        }
      }
      
      if(finalDealId === ""){
        finalDealId = null;
      }
      if(lead_id === ""){
        lead_id = null;
      }
      
      
      // Insert the task
      const [task] = await db('tasks').insert({
        user_id,
        lead_id,
        deal_id: finalDealId,
        title,
        start_date,
        end_date,
        color
      }).returning('id');

      // Insert the crew members if any (no per-day work_date here; handled by crew scheduler)
      if (crew_members.length) {
        const crewData = crew_members.map(user_id => ({
          task_id: task.id,
          user_id
        }));
        await db('task_crew_members').insert(crewData);
      }

      // Insert the products if any
      if (products.length && products.length > 0) {
        const productData = products
          .filter(product => product.name && product.name.trim() !== '')
          .map(product => ({
            task_id: task.id,
            product_name: product.name,
            product_price: product.price,
          }));

        if (productData.length > 0) {
          await db('task_products').insert(productData);
        }
      }

      return task.id;
    } catch (error) {
      throw new Error("Error creating task: " + error.message);
    }
  }
  
  
  static async createNote({ user_id, task_id, description , type }) {
    try {
      
      const [note] = await db('notes').insert({
        user_id,
        task_id,
        description,
        type,
      }).returning('task_id');

     return note.task_id;
    } catch (error) {
      throw new Error("Error creating note: " + error.message);
    }
  }
  
  
  // Static method to update an existing task
  static async updateNote(taskId, data) {
	  if (!data || Object.keys(data).length === 0) {
		throw new Error("No data provided to update");
	  }

	  const updatedRows = await db('notes')
		.where({ task_id: taskId, type: 'notes' })
		.update(data)
		.returning('*'); // return the updated note

	  if (!updatedRows || updatedRows.length === 0) {
		throw new Error("Task not found or not updated");
	  }

	  return updatedRows[0]; // return the updated note object
	}
  
  
  static async editTask({ taskId, status, priority, start_date, end_date, crew_members = [], checkedProduct = []}) {
    try {
      // Extract date from datetime string if provided

      const updateData = {
        status,
        priority,
      };
      
      if (start_date !== undefined) updateData.start_date = start_date;
      if (end_date !== undefined) updateData.end_date = end_date;
      console.log(updateData);
      const updatedTask = await db('tasks')
        .where({ id: taskId })
        .update(updateData)
        .returning('*');

      // if (!updatedTask || updatedTask.length === 0) {
      //   throw new Error('Task not found');
      // }

      if (crew_members.length) {
        await db('task_crew_members')
          .where({ task_id: taskId })
          .del();

        const crewData = crew_members.map(user_id => ({
          task_id: taskId,
          user_id
        }));
        await db('task_crew_members').insert(crewData);
      }
      await db('task_products')
          .where({ task_id: taskId })
          .update({
            status : null
          })
          .returning('*');
      if (checkedProduct.length) {

          // Insert or Update the task_products table with the checked products
          for (const checkedPrId of checkedProduct) {
            // Check if the product already exists for the task
            const existingProduct = await db('task_products')
              .where({ task_id: taskId, id: checkedPrId })
              .first();

            if (existingProduct) {
              // If product exists, update it
              await db('task_products')
                .where({ task_id: taskId, id: checkedPrId })
                .update({ status: 'paid' });
            } 
          }
      }

      return updatedTask;

    } catch (error) {
      throw new Error("Error editing task: " + error.message);
    }
  }


  // Static method to update an existing task
  static async updateTask(taskId, data) {
    try {
      const updatedTask = await db('tasks')
        .where({ id: taskId })
        .update(data);

      if (!updatedTask) {
        throw new Error("Task not found or not updated");
      }

      return updatedTask;
    } catch (error) {
      throw new Error("Error updating task: " + error.message);
    }
  }

  static async uploadAttachment(attachment) {
    try {
      let root = path.resolve();
      let filepath = "/public/notes/" + attachment.originalFilename;

      // Read the file and write it to the new location
      const data = await readFile(attachment.path).then(async data => {
        const newPath = root + filepath;
        await writeFile(newPath, data); // Save file to new location
        return filepath;
      }).catch((error) => {
        return { error: error.message };
      });

      return data; // Return the file path after saving
    } catch (err) {
      return { error: err.message };
    }
  }

  // Function to handle note uploads and save attachment info to the database
  static async editNotes({ user_id, taskId, noteText, noteFiles, noteImages }) {
    try {

      let hasData = false;

      if(noteText || (noteFiles && noteFiles.length > 0) || (noteImages && noteImages.length > 0)){

        hasData = true;

      }
      if(!hasData){
        return null;
      }
      let noteId;

      const [insertedNote] = await db('notes')
        .insert({ description: noteText, task_id: taskId, user_id })
        .returning('id');
      
      noteId = insertedNote.id; // Get the ID of the newly inserted note

      // Process and upload note files (other than images)
      if (noteFiles && noteFiles.length > 0) {
        const fileAttachments = [];

        // Upload each file and store its path
        for (let file of noteFiles) {
          const uploadedPath = await Task.uploadAttachment(file);
          if (uploadedPath && !uploadedPath.error) {
            fileAttachments.push({
              notes_id: noteId,
              type: 'file', // type 'file' for non-image files
              path: uploadedPath,
            });
          }
        }

        // Insert file attachments into 'attachments' table
        if (fileAttachments.length > 0) {
          await db('attachments').insert(fileAttachments);
        }
      }

      // Process and upload note images
      if (noteImages && noteImages.length > 0) {
        const imageAttachments = [];

        // Upload each image and store its path
        for (let image of noteImages) {
          const uploadedPath = await Task.uploadAttachment(image);
          if (uploadedPath && !uploadedPath.error) {
            imageAttachments.push({
              notes_id: noteId,
              type: 'image', // type 'image' for image files
              path: uploadedPath,
            });
          }
        }

        // Insert image attachments into 'attachments' table
        if (imageAttachments.length > 0) {
          await db('attachments').insert(imageAttachments);
        }
      }

      return { noteId }; // Return the noteId, which can be used in the response
    } catch (error) {
      throw new Error("Error updating notes: " + error.message);
    }
  }
  static async addComment({ user_id, taskId, commentText }) {
    try {

      let hasData = false;

      if(commentText){

        hasData = true;

      }
      if(!hasData){
        return null;
      }
      let noteId;

      const [insertedComment] = await db('comments')
        .insert({ description: commentText, task_id: taskId, user_id })
        .returning('id');
      
      const commentId = insertedComment.id; // Get the ID of the newly inserted note

      return { commentId }; // Return the noteId, which can be used in the response

    } catch (error) {
      throw new Error("Error updating comments: " + error.message);
    }
  }

  // Static method to delete a task (soft delete)
  static async deleteTask(taskId) {
    try {
      const deletedTask = await db('tasks')
        .where({ id: taskId })
        .update({ deleted_at: db.fn.now() });

      if (!deletedTask) {
        throw new Error("Task not found or not deleted");
      }

      return deletedTask;
    } catch (error) {
      throw new Error("Error deleting task: " + error.message);
    }
  }

  /**
   * Save per-day crew assignments for a task.
   * assignments: [{ work_date: 'YYYY-MM-DD', user_ids: [1,2,3] }, ...]
   */
  /**
   * Save crew assignments for a task using soft delete.
   * This method handles:
   * - Bulk assignment (adding crew to multiple days)
   * - Individual crew removal (removing specific crew from a day)
   * - Clear all days (setting empty user_ids array)
   * 
   * All operations use soft delete (deleted_at) instead of hard delete.
   * Soft-deleted records can be restored if re-assigned.
   */
  static async saveCrewAssignments(taskId, assignments = []) {
    const trx = await db.transaction();
    try {
      for (const item of assignments) {
        const work_date = item.work_date;
        const user_ids = Array.isArray(item.user_ids) ? item.user_ids : [];

        if (!work_date) continue;

        // Get all existing non-deleted records for this task + date
        const existingRecords = await trx('task_crew_members')
          .where({ task_id: taskId, work_date })
          .whereNull('deleted_at')
          .select('user_id');

        const existingUserIds = existingRecords.map(r => r.user_id);

        // Soft delete records that are not in the new user_ids list
        // This handles: individual removal, bulk removal, and clearing all days
        const toDelete = existingUserIds.filter(id => !user_ids.includes(id));
        if (toDelete.length > 0) {
          await trx('task_crew_members')
            .where({ task_id: taskId, work_date })
            .whereIn('user_id', toDelete)
            .whereNull('deleted_at')
            .update({ deleted_at: db.fn.now() });
        }

        // Insert or restore records for user_ids that should be active
        // This handles: bulk assignment and individual assignment
        if (user_ids.length > 0) {
          for (const user_id of user_ids) {
            const existing = await trx('task_crew_members')
              .where({ task_id: taskId, user_id, work_date })
              .first();

            if (existing) {
              // Restore soft-deleted record if it exists
              if (existing.deleted_at) {
                await trx('task_crew_members')
                  .where({ task_id: taskId, user_id, work_date })
                  .update({ deleted_at: null });
              }
              // If already active, do nothing
            } else {
              // Insert new record
              await trx('task_crew_members').insert({
                task_id: taskId,
                user_id,
                work_date,
              });
            }
          }
        }
      }

      await trx.commit();
      return true;
    } catch (error) {
      await trx.rollback();
      throw new Error("Error saving crew assignments: " + error.message);
    }
  }

  /**
   * Get tasks with crew assignments, paginated
   * Returns tasks that have at least one crew member assigned
   */
  static async getTasksWithCrew(page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;

      // First, get task IDs that have crew assignments (non-deleted)
      const tasksWithCrewIds = await db('task_crew_members')
        .whereNull('deleted_at')
        .distinct('task_id')
        .pluck('task_id');

      if (tasksWithCrewIds.length === 0) {
        return {
          tasks: [],
          total: 0,
          page: page,
          limit: limit,
          totalPages: 0
        };
      }

      // Get total count
      const total = await db('tasks')
        .whereIn('id', tasksWithCrewIds)
        .whereNull('deleted_at')
        .count('* as count')
        .first();

      const totalCount = total ? parseInt(total.count) : 0;

      // Get paginated tasks
      const tasks = await db('tasks')
        .whereIn('id', tasksWithCrewIds)
        .whereNull('deleted_at')
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset)
        .select('*');

      return {
        tasks: tasks,
        total: totalCount,
        page: page,
        limit: limit,
        totalPages: Math.ceil(totalCount / limit)
      };
    } catch (error) {
      throw new Error("Error fetching tasks with crew: " + error.message);
    }
  }
}

module.exports = Task;
