"use client"

import React, { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

import { Send, Paperclip, X, Menu, Timer, Search, Plus } from "lucide-react"
import { parseCookies } from "nookies"

interface User {
  user_id: number
  first_name: string
  avatar: string

}

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  expiresAt?: number
  sender_id: number
}

// Remove the static users array. Instead, conversationUsers will be fetched from the backend.


function SearchBar({ onSearch }: { onSearch: (query: string) => void }) {
  return (
    <div className="relative p-2">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white text-muted-foreground" />
      <Input placeholder="Search users..." className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/70" onChange={(e) => onSearch(e.target.value)} />
    </div>
  )
}

function AddUserDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
      <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Input placeholder="Search users to add..." />
            <div className="grid gap-2">
              {["David", "Emma", "Frank"].map((name) => (
                <div key={name} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarFallback>{name[0]}</AvatarFallback>
                    </Avatar>
                    <span>{name}</span>
                  </div>
                  <Button size="sm">Add</Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
function UsersList({
  conversationUsers,
  currentUser,
  setCurrentUser,
}: {
  conversationUsers: User[]
  
  currentUser: User
  setCurrentUser: (user: User) => void
}) {

  const [searchQuery, setSearchQuery] = useState("")
  const filteredUsers = conversationUsers.filter((user) => user.first_name.toLowerCase().includes(searchQuery.toLowerCase()))
  return (
    <div>
       <SearchBar onSearch={setSearchQuery} />
    <ScrollArea className="h-[calc(100vh-120px)] lg:h-[70vh]">
      {filteredUsers.map((user) => (
        <div
          key={user.user_id}
          className={`flex items-center space-x-4 p-4 cursor-pointer hover:bg-white/10 text-white ${
            currentUser.user_id === user.user_id ? "bg-white/10" : ""
          }`}
          onClick={() => setCurrentUser(user)}
        >
          <Avatar>
            <AvatarImage src={user.avatar} alt={user.first_name} />
            <AvatarFallback className="bg-violet-500 text-white-600 font-bold">{user.first_name[0]}</AvatarFallback>
          </Avatar>
          <div>{user.first_name}</div>
        </div>
      ))}
    </ScrollArea>
    </div>
  )
}

function MessageTimer({ expiresAt }: { expiresAt: number }) {
  const [timeLeft, setTimeLeft] = useState<number>(0)

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now()
      const remaining = Math.max(0, expiresAt - now)
      setTimeLeft(remaining)
    }
    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  const seconds = Math.ceil(timeLeft / 1000)
  const minutes = Math.floor(seconds / 60)
  const displayTime = minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`

  return (
    <div className="flex items-center text-xs text-muted-foreground mt-1">
      <Timer className="h-3 w-3 mr-1" />
      {displayTime}
    </div>
  )
}

export default function Chat() {
  const [input, setInput] = useState("")
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [attachment, setAttachment] = useState<File | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [selectedTimer, setSelectedTimer] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [conversationUsers, setConversationUsers] = useState<User[]>([])

  const cookies = parseCookies()
  const userCookie = cookies.user ? JSON.parse(cookies.user) : null
  const loggedInUserId = userCookie ? userCookie.userId : null

  // Fetch conversation partners for the logged in user.
  useEffect(() => {
    if (!loggedInUserId) return
    console.log("cookie user:", userCookie)

    async function fetchConversations() {
      try {
        console.log("Fetching conversations for user:", loggedInUserId)
        const res = await fetch(`http://localhost:10101/chat/conversations/${loggedInUserId}`, {
          method: "GET",
          credentials: "include",
        })
        const data = await res.json()
        if (res.ok) {
          setConversationUsers(data.conversations)
          console.log ("Arrat of conversation users:", Array.isArray(conversationUsers) )
          console.log("Fetched conversation partners:", data)
          // Optionally, set the first conversation partner as currentUser:
          if (data.length > 0 && !currentUser) {
            setCurrentUser(data[0])
          }
        } else {
          console.error("Failed to fetch conversation partners:", data.error)
        }
      } catch (error) {
        console.error("Error fetching conversations:", error)
      }
    }
    fetchConversations()
  }, [loggedInUserId])

  // Fetch conversation messages for the selected user.
  const fetchConversationForUser = async (conversationUser: User) => {
    if (!loggedInUserId) return
    try {
      const response = await fetch(
        `http://localhost:10101/chat/messages?userId=${loggedInUserId}&conversationWith=${conversationUser.user_id}`,
        {
          method: "GET",
          credentials: "include",
        }
      )
      const data = await response.json()
      if (response.ok) {
        setMessages(data.messages)
       // console.log("Fetched messages:", data)
      } else {
        console.error("Failed to fetch messages:", data.error)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  // Refetch conversation messages when currentUser changes.
  useEffect(() => {
    if (currentUser) {
      // Immediately fetch once
      fetchConversationForUser(currentUser);
      // Set up an interval to fetch every second
      const intervalId = setInterval(() => {
        fetchConversationForUser(currentUser);
      }, 1000);
      // Clean up the interval on unmount or when currentUser changes
      return () => clearInterval(intervalId);
    }
  }, [currentUser]);

/*   useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      console.log("Cleaning up expired messages...")

   
     setMessages((prevMessages) =>
      prevMessages.filter((message) => !message.expiresAt || message.expiresAt > Date.now())
    ) 
      console.log("Messages after cleanup:", messages)
      console.log("time now:", Date.now())

    }, 1000)
    return () => clearInterval(interval)
  }, []) */
 
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (input.trim() || attachment) {
      let messageContent = input.trim()

      if (attachment) {
        const formData = new FormData()
        formData.append("file", attachment)
        try {
          const uploadRes = await fetch("http://localhost:10101/chat/upload", {
            method: "POST",
            body: formData,
          })
          const uploadData = await uploadRes.json()
          const fileUrl = uploadData.fileUrl
          messageContent += ` [FILE ATTACHED: ${fileUrl}]`
        } catch (error) {
          console.error("File upload failed:", error)
        }
      }

      const expiresAt = selectedTimer
        ? selectedTimer 
        :  240000

      try {
        const res = await fetch("http://localhost:10101/chat/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: messageContent,
            role: "user",
            expiresAt,
            userId: loggedInUserId,
            conversationWith: currentUser?.user_id,
          }),
        })
        const data = await res.json()
        console.log("Message sent:", data)
        setMessages((prev) => [...prev, data])
        setInput("")
        setAttachment(null)
        setSelectedTimer(null)
      } catch (error) {
        console.error("Error sending message:", error)
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0])
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen  bg-gradient-to-br from-purple-500 to-pink-500 p-2 sm:p-4">
      <Card className="w-full  h-[calc(100vh-16px)] sm:h-[calc(100vh-32px)] flex flex-col bg-white/10 backdrop-blur-md border-white/20">
       

        <div className="flex-1 flex">
        <div className="hidden lg:block w-[250px] border-r border-white/20 bg-white/5">
        <div className="border-b border-white/20 p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Conversations</CardTitle>
                <AddUserDialog />
              </div>
            </div>
            <UsersList
              conversationUsers={conversationUsers}
              currentUser={currentUser || { user_id: 0, first_name: "", avatar: "" }}
              setCurrentUser={(user) => {
                setCurrentUser(user)
                fetchConversationForUser(user)
              }}
            />
          </div>

          <div className="flex-1 flex flex-col">
          <div className="border-b border-white/20 p-4 bg-white/5">
              <CardTitle className="text-white">{currentUser?.first_name}</CardTitle>
            </div>
            <CardContent className="flex-1 p-4 ">
              <ScrollArea className="h-full pr-4">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex mb-4 ${m.sender_id === loggedInUserId ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex items-end space-x-2 ${m.sender_id === loggedInUserId ? "flex-row-reverse space-x-reverse" : ""}`}>
                      <Avatar>
                        <AvatarImage src={currentUser?.avatar} alt={m.sender_id === loggedInUserId ? userCookie.username : currentUser?.first_name} />
                        <AvatarFallback className="bg-violet-500 text-white-600 font-bold">{m.sender_id === loggedInUserId ? userCookie.username[0] : currentUser?.first_name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            m.sender_id === loggedInUserId ? "bg-blue-500 text-white" : "bg-blue-500 text-white"
                          }`}
                        >
                          {m.content}
                        </div>
                        {m.expiresAt && <MessageTimer expiresAt={m.expiresAt} />}
                      </div>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>

            <div className="p-4 border-t border-white/20 bg-white/5 backdrop-blur-sm">
              <form onSubmit={onSubmit} className="flex flex-col space-y-2">
                {attachment && (
                  <div className="flex items-center bg-blue-100 rounded-md px-3 py-1">
                    <span className="text-sm truncate max-w-[200px]">{attachment.name}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 ml-1" onClick={() => setAttachment(null)} type="button">
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                <div className="flex space-x-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-grow bg-white/10 border-white/20 text-white placeholder:text-white/70"
                  />
                  <input type="file" id="file-upload" className="hidden" onChange={handleFileChange} />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => document.getElementById("file-upload")?.click()}
                    className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className={`border-white/20 bg-white/10 text-white hover:bg-white/20 ${
                          selectedTimer ? "bg-blue-500/20" : ""
                        }`}
                      >
                        <Timer className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end"  className="bg-white/10 backdrop-blur-md border-white/20">
                      {/* Timer options */}
                      <DropdownMenuItem onClick={() => setSelectedTimer(10)}>10 seconds</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSelectedTimer(60)}>1 minute</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSelectedTimer(300)}>5 minutes</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSelectedTimer(3600)}>1 hour</DropdownMenuItem>
                      {selectedTimer && (
                        <DropdownMenuItem onClick={() => setSelectedTimer(null)} className="text-red-500">
                          Remove timer
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button type="submit" size="icon" className="bg-blue-500/80 hover:bg-blue-500/90 text-white">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                {selectedTimer && (
                  <div className="text-xs text-muted-foreground">
                    Message will disappear after{" "}
                    {selectedTimer === 10
                      ? "10 seconds"
                      : selectedTimer === 60
                      ? "1 minute"
                      : selectedTimer === 300
                      ? "5 minutes"
                      : "1 hour"}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
