"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ProjectData, ProjectRow } from "@/lib/types"
import { useState, useMemo } from "react"

interface TimelineViewProps {
  data: ProjectData
}

export function TimelineView({ data }: TimelineViewProps) {
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  // Group projects by category (if they have a common prefix)
  const projectGroups = useMemo(() => {
    const groups: Record<string, string[]> = {}
    const ungrouped: string[] = []

    // Get unique project names
    const projectNames = [...new Set(data.rows.map((row) => row.project))]

    // Try to find groups (projects with same word at beginning)
    projectNames.forEach((project) => {
      const words = project.split(" ")
      if (words.length > 1) {
        const potentialGroup = words[0].toUpperCase()
        // Check if this could be a group name (all caps)
        if (potentialGroup === words[0] && potentialGroup.length > 3) {
          if (!groups[potentialGroup]) {
            groups[potentialGroup] = []
          }
          groups[potentialGroup].push(project)
        } else {
          ungrouped.push(project)
        }
      } else {
        ungrouped.push(project)
      }
    })

    // Add ungrouped projects directly to their respective groups
    // or create new groups for them based on first letter
    ungrouped.forEach((project) => {
      const firstChar = project.charAt(0).toUpperCase()
      const existingGroups = Object.keys(groups)

      // Find if there's a group that starts with the same letter
      const matchingGroup = existingGroups.find((group) => group.startsWith(firstChar))

      if (matchingGroup) {
        groups[matchingGroup].push(project)
      } else {
        // Just add to the first available group or create a new one
        if (existingGroups.length > 0) {
          groups[existingGroups[0]].push(project)
        } else {
          // If no groups exist yet, create a generic one
          const newGroup = project.split(" ")[0].toUpperCase()
          groups[newGroup] = [project]
        }
      }
    })

    return groups
  }, [data.rows])

  // Get all weeks for the timeline
  const weeks = useMemo(() => {
    const allWeeks: Record<string, number[]> = {}

    data.months.forEach((month) => {
      // For each month, create 4 weeks (2, 9, 16, 23)
      allWeeks[month] = [2, 9, 16, 23]
    })

    return allWeeks
  }, [data.months])

  // Generate color legend
  const colorLegend = [
    { color: "#e11d48", label: "Start" },
    { color: "#fb7185", label: "" },
    { color: "#fbbf24", label: "" },
    { color: "#a3e635", label: "" },
    { color: "#34d399", label: "" },
    { color: "#22d3ee", label: "" },
    { color: "#818cf8", label: "" },
    { color: "#a855f7", label: "" },
    { color: "#d946ef", label: "End" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monitoring Project</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b border-r p-2 bg-gray-800 text-white sticky left-0 z-10 min-w-[200px]">
                  Project Name
                </th>
                {data.months.map((month) => (
                  <th key={month} className="border-b p-0 bg-gray-800 text-white" colSpan={4}>
                    <div className="p-2 text-center">{month}</div>
                    <div className="flex">
                      {weeks[month].map((week) => (
                        <div key={`${month}-${week}`} className="flex-1 p-1 text-xs text-center">
                          {week}
                        </div>
                      ))}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(projectGroups).map(([groupName, projects]) => (
                <>
                  {/* Group header row */}
                  <tr key={groupName} className="group-header">
                    <td className="border-r p-2 font-bold sticky left-0 bg-blue-100 dark:bg-blue-900 z-10">
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded mr-2 ${getGroupColor(groupName)}`}></div>
                        {groupName}
                      </div>
                    </td>
                    {/* {data.months.map((month, monthIndex) => (
                      <td key={`${groupName}-${month}`} colSpan={4} className="relative bg-blue-50 dark:bg-blue-950">
                        <div className="h-10 flex items-center justify-center text-blue-800 dark:text-blue-200 font-medium">
                          {groupName}
                        </div>
                      </td>
                    ))} */}
                  </tr>

                  {/* Project rows */}
                  {projects.map((projectName) => {
                    const projectData = data.rows.find((row) => row.project === projectName)
                    if (!projectData) return null

                    return (
                      <tr
                        key={projectName}
                        className="hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer"
                        onClick={() => setSelectedProject(selectedProject === projectName ? null : projectName)}
                      >
                        <td className="border-r p-2 font-medium sticky left-0 bg-white dark:bg-gray-950 z-10">
                          {projectName}
                        </td>

                        {/* Continuous timeline bar */}
                        <td colSpan={data.months.length * 4} className="relative p-0">
                          <ContinuousTimelineBar
                            projectData={projectData}
                            months={data.months}
                            isSelected={selectedProject === projectName}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </>
              ))}
            </tbody>
          </table>

          {/* Color Legend */}
          <div className="mt-6 flex flex-col items-center">
            <div className="text-sm font-medium mb-2">Timeline Progress</div>
            <div className="flex items-center w-full max-w-2xl">
              {colorLegend.map((item, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="h-4 w-full" style={{ backgroundColor: item.color }}></div>
                  {item.label && <div className="text-xs mt-1">{item.label}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface ContinuousTimelineBarProps {
  projectData: ProjectRow
  months: string[]
  isSelected: boolean
}

function ContinuousTimelineBar({ projectData, months, isSelected }: ContinuousTimelineBarProps) {
  // Calculate the start and end months based on timeline data
  const timelineRange = useMemo(() => {
    let startMonth: string | null = null
    let endMonth: string | null = null

    for (const month of months) {
      if (projectData.timeline[month]?.length > 0) {
        if (startMonth === null) {
          startMonth = month
        }
        endMonth = month
      }
    }

    return { startMonth, endMonth, months }
  }, [projectData, months])

  // Generate a gradient based on the project's timeline
  const gradientStyle = useMemo(() => {
    if (!timelineRange.startMonth || !timelineRange.endMonth) {
      return {}
    }

    const startIndex = months.indexOf(timelineRange.startMonth)
    const endIndex = months.indexOf(timelineRange.endMonth)

    // Calculate the total number of cells (months * 4 weeks)
    const totalCells = months.length * 4

    // Calculate start and end positions for the gradient (as percentages)
    const startPos = ((startIndex * 4) / totalCells) * 100
    const endPos = ((endIndex * 4 + 4) / totalCells) * 100

    // Calculate left position for the bar
    const leftPos = `${startPos}%`
    // Calculate width for the bar
    const width = `${endPos - startPos}%`

    return {
      left: leftPos,
      width: width,
      background: `linear-gradient(to right, 
        #e11d48, 
        #fb7185, 
        #fbbf24, 
        #a3e635, 
        #34d399, 
        #22d3ee, 
        #818cf8, 
        #a855f7, 
        #d946ef)`,
    }
  }, [timelineRange, months])

  // Only render if we have a valid range
  if (!timelineRange.startMonth || !timelineRange.endMonth) {
    return <div className="h-10"></div>
  }

  // Get activity info for tooltip
  const activityInfo = Object.entries(projectData.activities)
    .filter(([_, value]) => value)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ")

  return (
    <div className="relative h-10 w-full">
      <div
        className={`absolute h-3 top-3.5 rounded-full ${isSelected ? "h-4 top-3" : ""}`}
        style={gradientStyle}
        title={activityInfo}
      >
        {isSelected && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs shadow-md whitespace-nowrap">
            {projectData.project}: {activityInfo || "No details"}
          </div>
        )}
      </div>
    </div>
  )
}

// Helper function to get a color for a project group
function getGroupColor(groupName: string): string {
  const colors: Record<string, string> = {
    REVAMPS: "bg-blue-500",
    EDUCATION: "bg-red-500",
    SYSTEM: "bg-green-500",
    DEVELOPMENT: "bg-purple-500",
    RESEARCH: "bg-yellow-500",
  }

  // If no matching color, generate one based on the first character
  if (!colors[groupName]) {
    const charCode = groupName.charCodeAt(0)
    const hue = (charCode * 137) % 360 // Generate a somewhat random hue
    return `bg-[hsl(${hue},70%,50%)]`
  }

  return colors[groupName]
}
