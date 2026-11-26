
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  ListTodo,
  FolderKanban,
  Users,
  History,
  Settings,
  Search,
  Bell,
  Plus,
  ChevronDown,
  CalendarDays,
  CircleCheck,
  Clock3,
  AlertCircle,
  MoreHorizontal,
  ArrowUpRight,
  BriefcaseBusiness,
  X,
} from 'lucide-react'
import {
  HistoryPage,
  MyTasksPage,
  ProjectsPage,
  SettingsPage,
  TeamPage,
} from './WorkspacePages.jsx'
import {
  formatDueDate,
  loadTasks,
  priorities,
  saveTasks,
  statuses,
  statusColors,
} from './taskData.js'

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'My Tasks', icon: ListTodo },
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

function Dashboard({ tasks, setTasks }) {
  const [search, setSearch] = useState('')
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [formError, setFormError] = useState('')
  const [formValues, setFormValues] = useState({
    title: '',
    project: '',
    priority: 'Medium',
    status: 'To Do',
    dueDate: '',
    description: '',
  })

  const [today] = useState(() => {
    const localToday = new Date()
    localToday.setMinutes(localToday.getMinutes() - localToday.getTimezoneOffset())
    return localToday.toISOString().slice(0, 10)
  })
  const completedTasks = tasks.filter((task) => task.status === 'Completed').length
  const inProgressTasks = tasks.filter((task) => task.status === 'In Progress').length
  const toDoTasks = tasks.filter((task) => task.status === 'To Do').length
  const inReviewTasks = tasks.filter((task) => task.status === 'In Review').length
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

  useEffect(() => {
    if (!isAddTaskOpen) return undefined

    function handleKeyDown(event) {
      if (event.key === 'Escape') setIsAddTaskOpen(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAddTaskOpen])

  function updateFormValue(event) {
    const { name, value } = event.target
    setFormValues((current) => ({ ...current, [name]: value }))
    if (name === 'title' && value.trim()) setFormError('')
  }

  function handleAddTask(event) {
    event.preventDefault()
    const title = formValues.title.trim()

    if (!title) {
      setFormError('Task title is required.')
      return
    }

    setTasks((current) => {
      const nextId = current.reduce((maxId, task) => Math.max(maxId, task.id), 0) + 1
      return [
        {
          ...formValues,
          id: nextId,
          title,
          project: formValues.project.trim(),
          category: 'Task',
        },
        ...current,
      ]
    })
    setFormValues({
      title: '',
      project: '',
      priority: 'Medium',
      status: 'To Do',
      dueDate: '',
      description: '',
    })
    setFormError('')
    setIsAddTaskOpen(false)
  }

  return (
    <main className="min-h-screen bg-[#F5F6FA] p-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Workspace / Overview</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-800">
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Welcome back! Here's what's happening with your work.
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
              <span className="text-slate-500">In Review</span>
              <span className="font-medium text-slate-700">{inReviewTasks}</span>
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
              onClick={() => setIsAddTaskOpen(true)}
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
                <th className="px-6 py-4"></th>
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
                        onChange={(event) => {
                          const status = event.target.value
                          setTasks((current) =>
                            current.map((item) =>
                              item.id === task.id ? { ...item, status } : item,
                            ),
                          )
                        }}
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
                    <td className="px-6 py-4 text-slate-400">
                      <button
                        type="button"
                        aria-label={`More options for ${task.title}`}
                        className="rounded-lg p-1 hover:bg-slate-100"
                      >
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-sm text-slate-500">
                    No tasks match “{search}”.
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

      {isAddTaskOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsAddTaskOpen(false)
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-task-title"
            className="my-auto w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h3 id="add-task-title" className="text-lg font-semibold text-slate-800">
                  Add a task
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Add a task to your workspace.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddTaskOpen(false)}
                aria-label="Close add task form"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label htmlFor="task-title" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Task title <span className="text-rose-600">*</span>
                </label>
                <input
                  id="task-title"
                  name="title"
                  value={formValues.title}
                  onChange={updateFormValue}
                  required
                  maxLength={120}
                  placeholder="What needs to be done?"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
                {formError && <p className="mt-1 text-sm text-rose-600">{formError}</p>}
              </div>

              <div>
                <label htmlFor="task-project" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Project
                </label>
                <input
                  id="task-project"
                  name="project"
                  value={formValues.project}
                  onChange={updateFormValue}
                  maxLength={100}
                  placeholder="Project name"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="task-priority" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Priority
                  </label>
                  <select
                    id="task-priority"
                    name="priority"
                    value={formValues.priority}
                    onChange={updateFormValue}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  >
                    {priorities.map((priority) => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="task-status" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Status
                  </label>
                  <select
                    id="task-status"
                    name="status"
                    value={formValues.status}
                    onChange={updateFormValue}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="task-due-date" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Due date
                </label>
                <input
                  id="task-due-date"
                  type="date"
                  name="dueDate"
                  value={formValues.dueDate}
                  onChange={updateFormValue}
                  min={today}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>

              <div>
                <label htmlFor="task-description" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Description <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <textarea
                  id="task-description"
                  name="description"
                  value={formValues.description}
                  onChange={updateFormValue}
                  maxLength={500}
                  rows={3}
                  placeholder="Add more details about this task"
                  className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddTaskOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-700"
                >
                  Add Task
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}

export default function App() {
  const [tasks, setTasks] = useState(loadTasks)
  const [activePage, setActivePage] = useState('Dashboard')

  useEffect(() => {
    saveTasks(tasks)
  }, [tasks])

  const pageContent = {
    Dashboard: <Dashboard tasks={tasks} setTasks={setTasks} />,
    'My Tasks': <MyTasksPage tasks={tasks} setTasks={setTasks} />,
    Projects: <ProjectsPage tasks={tasks} />,
    Team: <TeamPage />,
    History: <HistoryPage tasks={tasks} />,
    Settings: <SettingsPage />,
  }[activePage]

  return (
    <div className="min-h-screen">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <div className="ml-20 lg:ml-64">
        {pageContent}
      </div>
    </div>
  )
}