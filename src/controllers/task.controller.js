import Task from '../models/task.model.js'

// Create task
export const createTask = async (req, res) => {
  const { title, description } = req.body;
  const task = await Task.create({ title, description, user: req.user._id });
  res.status(201).json(task);
};

// Get tasks
export const getTasks = async (req, res) => {
  const { page = 1, limit = 5 } = req.query;
  const query = req.user.role === 'admin' ? {} : { user: req.user._id };
  const tasks = await Task.find(query)
    .skip((page - 1) * limit)
    .limit(parseInt(limit));
  res.json(tasks);
};

// Get single task
export const getTaskById = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  if (req.user.role !== 'admin' && task.user.toString() !== req.user._id.toString())
    return res.status(403).json({ message: 'Not authorized' });
  res.json(task);
};

// Update task
export const updateTask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  if (req.user.role !== 'admin' && task.user.toString() !== req.user._id.toString())
    return res.status(403).json({ message: 'Not authorized' });

  Object.assign(task, req.body);
  await task.save();
  res.json(task);
};

// Delete task
export  const deleteTask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  if (req.user.role !== 'admin' && task.user.toString() !== req.user._id.toString())
    return res.status(403).json({ message: 'Not authorized' });

  await task.remove();
  res.json({ message: 'Task removed' });
};


