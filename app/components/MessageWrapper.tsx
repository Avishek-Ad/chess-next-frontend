"use client"
import { ReactNode, useEffect, useState } from "react"
import useShowMessage from "../hooks/useShowMessage"

interface MessageWrapperProps {
  children: ReactNode
}

export default function MessageWrapper({ children }: MessageWrapperProps) {
  const { message, isavailable, isError, resetMessage } = useShowMessage()
  const [visible, setVisible] = useState(false)

  // When message becomes available, show toast
  useEffect(() => {
    if (isavailable) {
      setVisible(true)
      // Auto-dismiss after 3 seconds
      const timer = setTimeout(() => {
        setVisible(false)
        resetMessage()
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [isavailable, resetMessage])

  return (
    <div className="relative">
      {/* Toast notification */}
      <div
        className={`fixed top-0 left-1/2 transform -translate-x-1/2 px-4 py-3 rounded-xl shadow-md text-sm transition-all duration-300 z-50
          ${isError ? "bg-red-400 text-white font-semibold" : "bg-green-400 text-white font-semibold"}
          ${visible ? "translate-y-5 opacity-100" : "-translate-y-20 opacity-0"}
        `}
      >
        <div className="flex justify-between items-center gap-4">
          <span>{message}</span>
          <button
            onClick={() => {
              setVisible(false)
              resetMessage()
            }}
            className="font-bold text-lg leading-none hover:opacity-80 transition"
          >
            ×
          </button>
        </div>
      </div>

      {/* Wrapped children */}
      {children}
    </div>
  )
}
