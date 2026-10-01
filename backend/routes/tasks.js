const express = require('express');
const { authenticateToken, adminOnly } = require('../middleware/auth');
const { Task, User, Project } = require('../models');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.findAll({
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: Project, attributes: ['id', 'name'] },
      ],
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { title, description, dueDate, projectId, assigneeId } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ error: 'Title and projectId required' });
    }

    const task = await Task.create({
      title,
      description,
      dueDate,
      projectId,
      assigneeId,
      status: 'todo',
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: Project, attributes: ['id', 'name'] },
      ],
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: Project, attributes: ['id', 'name'] },
      ],
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const { title, description, status, dueDate, assigneeId } = req.body;

    if (req.user.role !== 'admin') {
      if (task.assigneeId !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to update this task' });
      }

      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      const allowedStatuses = ['todo', 'in-progress', 'done'];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      task.status = status;
      await task.save();

      const updatedTask = await Task.findByPk(req.params.id, {
        include: [
          { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
          { model: Project, attributes: ['id', 'name'] },
        ],
      });

      return res.json(updatedTask);
    }

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (dueDate) task.dueDate = dueDate;
    if (assigneeId && req.user.role === 'admin') task.assigneeId = assigneeId;

    await task.save();

    const updatedTask = await Task.findByPk(req.params.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: Project, attributes: ['id', 'name'] },
      ],
    });

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authenticateToken, adminOnly, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await task.destroy();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
