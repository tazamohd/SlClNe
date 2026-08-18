import type { DomainScreens } from '../registry'
import { TasksList } from '../tasks/TasksList'
import { TaskManagement } from '../tasks/TaskManagement'

export const SCREENS: DomainScreens = {
  Tasks: TasksList,
  'Task-Management': TaskManagement,
}
