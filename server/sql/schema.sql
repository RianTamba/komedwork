-- =============================================================
-- KOMEDWORK Database Schema
-- MariaDB 10.4+  |  Engine: InnoDB  |  utf8mb4
-- Catatan: CREATE INDEX IF NOT EXISTS adalah sintaks MariaDB; tidak didukung MySQL murni
-- Aman dijalankan ulang (IF NOT EXISTS)
-- =============================================================

CREATE DATABASE IF NOT EXISTS komedwork_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE komedwork_db;

-- -------------------------------------------------------------
-- Tabel: users
-- Disiapkan untuk fitur autentikasi (belum diimplementasikan).
-- password disimpan sebagai HASH (bcrypt), BUKAN plaintext.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id         INT           NOT NULL AUTO_INCREMENT,
  name       VARCHAR(100)  NOT NULL,
  email      VARCHAR(150)  NOT NULL,
  password   VARCHAR(255)  NOT NULL,          -- hashed (bcrypt)
  role       VARCHAR(50)   NOT NULL DEFAULT 'member',
  created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Tabel: projects
-- id: VARCHAR(50) karena frontend memakai format "project-<uuid>"
-- name: UNIQUE sesuai validasi di projectData.js (isValidProjectList)
-- start_date / deadline: DATE agar bisa dibandingkan & diurutkan
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
  id          VARCHAR(50)   NOT NULL,
  name        VARCHAR(150)  NOT NULL,
  client      VARCHAR(150)  NULL DEFAULT NULL,
  description TEXT          NULL DEFAULT NULL,
  status      ENUM('Planning','Active','On Hold','Completed')
                            NOT NULL DEFAULT 'Planning',
  priority    ENUM('Low','Medium','High','Urgent')
                            NOT NULL DEFAULT 'Medium',
  start_date  DATE          NULL DEFAULT NULL,
  deadline    DATE          NULL DEFAULT NULL,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_projects_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Tabel: tasks
-- id: INT AUTO_INCREMENT karena frontend memakai angka (1,2,3,4)
-- project_id: NULL berarti task tidak terkait project ("No project")
-- category: VARCHAR (bukan ENUM) karena nilai bebas di frontend
--           contoh: "Task", "Video Editing", dll.
-- assigned_to: FK ke users, disiapkan untuk fitur team assignment
-- ON DELETE SET NULL: menghapus project TIDAK menghapus task-nya
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
  id          INT           NOT NULL AUTO_INCREMENT,
  title       VARCHAR(200)  NOT NULL,
  project_id  VARCHAR(50)   NULL DEFAULT NULL,
  category    VARCHAR(100)  NOT NULL DEFAULT 'Task',
  priority    ENUM('Low','Medium','High','Urgent')
                            NOT NULL DEFAULT 'Medium',
  status      ENUM('To Do','In Progress','Review','Completed')
                            NOT NULL DEFAULT 'To Do',
  due_date    DATE          NULL DEFAULT NULL,
  description TEXT          NULL DEFAULT NULL,
  assigned_to INT           NULL DEFAULT NULL,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_tasks_project
    FOREIGN KEY (project_id) REFERENCES projects (id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT fk_tasks_assigned_to
    FOREIGN KEY (assigned_to) REFERENCES users (id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Index tambahan untuk performa query umum
-- -------------------------------------------------------------
-- Filter task berdasarkan project (JOIN / WHERE project_id = ?)
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks (project_id);

-- Filter task berdasarkan status (Kanban, My Tasks)
CREATE INDEX IF NOT EXISTS idx_tasks_status     ON tasks (status);

-- Urutkan / filter task berdasarkan tanggal jatuh tempo
CREATE INDEX IF NOT EXISTS idx_tasks_due_date   ON tasks (due_date);

-- Filter project berdasarkan status (halaman Projects)
CREATE INDEX IF NOT EXISTS idx_projects_status  ON projects (status);
