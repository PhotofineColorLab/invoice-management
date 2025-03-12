"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { UploadIcon, FileIcon, XIcon } from "lucide-react"
import { toast } from "sonner"
import { processFile } from "@/lib/process-file"
import type { CategoryData } from "@/app/types/data-types"

interface FileUploaderProps {
  onProcessingStart: () => void
  onProcessingComplete: (data: CategoryData) => void
  onProcessingError: () => void
}

export function FileUploader({ onProcessingStart, onProcessingComplete, onProcessingError }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0])
    }
  }

  const validateAndSetFile = (file: File) => {
    const validTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // Excel (.xlsx)
      "application/vnd.ms-excel", // Older Excel format
    ]

    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload a PDF, JPG, PNG, or Excel (.xlsx) file.")
      return
    }
    setFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0])
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleProcessFile = async () => {
    if (!file) return

    onProcessingStart()

    try {
      const result = await processFile(file)

      // Check if we got empty results
      const isEmpty = result.invoices.length === 0 && result.products.length === 0 && result.customers.length === 0

      if (isEmpty) {
        toast.error("No data extracted. The AI couldn't extract structured data from this document.")
        onProcessingError()
      } else {
        onProcessingComplete(result)
        toast.success("Processing complete. Your file has been successfully analyzed.")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An unknown error occurred")
      onProcessingError()
    }
  }

  // Get file type for display
  const getFileType = (file: File) => {
    if (file.type.includes("pdf")) return "PDF"
    if (file.type.includes("image")) return "Image"
    if (file.type.includes("spreadsheet") || file.type.includes("excel")) return "Excel"
    return "File"
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            isDragging ? "border-primary bg-primary/10" : "border-border"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {!file ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <UploadIcon className="h-12 w-12 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-medium">Drag and drop your file here</p>
                <p className="text-sm text-muted-foreground mt-1">Supports PDF, JPG, PNG, and Excel (.xlsx) files</p>
              </div>
              <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="mt-2">
                Browse Files
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls"
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <FileIcon className="h-6 w-6 text-primary" />
                <span className="font-medium">{file.name}</span>
                <span className="text-xs text-muted-foreground">({getFileType(file)})</span>
                <Button variant="ghost" size="icon" onClick={handleRemoveFile} className="h-6 w-6 rounded-full">
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
              <Button onClick={handleProcessFile}>Process File</Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}