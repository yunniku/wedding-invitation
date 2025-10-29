"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { mutate } from "swr"

export function GuestbookForm() {
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
  
    if (!name.trim() || !message.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in both your name and message.",
        variant: "destructive",
      })
      return
    }
  
    setIsSubmitting(true)
  
    try {
      const response = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message }),
      })
  
      if (!response.ok) throw new Error("Failed to submit entry")
  
      // ✅ 성공 알림
      toast({
        title: "Success!",
        description: "Your message has been added to the guestbook.",
      })
  
      // ✅ 입력 필드 초기화
      setName("")
      setMessage("")
  
      /**
       * ✅ SWR 캐시 즉시 갱신
       * 1️⃣ guestbook 키의 캐시를 즉시 무효화하고 다시 fetcher 실행
       * 2️⃣ entries 컴포넌트(useSWR)가 즉시 새 데이터를 불러옴
       */
      mutate("guestbook", undefined, { revalidate: true })
    } catch (error) {
      console.error("❌ Guestbook submit error:", error)
      toast({
        title: "Error",
        description: "Failed to submit your entry. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Card className="mb-12 shadow-lg border-2">
      <CardHeader>
        <CardTitle className="text-2xl">Sign Our Guestbook</CardTitle>
        <CardDescription>
          Share your thoughts and become part of our story
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Your Message</Label>
            <Textarea
              id="message"
              placeholder="Leave a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isSubmitting}
              rows={4}
              className="text-base resize-none"
            />
          </div>

          <Button
            type="submit"
            className="w-full text-base font-semibold"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Sign Guestbook"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
