export interface ProjectRow {
  project: string
  activities: Record<string, string>
  timeline: Record<string, string[]>
  status: string
}

export interface ProjectData {
  subActivities: string[]
  months: string[]
  rows: ProjectRow[]
}
