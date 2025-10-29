"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://ajlehegcruaupcxybuel.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqbGVoZWdjcnVhdXBjeHlidWVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwOTM5MjcsImV4cCI6MjA3NjY2OTkyN30.3FKEiDquTdY8Lle_QSD3uCx1JV9W5ZArR01kPrPrLMI"

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export default function TestRealtime() {
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    console.log("🔌 Subscribing to guestbook realtime events...")

    const channel = supabase
      .channel("guestbook-realtime-test")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "guestbook" },
        (payload) => {
          console.log("📡 EVENT:", payload)
          setLogs((prev) => [
            `${new Date().toLocaleTimeString()} — ${payload.eventType}`,
            ...prev,
          ])
        }
      )
      .subscribe()

    return () => {
      console.log("❌ Unsubscribed")
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">🧪 Realtime Debug Panel</h1>
      <p className="mb-6 text-muted-foreground">
        guestbook 테이블의 실시간 이벤트를 감시 중입니다.  
        (insert / update / delete 발생 시 아래에 표시됩니다)
      </p>

      <div className="border rounded-md bg-gray-50 p-4 h-80 overflow-auto">
        {logs.length === 0 ? (
          <p className="text-gray-400">아직 이벤트 없음</p>
        ) : (
          <ul className="space-y-2">
            {logs.map((log, idx) => (
              <li key={idx} className="text-sm font-mono">
                {log}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
