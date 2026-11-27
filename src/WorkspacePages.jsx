import { useState } from 'react'
import {
  CircleCheck,
  Pencil,
  Search,
  Users,
} from 'lucide-react'
import { formatDueDate, statuses, statusColors } from './taskData.js'
export { ProjectsPage } from './ProjectPages.jsx'

function PageHeader({ title, description }) {
  return (
    <header className="mb-8">
      <p className="text-sm text-slate-500">Workspace / {title}</p>
      <h2 className="mt-1 text-2xl font-bold text-slate-800">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </header>
  )
}

function TaskTable({ tasks, onStatusChange, onEditTask, emptyMessage }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] text-left">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th className="px-6 py-4 font-medium">Task</th>
            <th className="px-6 py-4 font-medium">Project</th>
            <th className="px-6 py-4 font-medium">Priority</th>
            <th className="px-6 py-4 font-medium">Status</th>
            <th className="px-6 py-4 font-medium">Due date</th>
            {onEditTask && <th className="px-6 py-4 font-medium">Action</th>}
          </tr>
        </thead>
        <tbody>
          {tasks.length ? tasks.map((task) => (
            <tr key={task.id} className="border-t border-slate-100 hover:bg-slate-50">
              <td className="px-6 py-4">
                <p className="text-sm font-medium text-slate-800">{task.title}</p>
                {task.description && (
                  <p className="mt-1 max-w-sm truncate text-xs text-slate-400">
                    {task.description}
                  </p>
                )}
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
                {onStatusChange ? (
                  <select
                    value={task.status}
                    onChange={(event) => onStatusChange(task.id, event.target.value)}
                    aria-label={`Change status for ${task.title}`}
                    className={`cursor-pointer appearance-none rounded-full border-0 px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-violet-300 ${statusColors[task.status]}`}
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                ) : (
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[task.status]}`}>
                    {task.status}
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-slate-500">
                {formatDueDate(task.dueDate)}
              </td>
              {onEditTask && (
                <td className="px-6 py-4">
                  <button
                    type="button"
                    onClick={() => onEditTask(task)}
                    aria-label={`Edit ${task.title}`}
                    className="rounded-lg p-2 text-slate-500 hover:bg-violet-50 hover:text-violet-700"
                  >
                    <Pencil size={16} />
                  </button>
                </td>
              )}
            </tr>
          )) : (
            <tr>
              <td colSpan={onEditTask ? 6 : 5} className="px-6 py-10 text-center text-sm text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function updateTaskStatus(setTasks, taskId, status) {
  setTasks((current) =>
    current.map((task) => task.id === taskId ? { ...task, status } : task),
  )
}

export function MyTasksPage({ tasks, setTasks, onEditTask }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const query = search.trim().toLowerCase()
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(query) ||
      task.project.toLowerCase().includes(query)
    const matchesStatus = statusFilter === 'All statuses' || task.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <main className="min-h-screen bg-[#F5F6FA] p-5 sm:p-8">
      <PageHeader
        title="My Tasks"
        description="Manage your tasks, deadlines, and current progress."
      />

      <section className="rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-slate-800">All tasks</h3>
            <p className="mt-1 text-sm text-slate-500">
              Showing {filteredTasks.length} of {tasks.length} tasks
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
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
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter tasks by status"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            >
              <option>All statuses</option>
              {statuses.map((status) => <option key={status}>{status}</option>)}
            </select>
          </div>
        </div>
        <TaskTable
          tasks={filteredTasks}
          onStatusChange={(taskId, status) => updateTaskStatus(setTasks, taskId, status)}
          onEditTask={onEditTask}
          emptyMessage="No tasks match your search or status filter."
        />
      </section>
    </main>
  )
}

export function TeamPage() {
  return (
    <main className="min-h-screen bg-[#F5F6FA] p-5 sm:p-8">
      <PageHeader
        title="Team"
        description="Team information for the Komedwork workspace."
      />
      <section className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-10">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
            <Users size={26} />
          </div>
          <h3 className="mt-5 text-lg font-semibold text-slate-800">
            Team management is coming later
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Member management is not available yet. This page will be expanded
            when Komedwork has a team directory; no member records are being
            simulated here.
          </p>
        </div>
      </section>
    </main>
  )
}

export function HistoryPage({ tasks }) {
  const completedTasks = tasks.filter((task) => task.status === 'Completed')

  return (
    <main className="min-h-screen bg-[#F5F6FA] p-5 sm:p-8">
      <PageHeader
        title="History"
        description="Tasks currently marked as completed."
      />
      <section className="rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
              <CircleCheck size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Completed tasks</h3>
              <p className="mt-1 text-sm text-slate-500">
                {completedTasks.length} {completedTasks.length === 1 ? 'task' : 'tasks'}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            Completion timestamps are not recorded, so this history does not show completion dates.
          </p>
        </div>
        <TaskTable
          tasks={completedTasks}
          emptyMessage="Completed tasks will appear here."
        />
      </section>
    </main>
  )
}

export function SettingsPage() {
  return (
    <main className="min-h-screen bg-[#F5F6FA] p-5 sm:p-8">
      <PageHeader
        title="Settings"
        description="Basic information about your local Komedwork workspace."
      />
      <section className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-500 text-lg font-semibold text-white">
            R
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Rian Tamba</h3>
            <p className="mt-1 text-sm text-slate-500">Multimedia Team</p>
          </div>
        </div>
        <div className="grid gap-5 pt-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Workspace
            </p>
            <p className="mt-2 text-sm font-medium text-slate-700">Kotakmedia Workspace</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Interface
            </p>
            <p className="mt-2 text-sm font-medium text-slate-700">Light theme · Violet accent</p>
          </div>
        </div>
        <p className="mt-7 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-500">
          Profile and appearance settings are currently local display information.
          Account management and saved preferences are not connected in this version.
        </p>
      </section>
    </main>
  )
}
