// src/api.js
// Lapisan data: semua komunikasi frontend → REST API backend.
// Hanya file ini yang tahu tentang URL dan format HTTP.
// Komponen UI tidak perlu tahu tentang fetch, hanya memanggil fungsi di sini.

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

/**
 * Helper fetch terpusat.
 * - Selalu kirim/terima JSON.
 * - Lempar Error dengan pesan dari backend jika status bukan 2xx.
 */
async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    let message = `HTTP ${res.status}`
    try {
      const body = await res.json()
      if (body?.error) message = body.error
    } catch {
      /* abaikan jika body bukan JSON */
    }
    const err = new Error(message)
    err.status = res.status
    throw err
  }
  return res.json()
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

/** Ambil semua task (ORDER BY id DESC dari backend) */
export function fetchTasks() {
  return request('/api/tasks')
}

/** Buat task baru. id berasal dari AUTO_INCREMENT backend. */
export function createTask(data) {
  return request('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/** Update sebagian field task. Response berisi objek lengkap dengan JOIN project. */
export function updateTask(id, data) {
  return request(`/api/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/** Hapus task. */
export function deleteTask(id) {
  return request(`/api/tasks/${id}`, { method: 'DELETE' })
}

// ─── Projects ─────────────────────────────────────────────────────────────────

/** Ambil semua project. */
export function fetchProjects() {
  return request('/api/projects')
}

/** Buat project baru. id dibuat oleh backend ("project-<uuid>"). */
export function createProject(data) {
  return request('/api/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/** Update project. Response berisi objek lengkap. */
export function updateProject(id, data) {
  return request(`/api/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/** Hapus project. Task terkait otomatis menjadi projectId="" di DB (FK SET NULL). */
export function deleteProject(id) {
  return request(`/api/projects/${id}`, { method: 'DELETE' })
}
