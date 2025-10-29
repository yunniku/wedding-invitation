"use client"

import React, { useEffect } from "react"
import useSWR, { mutate } from "swr"
import { createClient } from "@supabase/supabase-js"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface GuestbookEntry {
  id: number
  name: string
  message: string
  created_at: string
}

const SUPABASE_URL = "https://ajlehegcruaupcxybuel.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqbGVoZWdjcnVhdXBjeHlidWVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwOTM5MjcsImV4cCI6MjA3NjY2OTkyN30.3FKEiDquTdY8Lle_QSD3uCx1JV9W5ZArR01kPrPrLMI"

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ✅ SWR fetcher
const fetcher = async () => {
  const { data, error } = await supabase
    .from("guestbook")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw error
  return data
}

// ✅ 컴포넌트 내부로 훅 이동
export function GuestbookEntries() {
  const { data: entries, error, isLoading, mutate } = useSWR<GuestbookEntry[]>(
    "guestbook",
    fetcher
  )
  
  useEffect(() => {
    const channel = supabase
      .channel("guestbook-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "guestbook" },
        (payload) => {
          console.log("📡 Realtime change detected:", payload)
          mutate() // ✅ mutate("guestbook") ❌ → mutate() ✅
        }
      )
      .subscribe()
  
    return () => {
      supabase.removeChannel(channel)
    }
  }, [mutate])
  

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground mb-6">Recent Entries</h2>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load entries. Please refresh.</p>
      </div>
    )
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          No entries yet. Be the first to sign our guestbook!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">
        Recent Entries ({entries.length})
      </h2>

      <div className="space-y-4">
        {entries.map((entry) => (
          <Card key={entry.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg text-foreground">{entry.name}</h3>
                <time className="text-sm text-muted-foreground">
                  {new Date(entry.created_at).toLocaleDateString("ko-KR", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              </div>
              <p className="text-foreground leading-relaxed">{entry.message}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
