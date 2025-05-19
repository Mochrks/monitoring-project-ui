"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ProjectData } from "@/lib/types"

interface DataPreviewProps {
  readonly data: ProjectData
}

export function DataPreview({ data }: DataPreviewProps) {
  // Show only first 10 rows for preview
  const previewRows = data.rows.slice(0, 10)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                {data.subActivities.map((activity) => (
                  <TableHead key={activity}>{activity}</TableHead>
                ))}
                {data.months.map((month) => (
                  <TableHead key={month}>{month}</TableHead>
                ))}
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewRows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  <TableCell className="font-medium">{row.project}</TableCell>
                  {data.subActivities.map((activity, actIndex) => (
                    <TableCell key={actIndex}>{row.activities[activity] ?? "-"}</TableCell>
                  ))}
                  {data.months.map((month) => (
                    <TableCell key={month}>{row.timeline[month]?.join(", ") ?? "-"}</TableCell>
                  ))}
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(row.status)}`}>{row.status}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Showing {previewRows.length} of {data.rows.length} rows
        </p>
      </CardContent>
    </Card>
  )
}

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "Inisiasi":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
    case "Menunggu Approval":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
    case "Sedang Proses Input Kajian":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
    case "Finalisasi BRD":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100"
    case "UAT":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
  }
}
