export const projectStatuses = ['Planning', 'Active', 'On Hold', 'Completed']
export const projectPriorities = ['Low', 'Medium', 'High', 'Urgent']
export const projectsStorageKey = 'komedwork_projects'

function isValidDate(value) {
  if (value === '') return true
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false

  const parsedDate = new Date(`${value}T00:00:00.000Z`)
  return Number.isFinite(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === value
}

function isValidProject(project) {
  return Boolean(
    project &&
    typeof project.id === 'string' &&
    project.id.trim() &&
    typeof project.name === 'string' &&
    project.name.trim() &&
    typeof project.client === 'string' &&
    typeof project.description === 'string' &&
    projectStatuses.includes(project.status) &&
    projectPriorities.includes(project.priority) &&
    isValidDate(project.startDate) &&
    isValidDate(project.deadline) &&
    typeof project.createdAt === 'string' &&
    Number.isFinite(Date.parse(project.createdAt)) &&
    (!project.startDate || !project.deadline || project.deadline >= project.startDate)
  )
}

function isValidProjectList(value) {
  if (!Array.isArray(value)) return false

  const ids = new Set()
  const names = new Set()
  return value.every((project) => {
    const normalizedName = typeof project?.name === 'string'
      ? project.name.trim().toLocaleLowerCase()
      : ''
    if (
      !isValidProject(project) ||
      ids.has(project.id) ||
      names.has(normalizedName)
    ) {
      return false
    }

    ids.add(project.id)
    names.add(normalizedName)
    return true
  })
}

export function loadProjects() {
  let serializedProjects

  try {
    serializedProjects = window.localStorage.getItem(projectsStorageKey)
  } catch (error) {
    console.error('Unable to read Komedwork projects from localStorage.', error)
    return null
  }

  if (serializedProjects === null) return null

  let storedProjects
  try {
    storedProjects = JSON.parse(serializedProjects)
  } catch (error) {
    console.warn('Stored Komedwork projects are not valid JSON; migrating task projects.', error)
    return null
  }

  if (!isValidProjectList(storedProjects)) {
    console.warn('Stored Komedwork projects have an invalid format; migrating task projects.')
    return null
  }

  return storedProjects
}

export function saveProjects(projects) {
  try {
    window.localStorage.setItem(projectsStorageKey, JSON.stringify(projects))
  } catch (error) {
    console.error('Unable to save Komedwork projects to localStorage.', error)
  }
}

export function createProjectId(projects = []) {
  const existingIds = new Set(projects.map((project) => project.id))
  let id

  do {
    const randomPart = globalThis.crypto?.randomUUID?.()
      ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
    id = `project-${randomPart}`
  } while (existingIds.has(id))

  return id
}

export function createProjectsFromTasks(tasks) {
  const names = new Map()
  tasks.forEach((task) => {
    const name = task.project.trim()
    if (name && !names.has(name.toLocaleLowerCase())) {
      names.set(name.toLocaleLowerCase(), name)
    }
  })

  const createdAt = new Date().toISOString()
  return [...names.values()].reduce((projects, name) => [
    ...projects,
    {
      id: createProjectId(projects),
      name,
      client: '',
      description: '',
      status: 'Active',
      priority: 'Medium',
      startDate: '',
      deadline: '',
      createdAt,
    },
  ], [])
}

export function linkTasksToProjects(tasks, projects) {
  return tasks.map((task) => {
    const linkedProject = projects.find((project) => project.id === task.projectId)
      ?? projects.find(
        (project) => project.name.toLocaleLowerCase() === task.project.trim().toLocaleLowerCase(),
      )

    if (!linkedProject) {
      return { ...task, projectId: '', project: '' }
    }

    return { ...task, projectId: linkedProject.id, project: linkedProject.name }
  })
}
