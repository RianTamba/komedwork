// src/routes/projects.js
// Endpoint REST API untuk resource /api/projects
//
// GET    /api/projects        → daftar semua project
// POST   /api/projects        → buat project baru (id: "project-<uuid>")
// GET    /api/projects/:id    → detail 1 project
// PUT    /api/projects/:id    → update project
// DELETE /api/projects/:id    → hapus project (tasks terkait: project_id → NULL)

import { Router } from 'express';
import { randomUUID } from 'crypto';
import pool from '../db.js';
import { projectToFrontend } from '../mappers.js';

const router = Router();

// ----- Helper validasi -----
function validateProjectBody(body, requireName = true) {
  const errors = [];
  const { name, client } = body;

  if (requireName && (!name || !String(name).trim())) {
    errors.push('name wajib diisi.');
  }
  if (name && String(name).trim().length > 150) {
    errors.push('name maksimal 150 karakter.');
  }
  if (client && String(client).length > 150) {
    errors.push('client maksimal 150 karakter.');
  }

  return errors;
}

// ----- GET /api/projects -----
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM projects ORDER BY created_at DESC'
    );
    res.json(rows.map(projectToFrontend));
  } catch (err) {
    next(err);
  }
});

// ----- GET /api/projects/:id -----
router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM projects WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Project tidak ditemukan.' });
    }
    res.json(projectToFrontend(rows[0]));
  } catch (err) {
    next(err);
  }
});

// ----- POST /api/projects -----
router.post('/', async (req, res, next) => {
  try {
    const errors = validateProjectBody(req.body, true);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(' ') });
    }

    const {
      name,
      client      = null,
      description = null,
      status      = 'Planning',
      priority    = 'Medium',
      startDate   = null,
      deadline    = null,
    } = req.body;

    // Server yang membuat id: format "project-<uuid>"
    // id dibuat oleh server: format "project-<uuid>" (crypto.randomUUID bawaan Node.js ≥ 15)
    const id = `project-${randomUUID()}`;

    await pool.query(
      `INSERT INTO projects (id, name, client, description, status, priority, start_date, deadline)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        String(name).trim(),
        client      ? String(client).trim()      : null,
        description ? String(description).trim() : null,
        status,
        priority,
        startDate || null,
        deadline  || null,
      ]
    );

    // Ambil row lengkap untuk response
    const [rows] = await pool.query('SELECT * FROM projects WHERE id = ?', [id]);
    res.status(201).json(projectToFrontend(rows[0]));
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
      return res.status(409).json({
        error: `Project dengan nama "${String(req.body.name).trim()}" sudah ada. Gunakan nama lain.`,
      });
    }
    next(err);
  }
});

// ----- PUT /api/projects/:id -----
router.put('/:id', async (req, res, next) => {
  try {
    // Cek project ada
    const [existing] = await pool.query(
      'SELECT id FROM projects WHERE id = ?',
      [req.params.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Project tidak ditemukan.' });
    }

    const errors = validateProjectBody(req.body, false);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(' ') });
    }

    const {
      name,
      client,
      description,
      status,
      priority,
      startDate,
      deadline,
    } = req.body;

    // Bangun SET dinamis hanya untuk field yang dikirim
    const fields = [];
    const values = [];

    if (name       !== undefined) { fields.push('name = ?');        values.push(String(name).trim()); }
    if (client     !== undefined) { fields.push('client = ?');      values.push(client ? String(client).trim() : null); }
    if (description!== undefined) { fields.push('description = ?'); values.push(description || null); }
    if (status     !== undefined) { fields.push('status = ?');      values.push(status); }
    if (priority   !== undefined) { fields.push('priority = ?');    values.push(priority); }
    if (startDate  !== undefined) { fields.push('start_date = ?');  values.push(startDate || null); }
    if (deadline   !== undefined) { fields.push('deadline = ?');    values.push(deadline  || null); }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'Tidak ada field yang diupdate.' });
    }

    values.push(req.params.id);
    await pool.query(
      `UPDATE projects SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    const [rows] = await pool.query('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    res.json(projectToFrontend(rows[0]));
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
      return res.status(409).json({
        error: `Project dengan nama "${String(req.body.name).trim()}" sudah ada. Gunakan nama lain.`,
      });
    }
    next(err);
  }
});

// ----- DELETE /api/projects/:id -----
router.delete('/:id', async (req, res, next) => {
  try {
    const [existing] = await pool.query(
      'SELECT id FROM projects WHERE id = ?',
      [req.params.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Project tidak ditemukan.' });
    }

    // FK ON DELETE SET NULL akan otomatis membuat tasks.project_id = NULL
    await pool.query('DELETE FROM projects WHERE id = ?', [req.params.id]);
    res.json({ message: 'Project berhasil dihapus.', id: req.params.id });
  } catch (err) {
    next(err);
  }
});

export default router;
