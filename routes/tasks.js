const express = require("express");
const router = express.Router();
const tasksController = require("../controllers/tasksController");
const {
  validateTask,
  validateTaskUpdate,
  validateQueryParams,
} = require("../middleware/validation");

router.get("/", tasksController.getTaskLists);

router.get("/list", validateQueryParams, tasksController.getTasks);

router.post("/", validateTask, tasksController.createTask);

router.put("/:taskId", validateTaskUpdate, tasksController.updateTask);

router.delete("/:taskId", tasksController.deleteTask);

module.exports = router;
