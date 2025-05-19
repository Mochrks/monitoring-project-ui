"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ProjectData } from "@/lib/types"
import Chart from "chart.js/auto"
import { ArrowUpIcon, InfoIcon as InfoCircledIcon } from "lucide-react"

interface ChartViewProps {
  readonly data: ProjectData
}

export function ChartView({ data }: ChartViewProps) {
  const donutChartRef = useRef<HTMLCanvasElement>(null)

  // Calculate status counts
  const statusCounts: Record<string, number> = {}
  data.rows.forEach((row) => {
    statusCounts[row.status] = (statusCounts[row.status] || 0) + 1
  })

  // Define status colors
  const statusColors: Record<string, string> = {
    Inisiasi: "#DF1F3BCC",
    "Menunggu Approval": "#F44336CC",
    "Sedang Proses Input Kajian": "#8BC34BCC",
    "Finalisasi BRD": "#4CAF50CC",
    UAT: "#4051B5CC",
    "Review BRD Final": "#009688CC",
    Deploy: "#673AB7CC",
    Released: "#9C27B0CC",
  }

  // Get total project count
  const totalProjects = data.rows.length

  useEffect(() => {
    if (!data || !donutChartRef.current) return

    // Create donut chart
    const donutChart = new Chart(donutChartRef.current, {
      type: "doughnut",
      data: {
        labels: Object.keys(statusCounts),
        datasets: [
          {
            data: Object.values(statusCounts),
            backgroundColor: Object.keys(statusCounts).map((status) => statusColors[status] || "#6b7280"),
            borderWidth: 4,
            borderRadius: 4,
            hoverOffset: 5,
          },
        ],
      },
      options: {
        responsive: true,
        cutout: "70%",
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || ""
                const value = context.raw as number
                const percentage = Math.round((value / totalProjects) * 100)
                return `${label}: ${value} (${percentage}%)`
              },
            },
          },
        },
      },
    })

    return () => {
      donutChart.destroy()
    }
  }, [data, statusCounts, totalProjects])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center ">
          <CardTitle>Total by Status</CardTitle>
          <InfoCircledIcon className="h-4 w-4 ml-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(statusCounts).map(([status, count], index) => (
              <div key={status} className="flex items-center justify-between rounded-lg border overflow-hidden">
                <div className="p-4 flex-1">
                  <div className="font-medium">
                    {index + 1}. {status}
                  </div>
                  <div className="text-xs text-green-600 flex items-center">
                    <ArrowUpIcon className="h-3 w-3 mr-1" />1 Update
                  </div>
                </div>
                <div
                  className="h-full w-16 flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: statusColors[status] || "#6b7280" }}
                >
                  {count}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Presentase by Status</CardTitle>
          <InfoCircledIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="relative h-[300px] flex items-center justify-center">
            <canvas ref={donutChartRef} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-sm text-muted-foreground">Total Project</div>
              <div className="text-3xl font-bold">{totalProjects}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: statusColors[status] || "#6b7280" }}
                ></div>
                <span className="text-xs">{status}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
