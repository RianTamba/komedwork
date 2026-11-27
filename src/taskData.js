export const statuses = ['To Do', 'In Progress', 'Review', 'Completed']
export const priorities = ['Low', 'Medium', 'High', 'Urgent']

export const statusColors = {
  'To Do': 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-orange-100 text-orange-700',
  Review: 'bg-purple-100 text-purple-700',
  Completed: 'bg-green-100 text-green-700',
}

export function formatDueDate(date) {
  if (!date) return 'No due date'

  return new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
