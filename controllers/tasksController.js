const { TasksService } = require('../lib/tasks-service');

class TasksController {
  constructor() {
    this.tasksService = new TasksService();
  }

  // GET TASK LISTS
  getTaskLists = async (req, res) => {
    try {
      const taskLists = await this.tasksService.getTaskLists();
      
      res.json({ 
        success: true, 
        taskLists,
        count: taskLists.length
      });
    } catch (error) {
      console.error('Error getting task lists:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  };

  // 3. CREATE TASK
  createTask = async (req, res) => {
    try {
      const { taskListId, ...taskData } = req.body;
      
      if (!taskListId || !taskData.title) {
        return res.status(400).json({ 
          success: false,
          error: 'taskListId and title are required' 
        });
      }

      const task = await this.tasksService.createTask(taskListId, taskData);
      
      res.status(201).json({ 
        success: true, 
        task,
        message: 'Task created successfully'
      });
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  };

  // 4. UPDATE TASK
  updateTask = async (req, res) => {
    try {
      const { taskId } = req.params;
      const { taskListId, ...updateData } = req.body;
      
      if (!taskListId) {
        return res.status(400).json({ 
          success: false,
          error: 'taskListId is required' 
        });
      }

      const task = await this.tasksService.updateTask(taskListId, taskId, updateData);
      
      res.json({ 
        success: true, 
        task,
        message: 'Task updated successfully'
      });
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  };

  // DELETE TASK
  deleteTask = async (req, res) => {
    try {
      const { taskId } = req.params;
      const { taskListId } = req.query;
      
      if (!taskListId) {
        return res.status(400).json({ 
          success: false,
          error: 'taskListId query parameter is required' 
        });
      }

      const result = await this.tasksService.deleteTask(taskListId, taskId);
      
      res.json(result);
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  };

  // GET TASKS from specific task list
  getTasks = async (req, res) => {
    try {
      const { taskListId } = req.query;
      
      if (!taskListId) {
        return res.status(400).json({ 
          success: false,
          error: 'taskListId query parameter is required' 
        });
      }

      const tasks = await this.tasksService.getTasks(taskListId);
      
      res.json({ 
        success: true, 
        tasks,
        count: tasks.length
      });
    } catch (error) {
      console.error('Error getting tasks:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  };
}

module.exports = new TasksController();