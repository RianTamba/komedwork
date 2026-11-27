import { useState } from 'react'
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  Search,
  X,
} from 'lucide-react'
import { formatDueDate, priorities, statusColors, statuses } from './taskData.js'

const columns = [
  { title: 'To Do', status: 'To Do', icon: Circle, iconColor: 'text-blue-600' },
  { title: 'In Progress', status: 'In Progress', icon: Clock3, iconColor: 'text-orange-600' },
  { title: 'Review', status: 'Review', icon: AlertCircle, iconColor: 'text-violet-600' },
  { title: 'Completed', status: 'Completed', icon: CheckCircle2, iconColor: 'text-emerald-600' },
]

const unassignedProject = '__unassigned__'

function priorityStyle(priority) {
  return {
    Urgent: 'bg-rose-100 text-rose-700',
    High: 'bg-orange-100 text-orange-700',
    Medium: 'bg-amber-100 text-amber-700',
    Low: 'bg-slate-100 text-slate-600',
  }[priority] ?? 'bg-slate-100 text-slate-600'
}

function getToday() {
  const today = new Date()
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset())
  return today.toISOString().slice(0, 10)
}

function TaskCard({ task, today, dragged, onStatusChange, onDragStart, onDragEnd }) {
  const overdue = task.status !== 'Completed' && task.dueDate && task.dueDate < today

  return (
    <article
      draggable
      onDragStart={(event) => onDragStart(event, task)}
      onDragEnd={onDragEnd}
      className={`cursor-grab rounded-xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing ${
        dragged ? 'border-violet-300 opacity-50' : 'border-slate-200'
      }`}
      aria-label={`Task: ${task.title}`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 flex-1 text-sm font-semibold leading-5 text-slate-800">
          {task.title}
        </h3>
        <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-medium ${priorityStyle(task.priority)}`}>
          {task.priority}
        </span>
      </div>

      <p className="mt-3 truncate text-xs text-slate-500">
        {task.project?.trim() || 'Unassigned'}
      </p>

      {task.description?.trim() && (
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
          {task.description}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <span className={`flex items-center gap-1.5 text-xs ${
          overdue ? 'font-medium text-rose-600' : 'text-slate-500'
        }`}>
          {overdue ? <AlertCircle size={14} /> : <CalendarDays size={14} />}
          {overdue ? 'Overdue · ' : ''}
          {task.dueDate ? formatDueDate(task.dueDate) : 'No deadline'}
        </span>
        <label className="sr-only" htmlFor={`kanban-status-${task.id}`}>
          Change status for {task.title}
        </label>
        <select
          id={`kanban-status-${task.id}`}
          value={task.status}
          onChange={(event) => onStatusChange(task.id, event.target.value)}
          className={`max-w-32 cursor-pointer appearance-none rounded-full border-0 px-2.5 py-1 text-[11px] font-medium focus:outline-none focus:ring-2 focus:ring-violet-300 ${statusColors[task.status]}`}
        >
          {statuses.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>
    </article>
  )
}

/**
 * KanbanPage menerima:
 * - tasks: array task (dari state App.jsx)
 * - onUpdateTaskStatus(taskId, newStatus): fungsi async dari App.jsx
 *   yang menangani optimistic update + rollback + API call.
 *
 * KanbanPage TIDAK memanggil API secara langsung.
 * Drag & drop dan quick status change semuanya lewat onUpdateTaskStatus.
 */
export default function KanbanPage({ tasks, onUpdateTaskStatus }) {
  const [search, setSearch] = useState('')
  const [projectFilter, setProjectFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [draggedTaskId, setDraggedTaskId] = useState(null)
  const [dragOverStatus, setDragOverStatus] = useState(null)
  const query = search.trim().toLocaleLowerCase()
  const today = getToday()
  const projectNames = [...new Set(
    tasks.map((task) => task.project?.trim()).filter(Boolean),
  )].sort((first, second) => first.localeCompare(second))
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = !query
      || task.title.toLocaleLowerCase().includes(query)
      || (task.description ?? '').toLocaleLowerCase().includes(query)
      || (task.project ?? '').toLocaleLowerCase().includes(query)
    const matchesProject = !projectFilter
      || (projectFilter === unassignedProject
        ? !task.project?.trim()
        : task.project?.trim() === projectFilter)
    const matchesPriority = !priorityFilter || task.priority === priorityFilter
    return matchesSearch && matchesProject && matchesPriority
  })
  const hasFilters = Boolean(search || projectFilter || priorityFilter)

  function handleDragStart(event, task) {
    const taskId = String(task.id)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', taskId)
    setDraggedTaskId(taskId)
  }

  function handleDrop(event, status) {
    event.preventDefault()
    const taskId = event.dataTransfer.getData('text/plain') || draggedTaskId
    const task = tasks.find((item) => String(item.id) === taskId)
    if (task && task.status !== status) {
      // Optimistic update + API call + rollback ditangani di App.jsx
      onUpdateTaskStatus(task.id, status)
    }
    setDraggedTaskId(null)
    setDragOverStatus(null)
  }

  function resetFilters() {
    setSearch('')
    setProjectFilter('')
    setPriorityFilter('')
  }

  return (
    <main className="min-h-screen bg-[#F5F6FA] p-5 sm:p-8">
      <header className="mb-6">
        <p className="text-sm text-slate-500">Workspace / Kanban</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-800">Kanban Board</h2>
        <p className="mt-1 text-sm text-slate-500">
          Organize tasks by status. Drag a card to move it, or use its status menu.
        </p>
      </header>

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_minmax(170px,220px)_minmax(150px,190px)]">
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-500 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100">
            <Search size={16} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title, description, or project..."
              aria-label="Search Kanban tasks"
              className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-400"
            />
          </label>
          <select
            value={projectFilter}
            onChange={(event) => setProjectFilter(event.target.value)}
            aria-label="Filter Kanban tasks by project"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          >
            <option value="">All projects</option>
            <option value={unassignedProject}>Unassigned</option>
            {projectNames.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
          <select
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
            aria-label="Filter Kanban tasks by priority"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          >
            <option value="">All priorities</option>
            {priorities.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
          </select>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-slate-500">
            Showing {filteredTasks.length} of {tasks.length} tasks
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-sm font-medium text-violet-700 hover:text-violet-800"
            >
              <X size={14} /> Clear filters
            </button>
          )}
        </div>
      </section>

      <section
        aria-label="Kanban board"
        className="overflow-x-auto pb-4"
      >
        <div className="grid min-w-[1160px] grid-cols-4 gap-4 2xl:min-w-0">
          {columns.map(({ title, status, icon: Icon, iconColor }) => {
            const columnTasks = filteredTasks.filter((task) => task.status === status)
            const isDropTarget = dragOverStatus === status
            return (
              <section
                key={status}
                aria-label={`${title} tasks`}
                onDragOver={(event) => {
                  event.preventDefault()
                  event.dataTransfer.dropEffect = 'move'
                  setDragOverStatus(status)
                }}
                onDragLeave={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) {
                    setDragOverStatus(null)
                  }
                }}
                onDrop={(event) => handleDrop(event, status)}
                className={`flex min-h-[480px] flex-col rounded-2xl border p-3 transition-colors ${
                  isDropTarget
                    ? 'border-violet-300 bg-violet-50/80'
                    : 'border-slate-200 bg-slate-100/70'
                }`}
              >
                <header className="mb-3 flex items-center justify-between px-1 py-1">
                  <div className="flex items-center gap-2">
                    <Icon size={17} className={iconColor} />
                    <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-500">
                      {columnTasks.length}
                    </span>
                  </div>
                </header>

                <div className="flex flex-1 flex-col gap-3">
                  {columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      today={today}
                      dragged={draggedTaskId === String(task.id)}
                      onStatusChange={onUpdateTaskStatus}
                      onDragStart={handleDragStart}
                      onDragEnd={() => {
                        setDraggedTaskId(null)
                        setDragOverStatus(null)
                      }}
                    />
                  ))}
                  {columnTasks.length === 0 && (
                    <div className={`flex min-h-32 flex-1 items-center justify-center rounded-xl border border-dashed p-4 text-center text-sm ${
                      isDropTarget
                        ? 'border-violet-300 bg-violet-100/60 text-violet-700'
                        : 'border-slate-300 text-slate-400'
                    }`}>
                      {tasks.length === 0
                        ? 'No tasks yet.'
                        : filteredTasks.length === 0
                        ? 'No tasks match these filters.'
                        : `No ${title.toLowerCase()} tasks.`}
                    </div>
                  )}
                  {columnTasks.length > 0 && (
                    <div className={`min-h-10 rounded-xl border border-dashed transition-colors ${
                      isDropTarget ? 'border-violet-300 bg-violet-100/60' : 'border-transparent'
                    }`} aria-hidden="true" />
                  )}
                </div>
              </section>
            )
          })}
        </div>
      </section>
    </main>
  )
}
