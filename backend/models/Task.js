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

  static async getAllTasks() {
      try {
      // Query to fetch all tasks with their related crew members and products
      const tasks = await db('tasks')
        .select(
          'tasks.id',
          'tasks.user_id',
          'tasks.deal_id',
          'tasks.title',
          'tasks.start_datetime',
          'tasks.end_datetime',
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
        .leftJoin('task_crew_members1', 'tasks.id', 'task_crew_members.task_id') // Left join with task_crew_members table
        .leftJoin('task_products', 'tasks.id', 'task_products.task_id') // Left join with task_products table
        .orderBy('tasks.created_at', 'desc'); // Order by task creation date (optional)

      // Process and organize the results into a structured format
      const taskResults = tasks.reduce((acc, row) => {
        // Check if the task is already in the accumulator array, if not, create a new one
        const task = acc.find(t => t.id === row.id);
        if (!task) {
          const newTask = {
            id: row.id,
            user_id: row.user_id,
            deal_id: row.deal_id,
            title: row.title,
            start_datetime: moment.utc(row.start_datetime).local().format('YYYY-MM-DD HH:mm:ss'),
            end_datetime: moment.utc(row.end_datetime).local().format('YYYY-MM-DD HH:mm:ss'),
            status: row.status,
            priority: row.priority,
            color: row.color,
            deleted_at: row.deleted_at,
            crew_members: [],
            products: []
          };
          acc.push(newTask);
        }

        // Add crew member to the task if available
        if (row.crew_member_id) {
          const task = acc.find(t => t.id === row.id);
          task.crew_members.push({ user_id: row.crew_member_id });
        }

        // Add product to the task if available
        if (row.product_name) {
          const task = acc.find(t => t.id === row.id);
          task.products.push({
            product_name: row.product_name,
            product_price: row.product_price,
            extra_info: row.extra_info,
            product_status: row.product_status
          });
        }

        return acc;
      }, []);

      return taskResults;
    } catch (error) {
      throw new Error("Error fetching tasks with relations: " + error.message);
    }
  }

  // Static method to get all tasks
  static async getTasks() {
    try {
      const tasks = await db('tasks').select('*');
      return tasks;
    } catch (error) {
      throw new Error("Error fetching tasks: " + error.message);
    }
  }
  static async getNotes(taskId) {
    try {
      // Fetch notes for the given taskId
      const notes = await db('notes')
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

  // Static method to get task by ID along with associated crew members and products
  static async getTaskById(taskId) {
    try {
        const taskData = await db('tasks')
          .leftJoin('users', 'tasks.user_id', 'users.id') // Assuming 'deals.id' is the primary key in 'deals' table
          .where('tasks.id', taskId)
          .first()
          .select(
            'tasks.*', 
            'users.first_name as user_first_name',
            'users.last_name as user_last_name',
            'users.profile_image as user_profile_image',
          );

        if (taskData) {
              // Fetch related crew members for this task
              const crewMembers = await db('task_crew_members')
                .join('users', 'task_crew_members.user_id', 'users.id') // Assuming there's a 'users' table
                .where('task_crew_members.task_id', taskId)
                .select('users.id as user_id', 'users.first_name', 'users.last_name', 'users.email', 'users.profile_image', 'users.address', 'users.contact_number'); // Or any fields you want from 'users'

              // Fetch related products for this task
              const products = await db('task_products')
                .where('task_products.task_id', taskId)
                .select('*');

              // Combine all data into one object
              return {
                ...taskData,
                crew_members: crewMembers,
                products: products
              };
        } else {
          return null; // Task not found
        }
    } catch (error) {
      console.error('Error fetching task data:', error);
      return null;
    }    
  }

  // Static method to create a new task
  static async addTask({ user_id, deal_id, title, start_datetime, end_datetime, color, crew_members = [], products = [] }) {
    try {
      if(deal_id === ""){
        deal_id = null;
      }
      // Insert the task
      const [task] = await db('tasks').insert({
        user_id,
        deal_id,
        title,
        start_datetime,
        end_datetime,
        color
      }).returning('id');

      // Insert the crew members if any
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
  static async editTask({ taskId, status, priority, start_datetime, end_datetime, crew_members = [], checkedProduct = []}) {
    try {

      const updatedTask = await db('tasks')
        .where({ id: taskId })
        .update({
          status,
          priority,
          start_datetime,
          end_datetime,
        })
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
}

module.exports = Task;
