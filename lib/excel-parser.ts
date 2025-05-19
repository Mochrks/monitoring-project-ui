import * as XLSX from "xlsx"
import type { ProjectData, ProjectRow } from "./types"

export async function parseExcelFile(file: File): Promise<ProjectData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })

        // containts data
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

        if (jsonData.length < 2) {
          throw new Error("Excel file does not contain enough data")
        }

        // Parse header row
        const headers = jsonData[0] as string[]

        // Find column indices
        const projectColIndex = headers.findIndex((h) => h.toLowerCase().includes("project"))
        const statusColIndex = headers.findIndex((h) => h.toLowerCase().includes("status"))

        if (projectColIndex === -1 || statusColIndex === -1) {
          throw new Error("Excel file must contain Project and Status columns")
        }

        // Identify month columns (assuming they are named Jan, Feb, etc.)
        const monthNames = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ]
        const shortMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

        const monthIndices: Record<string, number> = {}

        headers.forEach((header, index) => {
          const monthIndex = monthNames.findIndex(
            (m) =>
              header.toLowerCase().includes(m.toLowerCase()) ||
              header.toLowerCase().includes(shortMonthNames[monthNames.indexOf(m)].toLowerCase()),
          )

          if (monthIndex !== -1) {
            monthIndices[monthNames[monthIndex]] = index
          }
        })

        // Identify sub-activity columns (columns between project and first month)
        const firstMonthIndex = Math.min(...Object.values(monthIndices))
        const subActivityIndices: number[] = []

        for (let i = projectColIndex + 1; i < firstMonthIndex; i++) {
          if (i !== statusColIndex) {
            subActivityIndices.push(i)
          }
        }

        const subActivities = subActivityIndices.map((index) => headers[index])

        // Parse data rows
        const rows: ProjectRow[] = []

        for (let i = 1; i < jsonData.length; i++) {
          const rowData = jsonData[i]
          if (!rowData[projectColIndex]) continue // Skip empty rows

          const project = rowData[projectColIndex].toString()
          const status = rowData[statusColIndex]?.toString() ?? "Unknown"

          // Parse activities
          const activities: Record<string, string> = {}
          subActivityIndices.forEach((index, idx) => {
            activities[subActivities[idx]] = rowData[index]?.toString() ?? ""
          })

          // Parse timeline data
          const timeline: Record<string, string[]> = {}

          Object.entries(monthIndices).forEach(([month, index]) => {
            const cellValue = rowData[index]?.toString() ?? ""

            // Assuming dates are comma-separated in the cell
            if (cellValue) {
              timeline[month] = cellValue.split(",").map((d:any) => d.trim())
            } else {
              timeline[month] = []
            }
          })

          rows.push({
            project,
            activities,
            timeline,
            status,
          })
        }

        resolve({
          subActivities,
          months: Object.keys(monthIndices),
          rows,
        })
      } catch (error) {
        console.error("Error parsing Excel:", error)
        reject(error)
      }
    }


    reader.onerror = () => {
      reject(new Error("Failed to read file"))
    }

    reader.readAsArrayBuffer(file)
  })
}
