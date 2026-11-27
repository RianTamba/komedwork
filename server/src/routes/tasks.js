// src/routes/tasks.js
// Endpoint REST API untuk resource /api/tasks
//
// GET    /api/tasks        → daftar semua task (ORDER BY id DESC) + nama project dari JOIN
// POST   /api/tasks        → buat task baru (id dari AUTO_INCREMENT)
// GET    /api/tasks/:id    → detail 1 task
// PUT    /api/tasks/:id    → update task
// DELETE /api/tasks/:id    → hapus task

import { Router } from 'express';
import pool from '../db.js';
import { taskToFrontend } from '../mappers.js';

const router = Router();

// ----- Query helper: SELECT task + nama project via LEFT JOIN -----
const SELECT_TASK_SQL = `
  SELECT
    t.id,
    t.title,
    t.project_id,
    p.name AS project_name,
    t.category,
    t.priority,
    t.status,
    t.due_date,
    t.description,
    t.assigned_to,
    t.created_at
  FROM tasks t
  LEFT JOIN projects p ON t.project_id = p.id
`;

// ----- Helper validasi -----
function validateTaskBody(body, requireTitle = true) {
  const errors = [];
  const { title, category } = body;

  if (requireTitle && (!title || !String(title).trim())) {
    errors.push('title wajib diisi.');
  }
  if (title && String(title).trim().length > 200) {
    errors.push('title maksimal 200 karakter.');
  }
  if (category && String(category).length > 100) {
    errors.push('category maksimal 100 karakter.');
  }

  return errors;
}

// ----- GET /api/tasks -----
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`${SELECT_TASK_SQL} ORDER BY t.id DESC`);
    res.json(rows.map(taskToFrontend));
  } catch (err) {
    next(err);
  }
});

// ----- GET /api/tasks/:id -----
router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `${SELECT_TASK_SQL} WHERE t.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Task tidak ditemukan.' });
    }
    res.json(taskToFrontend(rows[0]));
  } catch (err) {
    next(err);
  }
});

// ----- POST /api/tasks -----
router.post('/', async (req, res, next) => {
  try {
    const errors = validateTaskBody(req.body, true);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(' ') });
    }

    const {
      title,
      projectId   = null,
      category    = 'Task',
      priority    = 'Medium',
      status      = 'To Do',
      dueDate     = null,
      description = null,
    } = req.body;

    // Verifikasi projectId ada di database jika dikirim
    if (projectId) {
      const [proj] = await pool.query(
        'SELECT id FROM projects WHERE id = ?',
        [projectId]
      );
      if (proj.length === 0) {
        return res.status(400).json({ error: `Project dengan id "${projectId}" tidak ditemukan.` });
      }
    }

    const [result] = await pool.query(
      `INSERT INTO tasks (title, project_id, category, priority, status, due_date, description)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        String(title).trim(),
        projectId   || null,
        String(category).trim(),
        priority,
        status,
        dueDate     || null,
        description || null,
      ]
    );

    // Ambil row lengkap (dengan JOIN project name) untuk response
    const newId = result.insertId;
    const [rows] = await pool.query(`${SELECT_TASK_SQL} WHERE t.id = ?`, [newId]);
    res.status(201).json(taskToFrontend(rows[0]));
  } catch (err) {
    next(err);
  }
});

// ----- PUT /api/tasks/:id -----
router.put('/:id', async (req, res, next) => {
  try {
    const [existing] = await pool.query(
      'SELECT id FROM tasks WHERE id = ?',
      [req.params.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Task tidak ditemukan.' });
    }

    const errors = validateTaskBody(req.body, false);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(' ') });
    }

    const { title, projectId, category, priority, status, dueDate, description } = req.body;

    // Verifikasi projectId jika dikirim dan bukan string kosong
    if (projectId !== undefined && projectId !== '' && projectId !== null) {
      const [proj] = await pool.query(
        'SELECT id FROM projects WHERE id = ?',
        [projectId]
      );
      if (proj.length === 0) {
        return res.status(400).json({ error: `Project dengan id "${projectId}" tidak ditemukan.` });
      }
    }

    const fields = [];
    const values = [];

    if (title       !== undefined) { fields.push('title = ?');       values.push(String(title).trim()); }
    if (projectId   !== undefined) { fields.push('project_id = ?');  values.push(projectId || null); }
    if (category    !== undefined) { fields.push('category = ?');    values.push(String(category).trim()); }
    if (priority    !== undefined) { fields.push('priority = ?');    values.push(priority); }
    if (status      !== undefined) { fields.push('status = ?');      values.push(status); }
    if (dueDate     !== undefined) { fields.push('due_date = ?');    values.push(dueDate || null); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description || null); }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'Tidak ada field yang diupdate.' });
    }

    values.push(req.params.id);
    await pool.query(
      `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    const [rows] = await pool.query(`${SELECT_TASK_SQL} WHERE t.id = ?`, [req.params.id]);
    res.json(taskToFrontend(rows[0]));
  } catch (err) {
    next(err);
  }
});

// ----- DELETE /api/tasks/:id -----
router.delete('/:id', async (req, res, next) => {
  try {
    const [existing] = await pool.query(
      'SELECT id FROM tasks WHERE id = ?',
      [req.params.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Task tidak ditemukan.' });
    }

    await pool.query('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    res.json({ message: 'Task berhasil dihapus.', id: Number(req.params.id) });
  } catch (err) {
    next(err);
  }
});

export default router;
