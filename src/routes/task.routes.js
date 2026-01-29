import express from 'express'
import { createTask,getTasks,getTaskById, updateTask, deleteTask } from '../controllers/task.controller.js'
import { auth } from '../middleware/auth.js'
const router = express.Router();

router.route('/')
  .get(auth, getTasks)
  .post(auth, createTask);

router.route('/:id')
  .get(auth, getTaskById)
  .put(auth, updateTask)
  .delete(auth, deleteTask);

export default router


