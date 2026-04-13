'use client'

import { Hash, Volume2 } from 'lucide-react'

export function ChannelList({
  activeChannelId,
  onSelectChannel
}: {
  activeChannelId: string
  onSelectChannel: (id: string, name: string, type: 'text' | 'voice') => void
}) {
  const channels = [
    { id: '123e4567-e89b-12d3-a456-426614174000', name: 'general', type: 'text' as const },
    { id: '123e4567-e89b-12d3-a456-426614174001', name: 'random', type: 'text' as const },
    { id: 'voice-123e4567-e89b-12d3-a456-426614174002', name: 'General Voice', type: 'voice' as const },
  ]

  return (
    <div className="w-60 bg-[#2b2d31] flex flex-col h-full shrink-0">
      <div className="h-12 flex items-center px-4 shadow-sm border-b border-[#1e1f22]/50">
        <h2 className="font-bold text-white truncate">Server Name</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        <div>
          <h3 className="text-xs font-semibold text-[#80848e] uppercase px-2 mb-1">Text Channels</h3>
          <div className="space-y-[2px]">
            {channels.filter(c => c.type === 'text').map(channel => (
              <div
                key={channel.id}
                onClick={() => onSelectChannel(channel.id, channel.name, channel.type)}
                className={`flex items-center px-2 py-1.5 rounded cursor-pointer group ${
                  activeChannelId === channel.id
                    ? 'bg-[#3f4147] text-white'
                    : 'text-[#80848e] hover:text-[#dbdee1] hover:bg-[#3f4147]/50'
                }`}
              >
                <Hash className="w-5 h-5 mr-1.5 opacity-60" />
                <span className="font-medium truncate">{channel.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-[#80848e] uppercase px-2 mb-1">Voice Channels</h3>
          <div className="space-y-[2px]">
            {channels.filter(c => c.type === 'voice').map(channel => (
              <div
                key={channel.id}
                onClick={() => onSelectChannel(channel.id, channel.name, channel.type)}
                className={`flex items-center px-2 py-1.5 rounded cursor-pointer group ${
                  activeChannelId === channel.id
                    ? 'bg-[#3f4147] text-white'
                    : 'text-[#80848e] hover:text-[#dbdee1] hover:bg-[#3f4147]/50'
                }`}
              >
                <Volume2 className="w-5 h-5 mr-1.5 opacity-60" />
                <span className="font-medium truncate">{channel.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="h-[52px] bg-[#232428] flex items-center px-2 shrink-0">
        <div className="flex items-center hover:bg-[#3f4147]/50 p-1 rounded cursor-pointer w-full">
          <div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center shrink-0">
            <span className="text-white text-xs">U</span>
          </div>
          <div className="ml-2 flex-1 min-w-0">
            <div className="text-white text-sm font-semibold truncate leading-tight">Username</div>
            <div className="text-[#80848e] text-xs truncate leading-tight">Online</div>
          </div>
        </div>
      </div>
    </div>
  )
}
