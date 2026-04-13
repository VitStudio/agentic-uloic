'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { ChannelList } from '@/components/layout/ChannelList'
import { ChatArea } from '@/components/layout/ChatArea'
import { MembersList } from '@/components/layout/MembersList'
import { VoiceArea } from '@/components/chat/VoiceArea'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [activeChannel, setActiveChannel] = useState({
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'general',
    type: 'text' as 'text' | 'voice'
  })

  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setLoading(false)
      }
    }
    checkUser()
  }, [router, supabase])

  if (loading) {
    return <div className="h-screen w-screen bg-[#1e1f22] flex items-center justify-center text-white">Loading...</div>
  }

  return (
    <div className="flex h-screen bg-[#313338] overflow-hidden">
      <Sidebar />
      <ChannelList
        activeChannelId={activeChannel.id}
        onSelectChannel={(id, name, type) => setActiveChannel({ id, name, type })}
      />
      {activeChannel.type === 'text' ? (
        <ChatArea channelId={activeChannel.id} channelName={activeChannel.name} />
      ) : (
        <VoiceArea channelId={activeChannel.id} channelName={activeChannel.name} />
      )}
      <MembersList />
    </div>
  )
}
