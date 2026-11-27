export const initialTasks = [
  {
    id: 1,
    title: 'Editing video promo menu terbaru',
    project: 'Skala Pizza',
    category: 'Video Editing',
    priority: 'High',
    status: 'In Progress',
    dueDate: '2026-11-28',
    description: '',
  },
  {
    id: 2,
    title: 'Revisi footage video promosi',
    project: 'Damai Putra Yogyakarta',
    category: 'Multimedia',
    priority: 'Medium',
    status: 'To Do',
    dueDate: '2026-11-29',
    description: '',
  },
  {
    id: 3,
    title: 'Finalisasi konten sosial media',
    project: 'Skala Pizza',
    category: 'Content',
    priority: 'Urgent',
    status: 'In Review',
    dueDate: '2026-11-27',
    description: '',
  },
  {
    id: 4,
    title: 'Export dan upload video',
    project: 'Internal Kotakmedia',
    category: 'Video Editing',
    priority: 'Low',
    status: 'Completed',
    dueDate: '2026-11-26',
    description: '',
  },
]

export const statuses = ['To Do', 'In Progress', 'Review', 'Completed']
export const priorities = ['Low', 'Medium', 'High', 'Urgent']
export const tasksStorageKey = 'komedwork_tasks'

export const statusColors = {
  'To Do': 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-orange-100 text-orange-700',
  Review: 'bg-purple-100 text-purple-700',
  Completed: 'bg-green-100 text-green-700',
}

const legacyStatuses = ['In Review']

function normalizeLegacyStatus(task) {
  return task.status === 'In Review' ? { ...task, status: 'Review' } : task
}

function getInitialTasks() {
  return initialTasks.map((task) => normalizeLegacyStatus({ ...task }))
}

export function formatDueDate(date) {
  if (!date) return 'No due date'

  return new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function isValidDueDate(date) {
  if (date === '') return true
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false

  const parsedDate = new Date(`${date}T00:00:00.000Z`)
  return Number.isFinite(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === date
}

function isValidTaskList(value) {
  if (!Array.isArray(value)) return false

  const ids = new Set()
  return value.every((task) => {
    if (
      !task ||
      !Number.isInteger(task.id) ||
      task.id < 1 ||
      ids.has(task.id) ||
      typeof task.title !== 'string' ||
      !task.title.trim() ||
      typeof task.project !== 'string' ||
      typeof task.category !== 'string' ||
      !priorities.includes(task.priority) ||
      !(statuses.includes(task.status) || legacyStatuses.includes(task.status)) ||
      !isValidDueDate(task.dueDate) ||
      typeof task.description !== 'string'
    ) {
      return false
    }

    ids.add(task.id)
    return true
  })
}

export function loadTasks() {
  let serializedTasks

  try {
    serializedTasks = window.localStorage.getItem(tasksStorageKey)
  } catch (error) {
    console.error('Unable to read Komedwork tasks from localStorage.', error)
    return getInitialTasks()
  }

  if (serializedTasks === null) {
    return getInitialTasks()
  }

  let storedTasks
  try {
    storedTasks = JSON.parse(serializedTasks)
  } catch (error) {
    console.warn('Stored Komedwork tasks are not valid JSON; using initial tasks.', error)
    return getInitialTasks()
  }

  if (!isValidTaskList(storedTasks)) {
    console.warn('Stored Komedwork tasks have an invalid format; using initial tasks.')
    return getInitialTasks()
  }

  return storedTasks.map(normalizeLegacyStatus)
}

export function saveTasks(tasks) {
  try {
    window.localStorage.setItem(tasksStorageKey, JSON.stringify(tasks))
  } catch (error) {
    console.error('Unable to save Komedwork tasks to localStorage.', error)
  }
}
