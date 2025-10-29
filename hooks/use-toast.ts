"use client"

import * as React from "react"

type ToastType = "default" | "destructive"

interface ToastProps {
  title?: string
  description?: string
  variant?: ToastType
}

export function useToast() {
  const toast = React.useCallback(({ title, description, variant }: ToastProps) => {
    const bgColor =
      variant === "destructive"
        ? "bg-red-100 text-red-700 border-red-300"
        : "bg-green-100 text-green-700 border-green-300"

    const toastDiv = document.createElement("div")
    toastDiv.className = `fixed top-5 right-5 border px-4 py-3 rounded-md shadow-md animate-fade-in ${bgColor} z-[9999]`
    toastDiv.innerHTML = `
      <strong>${title ?? ""}</strong>
      <p>${description ?? ""}</p>
    `

    document.body.appendChild(toastDiv)

    setTimeout(() => {
      toastDiv.remove()
    }, 2500)
  }, [])

  return { toast }
}
