// src/mappers.js
// Konversi snake_case (kolom database) ↔ camelCase (model frontend).
// Semua transformasi data memusat di sini agar komponen UI tidak perlu tahu
// tentang struktur database.

/**
 * Mengubah baris task dari database menjadi objek frontend.
 * Kolom `project_name` berasal dari JOIN ke tabel projects.
 *
 * @param {object} row - Baris hasil query SQL
 * @returns {object} Task sesuai model frontend
 */
export function taskToFrontend(row) {
  return {
    id:          row.id,
    title:       row.title,
    projectId:   row.project_id  ?? '',
    project:     row.project_name ?? '',   // dari JOIN, bukan kolom tasks
    category:    row.category,
    priority:    row.priority,
    status:      row.status,
    dueDate:     row.due_date    ?? '',    // string "YYYY-MM-DD" atau kosong
    description: row.description ?? '',
    createdAt:   row.created_at  ?? '',
  };
}

/**
 * Mengubah baris project dari database menjadi objek frontend.
 *
 * @param {object} row - Baris hasil query SQL
 * @returns {object} Project sesuai model frontend
 */
export function projectToFrontend(row) {
  return {
    id:          row.id,
    name:        row.name,
    client:      row.client      ?? '',
    description: row.description ?? '',
    status:      row.status,
    priority:    row.priority,
    startDate:   row.start_date  ?? '',   // string "YYYY-MM-DD" atau kosong
    deadline:    row.deadline    ?? '',   // string "YYYY-MM-DD" atau kosong
    createdAt:   row.created_at  ?? '',
  };
}
