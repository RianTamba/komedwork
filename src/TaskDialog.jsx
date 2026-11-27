import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { priorities, statuses } from './taskData.js'

function getToday() {
  const today = new Date()
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset())
  return today.toISOString().slice(0, 10)
}

function isValidDate(value) {
  if (!value) return true
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false

  const parsedDate = new Date(`${value}T00:00:00.000Z`)
  return Number.isFinite(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === value
}

export default function TaskDialog({ task, projects, onClose, onSubmit }) {
  const [values, setValues] = useState(() => ({
    title: task?.title ?? '',
    description: task?.description ?? '',
    projectId: task?.projectId ?? '',
    priority: task?.priority ?? 'Medium',
    status: task?.status ?? 'To Do',
    dueDate: task?.dueDate ?? '',
  }))
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function updateValue(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setError('')
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (isSubmitting) return

    const title = values.title.trim()
    if (!title) {
      setError('Task title is required.')
      return
    }
    if (!isValidDate(values.dueDate)) {
      setError('Enter a valid due date.')
      return
    }

    const project = projects.find((item) => item.id === values.projectId)
    setIsSubmitting(true)
    try {
      onSubmit({
        ...values,
        title,
        projectId: project?.id ?? '',
        project: project?.name ?? '',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const today = getToday()
  const titleId = task ? 'edit-task-title' : 'add-task-title'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="my-auto w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h3 id={titleId} className="text-lg font-semibold text-slate-800">
              {task ? 'Edit task' : 'Add a task'}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {task ? 'Update the task details.' : 'Add a task to your workspace.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close task form"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="task-title" className="mb-1.5 block text-sm font-medium text-slate-700">
              Task title <span className="text-rose-600">*</span>
            </label>
            <input
              id="task-title"
              name="title"
              value={values.title}
              onChange={updateValue}
              required
              maxLength={120}
              placeholder="What needs to be done?"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <div>
            <label htmlFor="task-project" className="mb-1.5 block text-sm font-medium text-slate-700">
              Project
            </label>
            <select
              id="task-project"
              name="projectId"
              value={values.projectId}
              onChange={updateValue}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            >
              <option value="">No project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="task-priority" className="mb-1.5 block text-sm font-medium text-slate-700">
                Priority
              </label>
              <select
                id="task-priority"
                name="priority"
                value={values.priority}
                onChange={updateValue}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              >
                {priorities.map((priority) => <option key={priority}>{priority}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="task-status" className="mb-1.5 block text-sm font-medium text-slate-700">
                Status
              </label>
              <select
                id="task-status"
                name="status"
                value={values.status}
                onChange={updateValue}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              >
                {statuses.map((status) => <option key={status}>{status}</option>)}
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
              value={values.dueDate}
              onChange={updateValue}
              min={task ? undefined : today}
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
              value={values.description}
              onChange={updateValue}
              maxLength={500}
              rows={3}
              placeholder="Add more details about this task"
              className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Saving...' : task ? 'Save changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
