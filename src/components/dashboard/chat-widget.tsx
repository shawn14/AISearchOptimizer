"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, X, Send, Minimize2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ChatWidgetProps {
  pageContext?: string // e.g., "dashboard", "analytics", "brands"
}

export function ChatWidget({ pageContext = "dashboard" }: ChatWidgetProps) {
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close chat when route changes
  useEffect(() => {
    setIsExpanded(false)
  }, [pathname])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Welcome message when first expanded
  useEffect(() => {
    if (isExpanded && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: `Hi! I'm your RevIntel assistant. I can help you analyze your data, answer questions about your metrics, and provide insights. What would you like to know?`,
          timestamp: new Date()
        }
      ])
    }
  }, [isExpanded, messages.length])

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isExpanded])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          context: pageContext,
          conversationHistory: messages.slice(-4) // Last 4 messages for context
        })
      })

      const data = await response.json()

      if (data.response) {
        const assistantMessage: Message = {
          role: "assistant",
          content: data.response,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <>
      {/* Expanded overlay - right side only, leaves left sidebar visible */}
      {isExpanded && (
        <div className="fixed top-0 right-0 bottom-0 left-64 bg-background z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-gray-700" />
              </div>
              <span className="font-semibold text-base">Chat Assistant</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 max-w-3xl mx-auto w-full">
            <div className="space-y-4">
              {messages.map((message, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex flex-col",
                    message.role === "user" ? "items-end" : "items-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3",
                      message.role === "user"
                        ? "bg-gray-900 text-white rounded-br-md"
                        : "bg-gray-100 text-gray-900 rounded-bl-md"
                    )}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <p className={cn(
                    "text-xs text-muted-foreground mt-1 px-1",
                    message.role === "user" ? "text-right" : "text-left"
                  )}>
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-700" />
                    <span className="text-sm text-gray-700">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Fixed bottom input */}
          <div className="border-t border-gray-200 bg-white px-6 py-4">
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto w-full">
              <div className="flex gap-2 items-end">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about your data..."
                  className="min-h-[56px] max-h-[120px] resize-none flex-1 text-sm"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!input.trim() || isLoading}
                  className="h-[56px] w-[56px] flex-shrink-0 bg-gray-900 hover:bg-gray-800"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Press Enter to send • Shift+Enter for new line
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Fixed bottom input bar - spans main content area (left of sidebar) */}
      {!isExpanded && (
        <div className="fixed bottom-0 left-64 right-0 border-t border-gray-200 bg-white px-6 py-4 z-40">
          <div className="max-w-3xl mx-auto w-full">
            <form onSubmit={handleSubmit}>
              <div className="flex gap-2 items-center">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onFocus={() => setIsExpanded(true)}
                    placeholder="Ask me anything about your data..."
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    disabled={isLoading}
                  />
                </div>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!input.trim() || isLoading}
                  className="h-[48px] w-[48px] flex-shrink-0 bg-gray-900 hover:bg-gray-800"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
