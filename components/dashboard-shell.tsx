"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUpload } from "@/components/file-upload"
import { DataPreview } from "@/components/data-preview"
import { ChartView } from "@/components/chart-view"
import { TimelineView } from "@/components/timeline-view"
import type { ProjectData } from "@/lib/types"

export function DashboardShell() {
  const [data, setData] = useState<ProjectData | null>(null)

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Monitoring Project</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Upload Project Data</CardTitle>
        </CardHeader>
        <CardContent>
          <FileUpload onDataLoaded={setData} />
        </CardContent>
      </Card>

      {data && (
        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preview">Data Preview</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>
          <TabsContent value="preview">
            <DataPreview data={data} />
          </TabsContent>
          <TabsContent value="charts">
            <ChartView data={data} />
          </TabsContent>
          <TabsContent value="timeline">
            <TimelineView data={data} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
