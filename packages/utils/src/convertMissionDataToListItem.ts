import { parseMissionPath } from './parseMissionPath'

// Convert mission data into a list item
export interface MissionListItem {
  path: string
  description?: string
}

export const convertMissionDataToListItem =
  (vehicleName: string) => (mission: MissionListItem) => {
    const { category, name } = parseMissionPath(mission.path)
    return {
      id: mission.path,
      category,
      name,
      task: '',
      description: mission.description,
      vehicle: vehicleName,
    }
  }
