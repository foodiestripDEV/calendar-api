const { getTasksClient } = require('./google-auth');

class TasksService {
  constructor() {
    this.tasks = getTasksClient();
  }

  async getTaskLists() {
    try {
      const response = await this.tasks.tasklists.list();
      return response.data.items || [];
    } catch (error) {
      throw new Error(`Failed to get task lists: ${error.message}`);
    }
  }

  async createTask(taskListId, taskData) {
    try {
      const task = {
        title: taskData.title,
        notes: taskData.description,
        due: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : undefined,
        status: taskData.status || 'needsAction' // 'needsAction' or 'completed'
      };

      const response = await this.tasks.tasks.insert({
        tasklist: taskListId,
        resource: task
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to create task: ${error.message}`);
    }
  }

  async updateTask(taskListId, taskId, updateData) {
    try {
      // First get the existing task
      const existingTask = await this.tasks.tasks.get({
        tasklist: taskListId,
        task: taskId
      });

      // Prepare update data
      const updatedTask = {
        ...existingTask.data,
        title: updateData.title || existingTask.data.title,
        notes: updateData.description || existingTask.data.notes,
        status: updateData.status || existingTask.data.status
      };

      // Add due date if provided
      if (updateData.dueDate) {
        updatedTask.due = new Date(updateData.dueDate).toISOString();
      }

      const response = await this.tasks.tasks.update({
        tasklist: taskListId,
        task: taskId,
        requestBody: updatedTask
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to update task: ${error.message}`);
    }
  }

  async deleteTask(taskListId, taskId) {
    try {
      await this.tasks.tasks.delete({
        tasklist: taskListId,
        task: taskId
      });
      return { success: true, message: 'Task deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete task: ${error.message}`);
    }
  }

  async getTasks(taskListId) {
    try {
      const response = await this.tasks.tasks.list({
        tasklist: taskListId
      });

      return response.data.items;
    } catch (error) {
      throw new Error(`Failed to get tasks: ${error.message}`);
    }
  }
}

module.exports = { TasksService };