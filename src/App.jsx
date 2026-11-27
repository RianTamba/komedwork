
import { useCallback, useEffect, useState } from 'react'
import {
  LayoutDashboard,
  ListTodo,
  FolderKanban,
  Users,
  History,
  Settings,
  Search,
  Columns3,
  Bell,
  Plus,
  ChevronDown,
  CalendarDays,
  CircleCheck,
  Clock3,
  AlertCircle,
  ArrowUpRight,
  BriefcaseBusiness,
  Pencil,
  Trash2,
} from 'lucide-react'
import {
  HistoryPage,
  MyTasksPage,
  ProjectsPage,
  SettingsPage,
  TeamPage,
} from './WorkspacePages.jsx'
import KanbanPage from './KanbanPage.jsx'
import { DeleteTaskDialog, TaskEditorModal } from './TaskDialogs.jsx'
import {
  formatDueDate,
  priorities,
  statuses,
  statusColors,
} from './taskData.js'
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask as apiDeleteTask,
  fetchProjects,
  createProject as apiCreateProject,
  updateProject as apiUpdateProject,
  deleteProject as apiDeleteProject,
} from './api.js'

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'My Tasks', icon: ListTodo },
  { name: 'Kanban', icon: Columns3 },
  { name: 'Projects', icon: FolderKanban },
  { name: 'Team', icon: Users },
  { name: 'History', icon: History },
]

function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="fixed left-0 top-0 flex h-screen w-20 flex-col bg-[#172033] px-3 py-6 text-white lg:w-64 lg:px-5">
      <div className="mb-10 flex items-center justify-center gap-3 lg:justify-start">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600">
          <BriefcaseBusiness size={21} />
        </div>
        <div className="hidden lg:block">
          <h1 className="text-lg font-bold tracking-wide">KOMEDWORK</h1>
          <p className="text-xs text-slate-400">Kotakmedia Workspace</p>
        </div>
      </div>

      <p className="mb-3 hidden text-xs font-semibold uppercase tracking-widest text-slate-500 lg:block">
        Workspace
      </p>

      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activePage === item.name

          return (
            <button
              key={item.name}
              type="button"
              onClick={() => onNavigate(item.name)}
              aria-label={item.name}
              title={item.name}
              aria-current={isActive ? 'page' : undefined}
              className={`flex w-full items-center justify-center gap-3 rounded-xl px-2 py-3 text-sm transition lg:justify-start lg:px-3 ${
                isActive
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-950/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={18} className="shrink-0" />
              <span className="hidden lg:inline">{item.name}</span>
            </button>
          )
        })}
      </nav>

      <div className="mt-auto">
        <button
          type="button"
          onClick={() => onNavigate('Settings')}
          aria-label="Settings"
          title="Settings"
          aria-current={activePage === 'Settings' ? 'page' : undefined}
          className={`flex w-full items-center justify-center gap-3 rounded-xl px-2 py-3 text-sm transition lg:justify-start lg:px-3 ${
            activePage === 'Settings'
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-950/30'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Settings size={18} className="shrink-0" />
          <span className="hidden lg:inline">Settings</span>
        </button>

        <div className="mt-4 hidden items-center gap-3 rounded-xl border border-slate-700 p-3 lg:flex">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500 font-semibold">
            R
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium">Rian Tamba</p>
            <p className="truncate text-xs text-slate-400">Multimedia Team</p>
          </div>
          <ChevronDown size={16} className="ml-auto text-slate-400" />
        </div>
      </div>
    </aside>
  )
}

function StatCard({ title, value, subtitle, icon: Icon, iconColor, iconBg }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{title}</p>
        <div className={`rounded-xl p-2.5 ${iconBg}`}>
          <Icon size={20} className={iconColor} />
        </div>
      </div>

      <div className="mt-3 flex items-end justify-between">
        <h3 className="text-3xl font-bold tracking-tight text-slate-800">
          {value}
        </h3>
        <span className="mb-1 flex items-center text-xs font-medium text-slate-500">
          <ArrowUpRight size={14} />
          {subtitle}
        </span>
      </div>
    </div>
  )
}

function Dashboard({ tasks, onUpdateTaskStatus, onAddTask, onEditTask, onDeleteTask }) {
  const [search, setSearch] = useState('')
  const [today] = useState(() => {
    const localToday = new Date()
    localToday.setMinutes(localToday.getMinutes() - localToday.getTimezoneOffset())
    return localToday.toISOString().slice(0, 10)
  })
  const completedTasks = tasks.filter((task) => task.status === 'Completed').length
  const inProgressTasks = tasks.filter((task) => task.status === 'In Progress').length
  const toDoTasks = tasks.filter((task) => task.status === 'To Do').length
  const reviewTasks = tasks.filter((task) => task.status === 'Review').length
  const overdueTasks = tasks.filter(
    (task) => task.dueDate && task.dueDate < today && task.status !== 'Completed',
  ).length
  const completionRate = tasks.length
    ? Math.round((completedTasks / tasks.length) * 100)
    : 0
  const statusOverview = statuses.map((status) => ({
    status,
    count: tasks.filter((task) => task.status === status).length,
  }))
  const largestStatusCount = Math.max(...statusOverview.map((item) => item.count), 1)
  const filteredTasks = tasks.filter((task) => {
    const query = search.trim().toLowerCase()
    return (
      task.title.toLowerCase().includes(query) ||
      task.project.toLowerCase().includes(query)
    )
  })

  return (
    <main className="min-h-screen bg-[#F5F6FA] p-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Workspace / Overview</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-800">
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Welcome back! Here&apos;s what&apos;s happening with your work.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50">
            <Bell size={19} />
          </button>

          <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 sm:flex">
            <CalendarDays size={17} className="text-slate-500" />
            <span className="text-sm text-slate-600">November 2026</span>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Tasks"
          value={tasks.length}
          subtitle="All tasks"
          icon={ListTodo}
          iconColor="text-violet-600"
          iconBg="bg-violet-50"
        />
        <StatCard
          title="Completed"
          value={completedTasks}
          subtitle={`${completionRate}% completed`}
          icon={CircleCheck}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="In Progress"
          value={inProgressTasks}
          subtitle="Currently active"
          icon={Clock3}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Overdue"
          value={overdueTasks}
          subtitle="Need attention"
          icon={AlertCircle}
          iconColor="text-rose-600"
          iconBg="bg-rose-50"
        />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 xl:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-800">Task Overview</h3>
              <p className="mt-1 text-sm text-slate-500">
                Tasks grouped by status
              </p>
            </div>
            <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600">
              This week <ChevronDown size={14} className="ml-1 inline" />
            </button>
          </div>

          <div className="flex h-48 items-end gap-4 border-b border-slate-100 pb-4">
            {statusOverview.map(({ status, count }) => (
              <div key={status} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-medium text-slate-500">{count}</span>
                <div
                  className="w-full max-w-12 rounded-t-lg bg-violet-500 transition hover:bg-violet-600"
                  style={{
                    height: `${count ? Math.max((count / largestStatusCount) * 100, 12) : 4}%`,
                  }}
                />
                <span className="text-center text-xs text-slate-400">
                  {status.replace(' ', '\u00a0')}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-semibold text-slate-800">Task Progress</h3>
          <p className="mt-1 text-sm text-slate-500">Overall completion</p>

          <div className="my-7 flex items-center justify-center">
            <div
              className="h-36 w-36 rounded-full p-[14px]"
              style={{
                background: `conic-gradient(#7c3aed ${completionRate}%, #ede9fe ${completionRate}% 100%)`,
              }}
            >
              <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
                <div className="text-center">
                  <p className="text-3xl font-bold text-slate-800">{completionRate}%</p>
                  <p className="text-xs text-slate-400">Completed</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Completed</span>
              <span className="font-medium text-slate-700">{completedTasks}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">In Progress</span>
              <span className="font-medium text-slate-700">{inProgressTasks}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">To Do</span>
              <span className="font-medium text-slate-700">{toDoTasks}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Review</span>
              <span className="font-medium text-slate-700">{reviewTasks}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-slate-800">Recent Tasks</h3>
            <p className="mt-1 text-sm text-slate-500">
              Track your latest work and activities
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-500 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100">
              <Search size={15} />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tasks..."
                aria-label="Search tasks by task name or project"
                className="w-36 bg-transparent outline-none placeholder:text-slate-400 sm:w-44"
              />
            </label>
            <button
              type="button"
              onClick={onAddTask}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
            >
              <Plus size={16} />
              Add Task
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">Task</th>
                <th className="px-6 py-4 font-medium">Project</th>
                <th className="px-6 py-4 font-medium">Priority</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Deadline</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length ? (
                filteredTasks.map((task) => (
                  <tr key={task.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-800">{task.title}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {task.description || task.category}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {task.project || 'No project'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        task.priority === 'Urgent'
                          ? 'bg-rose-100 text-rose-700'
                          : task.priority === 'High'
                          ? 'bg-orange-100 text-orange-700'
                          : task.priority === 'Medium'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={task.status}
                        onChange={(event) => onUpdateTaskStatus(task.id, event.target.value)}
                        aria-label={`Change status for ${task.title}`}
                        className={`cursor-pointer appearance-none rounded-full border-0 px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-violet-300 ${statusColors[task.status]}`}
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {formatDueDate(task.dueDate)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEditTask(task)}
                          aria-label={`Edit ${task.title}`}
                          title="Edit task"
                          className="rounded-lg p-2 text-slate-500 hover:bg-violet-50 hover:text-violet-700"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteTask(task)}
                          aria-label={`Delete ${task.title}`}
                          title="Delete task"
                          className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-sm text-slate-500">
                    No tasks match &ldquo;{search}&rdquo;.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 p-4 text-center">
          <button className="text-sm font-medium text-violet-600 hover:text-violet-700">
            View all tasks
          </button>
        </div>
      </section>

    </main>
  )
}

export default function App() {
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [apiError, setApiError] = useState(null)   // error singkat untuk operasi CUD
  const [activePage, setActivePage] = useState('Dashboard')
  const [taskEditor, setTaskEditor] = useState(null)
  const [taskToDelete, setTaskToDelete] = useState(null)

  // ── Muat data awal dari API ──────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false

    Promise.all([fetchTasks(), fetchProjects()])
      .then(([taskList, projectList]) => {
        if (cancelled) return
        setTasks(taskList)
        setProjects(projectList)
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setLoadError(err.message || 'Gagal memuat data dari server.')
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  // Tampilkan error API singkat selama 4 detik, lalu hilang otomatis
  function showApiError(msg) {
    setApiError(msg)
    setTimeout(() => setApiError(null), 4000)
  }

  // ── Projects ─────────────────────────────────────────────────────────────────
  async function handleCreateProject(values) {
    try {
      const created = await apiCreateProject(values)
      setProjects((current) => [created, ...current])
    } catch (err) {
      showApiError(`Gagal membuat project: ${err.message}`)
    }
  }

  async function handleUpdateProject(projectId, values) {
    try {
      const updated = await apiUpdateProject(projectId, values)
      setProjects((current) =>
        current.map((p) => (p.id === projectId ? updated : p)),
      )
      // Perbarui nama project pada task yang terkait (dari response server)
      if (updated.name) {
        setTasks((current) =>
          current.map((task) =>
            task.projectId === projectId ? { ...task, project: updated.name } : task,
          ),
        )
      }
    } catch (err) {
      showApiError(`Gagal mengupdate project: ${err.message}`)
    }
  }

  async function handleDeleteProject(projectId) {
    try {
      await apiDeleteProject(projectId)
      setProjects((current) => current.filter((p) => p.id !== projectId))
      // Task terkait: kosongkan projectId & project (sesuai FK SET NULL di DB)
      setTasks((current) =>
        current.map((task) =>
          task.projectId === projectId
            ? { ...task, projectId: '', project: '' }
            : task,
        ),
      )
    } catch (err) {
      showApiError(`Gagal menghapus project: ${err.message}`)
    }
  }

  // ── Tasks ────────────────────────────────────────────────────────────────────

  /**
   * Update status task — optimistic update.
   * Jika API gagal, kembalikan ke status sebelumnya dan tampilkan error.
   */
  const handleUpdateTaskStatus = useCallback(async (taskId, newStatus) => {
    // Ambil status awal task secara sinkron sebelum optimistic update
    const prevStatus = tasks.find((task) => task.id === taskId)?.status
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task,
      ),
    )
    try {
      const updated = await updateTask(taskId, { status: newStatus })
      // Sinkronkan dengan response server (memastikan JOIN project name tetap benar)
      setTasks((current) =>
        current.map((task) => (task.id === taskId ? updated : task)),
      )
    } catch (err) {
      // Rollback hanya untuk task yang gagal, tanpa menimpa perubahan task lain
      if (prevStatus !== undefined) {
        setTasks((current) =>
          current.map((task) =>
            task.id === taskId ? { ...task, status: prevStatus } : task,
          ),
        )
      }
      showApiError(`Gagal mengubah status: ${err.message}`)
    }
  }, [tasks])

  async function saveTask(values) {
    const title = values.title?.trim() ?? ''
    if (!title) return

    if (taskEditor?.mode === 'edit' && taskEditor?.task) {
      // ── Edit task ──
      const taskId = taskEditor.task.id
      try {
        const updated = await updateTask(taskId, {
          title,
          projectId: values.projectId ?? '',
          priority:  values.priority,
          status:    values.status,
          dueDate:   values.dueDate ?? '',
          description: values.description ?? '',
        })
        // Response server sudah mengandung "project" dari JOIN
        setTasks((current) =>
          current.map((task) => (task.id === taskId ? updated : task)),
        )
      } catch (err) {
        showApiError(`Gagal menyimpan task: ${err.message}`)
        return
      }
    } else {
      // ── Tambah task baru ──
      try {
        const created = await createTask({
          title,
          projectId:   values.projectId ?? '',
          category:    'Task',
          priority:    values.priority ?? 'Medium',
          status:      values.status ?? 'To Do',
          dueDate:     values.dueDate ?? '',
          description: values.description ?? '',
        })
        // id berasal dari AUTO_INCREMENT backend (bukan dihitung frontend)
        setTasks((current) => [created, ...current])
      } catch (err) {
        showApiError(`Gagal membuat task: ${err.message}`)
        return
      }
    }
    setTaskEditor(null)
  }

  async function confirmDeleteTask() {
    if (!taskToDelete) return
    const taskId = taskToDelete.id
    try {
      await apiDeleteTask(taskId)
      setTasks((current) => current.filter((task) => task.id !== taskId))
      setTaskToDelete(null)
    } catch (err) {
      showApiError(`Gagal menghapus task: ${err.message}`)
      setTaskToDelete(null)
    }
  }

  function openTaskEditor(mode, task = null) {
    setTaskEditor({ mode, task })
  }

  // ── Loading / Error screen ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F6FA]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
          <p className="text-sm text-slate-500">Memuat data dari server…</p>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F6FA] p-6">
        <div className="w-full max-w-sm rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm">
          <AlertCircle size={40} className="mx-auto mb-4 text-rose-500" />
          <h2 className="mb-2 text-lg font-semibold text-slate-800">
            Server tidak dapat dihubungi
          </h2>
          <p className="mb-6 text-sm text-slate-500">{loadError}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    )
  }

  // ── Normal render ────────────────────────────────────────────────────────────
  const pageContent = {
    Dashboard: (
      <Dashboard
        tasks={tasks}
        onUpdateTaskStatus={handleUpdateTaskStatus}
        onAddTask={() => openTaskEditor('add')}
        onEditTask={(task) => openTaskEditor('edit', task)}
        onDeleteTask={setTaskToDelete}
      />
    ),
    'My Tasks': (
      <MyTasksPage
        tasks={tasks}
        onUpdateTaskStatus={handleUpdateTaskStatus}
        onEditTask={(task) => openTaskEditor('edit', task)}
        onDeleteTask={setTaskToDelete}
      />
    ),
    Kanban: (
      <KanbanPage
        tasks={tasks}
        onUpdateTaskStatus={handleUpdateTaskStatus}
      />
    ),
    Projects: (
      <ProjectsPage
        projects={projects}
        tasks={tasks}
        onCreateProject={handleCreateProject}
        onUpdateProject={handleUpdateProject}
        onDeleteProject={handleDeleteProject}
        onEditTask={(task) => openTaskEditor('edit', task)}
        onStatusChange={handleUpdateTaskStatus}
      />
    ),
    Team: <TeamPage />,
    History: (
      <HistoryPage
        tasks={tasks}
        onEditTask={(task) => openTaskEditor('edit', task)}
        onDeleteTask={setTaskToDelete}
      />
    ),
    Settings: <SettingsPage />,
  }[activePage]

  return (
    <div className="min-h-screen">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <div className="ml-20 lg:ml-64">
        {pageContent}
      </div>

      {/* Pesan error singkat untuk operasi CUD */}
      {apiError && (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-medium text-white shadow-lg">
          {apiError}
        </div>
      )}

      {taskEditor && (
        <TaskEditorModal
          key={`${taskEditor.mode}-${taskEditor.task?.id ?? 'new'}`}
          task={taskEditor.task}
          mode={taskEditor.mode}
          onClose={() => setTaskEditor(null)}
          onSave={saveTask}
          priorities={priorities}
          statuses={statuses}
          projects={projects}
        />
      )}
      {taskToDelete && (
        <DeleteTaskDialog
          task={taskToDelete}
          onCancel={() => setTaskToDelete(null)}
          onConfirm={confirmDeleteTask}
        />
      )}
    </div>
  )
}
