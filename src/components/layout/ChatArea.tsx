'use client'

import { useState } from 'react'
import { Hash, PlusCircle, Smile } from 'lucide-react'
import { useChat } from '@/hooks/useChat'

export function ChatArea({ channelId = '123e4567-e89b-12d3-a456-426614174000', channelName = 'general' }: { channelId?: string, channelName?: string }) {
  const { messages, sendMessage } = useChat(channelId)
  const [newMessage, setNewMessage] = useState('')

  const handleSend = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newMessage.trim()) {
      sendMessage(newMessage)
      setNewMessage('')
    }
  }

  return (
    <div className="flex-1 bg-[#313338] flex flex-col min-w-0">
      <div className="h-12 flex items-center px-4 shadow-sm border-b border-[#1e1f22]/50 shrink-0">
        <Hash className="w-6 h-6 text-[#80848e] mr-2" />
        <h3 className="font-semibold text-white">{channelName}</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="flex hover:bg-[#2b2d31]/50 p-2 -mx-2 rounded">
            <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center shrink-0 mt-0.5 overflow-hidden">
              {msg.profiles?.avatar_url ? (
                <img src={msg.profiles.avatar_url} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-sm">{msg.profiles?.username?.charAt(0) || '?'}</span>
              )}
            </div>
            <div className="ml-4">
              <div className="flex items-baseline">
                <span className="text-white font-medium mr-2">{msg.profiles?.username || 'Unknown User'}</span>
                <span className="text-xs text-[#80848e]">{new Date(msg.created_at).toLocaleString()}</span>
              </div>
              <p className="text-[#dbdee1] mt-1">{msg.content}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 shrink-0">
        <div className="bg-[#383a40] rounded-lg flex items-center px-4 py-2.5">
          <button className="text-[#b5bac1] hover:text-[#dbdee1]">
            <PlusCircle className="w-6 h-6" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleSend}
            placeholder={`Message #${channelName}`}
            className="flex-1 bg-transparent border-none outline-none text-[#dbdee1] px-4 placeholder-[#80848e]"
          />
          <button className="text-[#b5bac1] hover:text-[#dbdee1]">
            <Smile className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  )
}
