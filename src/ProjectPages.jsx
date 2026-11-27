import { useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CalendarDays,
  CircleCheck,
  Clock3,
  FolderKanban,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { formatDueDate, statuses, statusColors } from './taskData.js'
import { projectPriorities, projectStatuses } from './projectData.js'

function PageHeader({ title, description, children }) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm text-slate-500">Workspace / Projects</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-800">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {children}
    </header>
  )
}

function projectStatusColor(status) {
  return {
    Planning: 'bg-blue-100 text-blue-700',
    Active: 'bg-emerald-100 text-emerald-700',
    'On Hold': 'bg-amber-100 text-amber-700',
    Completed: 'bg-slate-100 text-slate-600',
  }[status] ?? 'bg-slate-100 text-slate-600'
}

function priorityColor(priority) {
  return {
    Urgent: 'bg-rose-100 text-rose-700',
    High: 'bg-orange-100 text-orange-700',
    Medium: 'bg-amber-100 text-amber-700',
    Low: 'bg-slate-100 text-slate-600',
  }[priority] ?? 'bg-slate-100 text-slate-600'
}

function ProjectForm({ project, projects, onClose, onSubmit }) {
  const [values, setValues] = useState(() => ({
    name: project?.name ?? '',
    client: project?.client ?? '',
    description: project?.description ?? '',
    status: project?.status ?? 'Planning',
    priority: project?.priority ?? 'Medium',
    startDate: project?.startDate ?? '',
    deadline: project?.deadline ?? '',
  }))
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateValue(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setError('')
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (isSubmitting) return

    const name = values.name.trim()
    if (!name) {
      setError('Project name is required.')
      return
    }

    const duplicate = projects.some((item) =>
      item.id !== project?.id && item.name.trim().toLocaleLowerCase() === name.toLocaleLowerCase(),
    )
    if (duplicate) {
      setError('A project with this name already exists.')
      return
    }
    if (
      (values.startDate && !isValidDate(values.startDate)) ||
      (values.deadline && !isValidDate(values.deadline))
    ) {
      setError('Enter valid project dates.')
      return
    }
    if (values.startDate && values.deadline && values.deadline < values.startDate) {
      setError('The deadline cannot be earlier than the start date.')
      return
    }

    setIsSubmitting(true)
    try {
      onSubmit({ ...values, name })
    } finally {
      setIsSubmitting(false)
    }
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
        aria-labelledby="project-form-title"
        className="my-auto w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h3 id="project-form-title" className="text-lg font-semibold text-slate-800">
              {project ? 'Edit project' : 'Create project'}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {project ? 'Update project details and dates.' : 'Add a project to your workspace.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close project form"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="project-name" className="mb-1.5 block text-sm font-medium text-slate-700">
              Project name <span className="text-rose-600">*</span>
            </label>
            <input
              id="project-name"
              name="name"
              value={values.name}
              onChange={updateValue}
              required
              maxLength={120}
              autoFocus
              placeholder="Project name"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>
          <div>
            <label htmlFor="project-client" className="mb-1.5 block text-sm font-medium text-slate-700">
              Client
            </label>
            <input
              id="project-client"
              name="client"
              value={values.client}
              onChange={updateValue}
              maxLength={120}
              placeholder="Client or organization"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>
          <div>
            <label htmlFor="project-description" className="mb-1.5 block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              id="project-description"
              name="description"
              value={values.description}
              onChange={updateValue}
              rows={3}
              maxLength={1000}
              placeholder="What is this project about?"
              className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="project-status" className="mb-1.5 block text-sm font-medium text-slate-700">
                Status
              </label>
              <select
                id="project-status"
                name="status"
                value={values.status}
                onChange={updateValue}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              >
                {projectStatuses.map((status) => <option key={status}>{status}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="project-priority" className="mb-1.5 block text-sm font-medium text-slate-700">
                Priority
              </label>
              <select
                id="project-priority"
                name="priority"
                value={values.priority}
                onChange={updateValue}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              >
                {projectPriorities.map((priority) => <option key={priority}>{priority}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="project-start-date" className="mb-1.5 block text-sm font-medium text-slate-700">
                Start date
              </label>
              <input
                id="project-start-date"
                type="date"
                name="startDate"
                value={values.startDate}
                onChange={updateValue}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />
            </div>
            <div>
              <label htmlFor="project-deadline" className="mb-1.5 block text-sm font-medium text-slate-700">
                Deadline
              </label>
              <input
                id="project-deadline"
                type="date"
                name="deadline"
                value={values.deadline}
                onChange={updateValue}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />
            </div>
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
              {isSubmitting ? 'Saving...' : project ? 'Save changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsedDate = new Date(`${value}T00:00:00.000Z`)
  return Number.isFinite(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === value
}

function ProjectDetail({ project, tasks, onBack, onEdit, onDelete, onEditTask, onStatusChange }) {
  const today = getToday()
  const projectTasks = tasks.filter((task) => task.projectId === project.id)
  const completed = projectTasks.filter((task) => task.status === 'Completed').length
  const inProgress = projectTasks.filter((task) => task.status === 'In Progress').length
  const overdue = projectTasks.filter(
    (task) => task.dueDate && task.dueDate < today && task.status !== 'Completed',
  ).length
  const progress = projectTasks.length ? Math.round((completed / projectTasks.length) * 100) : 0

  return (
    <>
      <PageHeader
        title={project.name}
        description="Project overview and its linked tasks."
      >
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft size={16} /> All projects
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <Pencil size={15} /> Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
          >
            <Trash2 size={15} /> Delete
          </button>
        </div>
      </PageHeader>

      <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total tasks" value={projectTasks.length} icon={FolderKanban} />
        <MetricCard title="Completed" value={completed} icon={CircleCheck} />
        <MetricCard title="In progress" value={inProgress} icon={Clock3} />
        <MetricCard title="Overdue" value={overdue} icon={AlertCircle} />
      </section>

      <section className="mb-6 grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 xl:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-slate-800">{project.name}</h3>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${projectStatusColor(project.status)}`}>
                  {project.status}
                </span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${priorityColor(project.priority)}`}>
                  {project.priority}
                </span>
              </div>
              <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                <Building2 size={15} /> {project.client || 'No client specified'}
              </p>
            </div>
          </div>
          <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-slate-600">
            {project.description || 'No project description provided.'}
          </p>
          <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
            <DetailDate label="Start date" value={project.startDate} />
            <DetailDate label="Deadline" value={project.deadline} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Task progress</h3>
            <span className="text-sm font-semibold text-violet-700">{progress}%</span>
          </div>
          <div
            role="progressbar"
            aria-label={`${project.name} completion`}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={progress}
            className="mt-4 h-2.5 overflow-hidden rounded-full bg-violet-100"
          >
            <div className="h-full rounded-full bg-violet-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-3 text-sm text-slate-500">
            {completed} completed of {projectTasks.length} {projectTasks.length === 1 ? 'task' : 'tasks'}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-6">
          <h3 className="font-semibold text-slate-800">Project tasks</h3>
          <p className="mt-1 text-sm text-slate-500">Manage task status or open a task to edit its details.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">Task</th>
                <th className="px-6 py-4 font-medium">Priority</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Deadline</th>
                <th className="px-6 py-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {projectTasks.length ? projectTasks.map((task) => (
                <tr key={task.id} className="border-t border-slate-100">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-800">{task.title}</p>
                    {task.description && (
                      <p className="mt-1 max-w-sm truncate text-xs text-slate-400">{task.description}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${priorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={task.status}
                      onChange={(event) => onStatusChange(task.id, event.target.value)}
                      aria-label={`Change status for ${task.title}`}
                      className={`cursor-pointer appearance-none rounded-full border-0 px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-violet-300 ${statusColors[task.status]}`}
                    >
                      {statuses.map((status) => <option key={status}>{status}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{formatDueDate(task.dueDate)}</td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => onEditTask(task)}
                      className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-violet-700 hover:bg-violet-50"
                    >
                      Edit task
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-sm text-slate-500">
                    No tasks are linked to this project yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

function MetricCard({ title, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{title}</p>
        <div className="rounded-xl bg-violet-50 p-2.5 text-violet-600"><Icon size={19} /></div>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-800">{value}</p>
    </div>
  )
}

function DetailDate({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-700">
        <CalendarDays size={15} className="text-slate-400" />
        {value ? formatDueDate(value) : 'Not set'}
      </p>
    </div>
  )
}

function getToday() {
  const today = new Date()
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset())
  return today.toISOString().slice(0, 10)
}

export function ProjectsPage({
  projects,
  tasks,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
  onEditTask,
  onStatusChange,
}) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [priorityFilter, setPriorityFilter] = useState('All priorities')
  const [deadlineFilter, setDeadlineFilter] = useState('Any deadline')
  const [editingProject, setEditingProject] = useState(undefined)
  const [deletingProject, setDeletingProject] = useState(null)
  const [selectedProjectId, setSelectedProjectId] = useState(null)
  const [deleteError, setDeleteError] = useState('')

  const selectedProject = projects.find((project) => project.id === selectedProjectId)
  const query = search.trim().toLocaleLowerCase()
  const today = getToday()
  const nextWeek = new Date(`${today}T00:00:00`)
  nextWeek.setDate(nextWeek.getDate() + 7)
  const nextWeekDate = `${nextWeek.getFullYear()}-${String(nextWeek.getMonth() + 1).padStart(2, '0')}-${String(nextWeek.getDate()).padStart(2, '0')}`

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLocaleLowerCase().includes(query)
      || project.client.toLocaleLowerCase().includes(query)
    const matchesStatus = statusFilter === 'All statuses' || project.status === statusFilter
    const matchesPriority = priorityFilter === 'All priorities' || project.priority === priorityFilter
    const matchesDeadline = deadlineFilter === 'Any deadline'
      || (deadlineFilter === 'Overdue' && project.deadline && project.deadline < today && project.status !== 'Completed')
      || (deadlineFilter === 'Due in 7 days' && project.deadline >= today && project.deadline <= nextWeekDate)
      || (deadlineFilter === 'No deadline' && !project.deadline)
    return matchesSearch && matchesStatus && matchesPriority && matchesDeadline
  })

  function openCreateForm() {
    setEditingProject(null)
  }

  function closeForm() {
    setEditingProject(undefined)
  }

  function handleFormSubmit(values) {
    if (editingProject) onUpdateProject(editingProject.id, values)
    else onCreateProject(values)
    closeForm()
  }

  function confirmDelete() {
    if (!deletingProject) return
    try {
      onDeleteProject(deletingProject.id)
      setDeletingProject(null)
      setDeleteError('')
      if (selectedProjectId === deletingProject.id) setSelectedProjectId(null)
    } catch (error) {
      setDeleteError(error.message || 'Unable to delete this project.')
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F6FA] p-5 sm:p-8">
      {selectedProject ? (
        <ProjectDetail
          project={selectedProject}
          tasks={tasks}
          onBack={() => setSelectedProjectId(null)}
          onEdit={() => setEditingProject(selectedProject)}
          onDelete={() => {
            setDeleteError('')
            setDeletingProject(selectedProject)
          }}
          onEditTask={onEditTask}
          onStatusChange={onStatusChange}
        />
      ) : (
        <>
          <PageHeader
            title="Projects"
            description="Plan, track, and manage projects independently from their tasks."
          >
            <button
              type="button"
              onClick={openCreateForm}
              className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-700"
            >
              <Plus size={16} /> Create Project
            </button>
          </PageHeader>

          <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-500 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100">
                <Search size={15} />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search project or client..."
                  aria-label="Search projects by name or client"
                  className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-400"
                />
              </label>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filter projects by status"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              >
                <option>All statuses</option>
                {projectStatuses.map((status) => <option key={status}>{status}</option>)}
              </select>
              <select
                value={priorityFilter}
                onChange={(event) => setPriorityFilter(event.target.value)}
                aria-label="Filter projects by priority"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              >
                <option>All priorities</option>
                {projectPriorities.map((priority) => <option key={priority}>{priority}</option>)}
              </select>
              <select
                value={deadlineFilter}
                onChange={(event) => setDeadlineFilter(event.target.value)}
                aria-label="Filter projects by deadline"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              >
                <option>Any deadline</option>
                <option>Overdue</option>
                <option>Due in 7 days</option>
                <option>No deadline</option>
              </select>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-slate-500">
                Showing {filteredProjects.length} of {projects.length} projects
              </p>
              {(search || statusFilter !== 'All statuses' || priorityFilter !== 'All priorities' || deadlineFilter !== 'Any deadline') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    setStatusFilter('All statuses')
                    setPriorityFilter('All priorities')
                    setDeadlineFilter('Any deadline')
                  }}
                  className="text-sm font-medium text-violet-700 hover:text-violet-800"
                >
                  Reset filters
                </button>
              )}
            </div>
          </section>

          {filteredProjects.length ? (
            <section className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {filteredProjects.map((project) => {
                const projectTasks = tasks.filter((task) => task.projectId === project.id)
                const completedCount = projectTasks.filter((task) => task.status === 'Completed').length
                const progress = projectTasks.length
                  ? Math.round((completedCount / projectTasks.length) * 100)
                  : 0
                return (
                  <article key={project.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="shrink-0 rounded-xl bg-violet-50 p-2.5 text-violet-600">
                          <FolderKanban size={20} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate font-semibold text-slate-800">{project.name}</h3>
                          <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-slate-500">
                            <Building2 size={13} /> {project.client || 'No client'}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingProject(project)}
                          aria-label={`Edit ${project.name}`}
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-violet-700"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteError('')
                            setDeletingProject(project)
                          }}
                          aria-label={`Delete ${project.name}`}
                          className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${projectStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${priorityColor(project.priority)}`}>
                        {project.priority}
                      </span>
                    </div>

                    <div className="mt-5 flex items-center justify-between text-sm">
                      <span className="text-slate-500">Task progress</span>
                      <span className="font-medium text-slate-700">{completedCount}/{projectTasks.length} · {progress}%</span>
                    </div>
                    <div
                      role="progressbar"
                      aria-label={`${project.name} completion`}
                      aria-valuemin="0"
                      aria-valuemax="100"
                      aria-valuenow={progress}
                      className="mt-2 h-2 overflow-hidden rounded-full bg-violet-100"
                    >
                      <div className="h-full rounded-full bg-violet-600 transition-all" style={{ width: `${progress}%` }} />
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays size={14} /> Deadline: {project.deadline ? formatDueDate(project.deadline) : 'Not set'}
                      </span>
                      <span>{projectTasks.length} {projectTasks.length === 1 ? 'task' : 'tasks'}</span>
                    </div>

                    <div className="mt-5 border-t border-slate-100 pt-4">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Task preview</p>
                      {projectTasks.length ? (
                        <ul className="space-y-2">
                          {projectTasks.slice(0, 2).map((task) => (
                            <li key={task.id} className="flex items-center justify-between gap-3">
                              <span className="truncate text-sm text-slate-700">{task.title}</span>
                              <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-medium ${statusColors[task.status]}`}>
                                {task.status}
                              </span>
                            </li>
                          ))}
                          {projectTasks.length > 2 && (
                            <li className="text-xs text-slate-400">And {projectTasks.length - 2} more</li>
                          )}
                        </ul>
                      ) : (
                        <p className="text-sm text-slate-400">No tasks assigned yet.</p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedProjectId(project.id)}
                      className="mt-5 w-full rounded-xl border border-violet-200 px-3 py-2.5 text-sm font-medium text-violet-700 transition hover:bg-violet-50"
                    >
                      View Details
                    </button>
                  </article>
                )
              })}
            </section>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
              <FolderKanban className="mx-auto text-slate-300" size={34} />
              <h3 className="mt-4 font-semibold text-slate-800">
                {projects.length ? 'No projects match these filters' : 'No projects yet'}
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                {projects.length
                  ? 'Try another search or reset your filters.'
                  : 'Create a project to organize tasks, clients, and deadlines.'}
              </p>
              {!projects.length && (
                <button
                  type="button"
                  onClick={openCreateForm}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-700"
                >
                  <Plus size={16} /> Create Project
                </button>
              )}
            </div>
          )}
        </>
      )}

      {editingProject !== undefined && (
        <ProjectForm
          key={editingProject?.id ?? 'new'}
          project={editingProject}
          projects={projects}
          onClose={closeForm}
          onSubmit={handleFormSubmit}
        />
      )}

      {deletingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-project-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-rose-50 p-2.5 text-rose-600">
                <Trash2 size={19} />
              </div>
              <div>
                <h3 id="delete-project-title" className="font-semibold text-slate-800">Delete project?</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Delete <span className="font-semibold">{deletingProject.name}</span>?
                  {' '}{tasks.filter((task) => task.projectId === deletingProject.id).length
                    ? 'Its tasks will be kept and changed to “No project”.'
                    : 'This project has no linked tasks.'}
                </p>
                {deleteError && <p role="alert" className="mt-3 text-sm text-rose-600">{deleteError}</p>}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingProject(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-rose-700"
              >
                Delete project
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
