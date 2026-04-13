'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type Message = {
  id: string
  content: string
  profile_id: string
  channel_id: string
  created_at: string
  profiles?: { username: string, avatar_url: string | null }
}

export function useChat(channelId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const supabase = createClient()

  useEffect(() => {
    if (!channelId) return

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*, profiles(username, avatar_url)')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true })

      if (data) setMessages(data)
    }

    fetchMessages()

    const channel = supabase
      .channel(`room:${channelId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` },
        async (payload) => {
          // Fetch the profile for the new message
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', payload.new.profile_id)
            .single()

          const newMessage = { ...payload.new, profiles: profile } as Message
          setMessages((prev) => [...prev, newMessage])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [channelId, supabase])

  const sendMessage = async (content: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('messages').insert({
      content,
      channel_id: channelId,
      profile_id: user.id
    })
  }

  return { messages, sendMessage }
}
