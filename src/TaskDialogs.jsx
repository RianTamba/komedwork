import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

function getLocalToday() {
  const date = new Date()
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 10)
}

export function TaskEditorModal({
  task,
  mode,
  onClose,
  onSave,
  priorities,
  statuses,
  projects = [],
}) {
  const [today] = useState(getLocalToday)
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submitLock = useRef(false)
  const [values, setValues] = useState(() => ({
    title: task?.title ?? '',
    description: task?.description ?? '',
    project: task?.project ?? '',
    projectId: task?.projectId ?? '',
    priority: task?.priority ?? 'Medium',
    status: task?.status ?? 'To Do',
    dueDate: task?.dueDate ?? '',
  }))

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
    setFormError('')
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (submitLock.current) return

    const title = values.title.trim()
    if (!title) {
      setFormError('Task title is required.')
      return
    }

    if (values.dueDate) {
      const parsedDate = new Date(`${values.dueDate}T00:00:00.000Z`)
      const isValidDate =
        Number.isFinite(parsedDate.getTime()) &&
        parsedDate.toISOString().slice(0, 10) === values.dueDate
      const isNewPastDeadline = values.dueDate < today && values.dueDate !== task?.dueDate

      if (!isValidDate || isNewPastDeadline) {
        setFormError(
          isValidDate
            ? 'Deadline must be today or later.'
            : 'Enter a valid deadline.',
        )
        return
      }
    }

    submitLock.current = true
    setIsSubmitting(true)
    const project = projects.find((item) => item.id === values.projectId)
    onSave({
      ...values,
      title,
      project: project?.name ?? '',
      projectId: project?.id ?? '',
      description: values.description.trim(),
    })
    onClose()
  }

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
        aria-labelledby="task-editor-title"
        className="my-auto w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h3 id="task-editor-title" className="text-lg font-semibold text-slate-800">
              {mode === 'edit' ? 'Edit task' : 'Add a task'}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {mode === 'edit' ? 'Update the task details.' : 'Add a task to your workspace.'}
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
                value={values.status}
                onChange={updateValue}
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
              Deadline
            </label>
            <input
              id="task-due-date"
              type="date"
              name="dueDate"
              value={values.dueDate}
              onChange={updateValue}
              min={task?.dueDate && task.dueDate < today ? task.dueDate : today}
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

          {formError && (
            <p role="alert" className="text-sm text-rose-600">{formError}</p>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Save changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export function DeleteTaskDialog({ task, onCancel, onConfirm }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onCancel()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel()
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-task-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <h3 id="delete-task-title" className="text-lg font-semibold text-slate-800">
          Delete task?
        </h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Are you sure you want to delete <strong className="text-slate-800">{task.title}</strong>?
          This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-rose-700"
          >
            Delete task
          </button>
        </div>
      </section>
    </div>
  )
}
