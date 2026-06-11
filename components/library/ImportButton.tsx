"use client"

import { useState } from "react"
import { Upload } from "lucide-react"
import { ImportModal } from "./ImportModal"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ImportButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
      >
        <Upload className="h-3.5 w-3.5" />
        导入文档
      </button>
      <ImportModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
