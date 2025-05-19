"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, FileSpreadsheet } from "lucide-react"
import { parseExcelFile } from "@/lib/excel-parser"
import type { ProjectData } from "@/lib/types"

interface FileUploadProps {
  onDataLoaded: (data: ProjectData) => void
}

export function FileUpload({ onDataLoaded }: FileUploadProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsLoading(true)
      setError(null)

      const data = await parseExcelFile(file)
      onDataLoaded(data)
    } catch (err) {
      console.error("Error parsing Excel file:", err)
      setError("Failed to parse Excel file. Please check the format and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // const handleDownloadSample = () => {
  // console.log('test download')
  // }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-12 bg-gray-50 dark:bg-gray-900">
        <FileSpreadsheet className="h-10 w-10 text-gray-400 mb-4" />
        <div className="flex text-sm text-gray-600 dark:text-gray-400">
          <label
            htmlFor="file-upload"
            className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none"
          >
            <span>Upload Excel file</span>
            <Input
              id="file-upload"
              name="file-upload"
              type="file"
              accept=".xlsx, .xls"
              className="sr-only"
              onChange={handleFileChange}
              disabled={isLoading}
            />
          </label>
          <p className="pl-1">or drag and drop</p>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">XLSX, XLS up to 10MB</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}


    </div>
  )
}


