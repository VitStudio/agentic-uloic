'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const iceServers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ]
}

export function useWebRTC(channelId: string) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStreams, setRemoteStreams] = useState<{ [key: string]: MediaStream }>({})
  const [connected, setConnected] = useState(false)
  const peersRef = useRef<{ [key: string]: RTCPeerConnection }>({})
  const supabase = createClient()
  const channelRef = useRef<any>(null)

  useEffect(() => {
    if (!channelId) return

    channelRef.current = supabase.channel(`webrtc:${channelId}`, {
      config: {
        broadcast: { ack: true }
      }
    })

    const channel = channelRef.current

    channel
      .on('broadcast', { event: 'webrtc-signal' }, async (payload: any) => {
        const { type, data, from } = payload.payload
        const { data: { user } } = await supabase.auth.getUser()

        if (!user || from === user.id) return

        if (type === 'user-joined') {
          // A new user joined, create an offer
          const peer = createPeer(from, user.id, localStream)
          const offer = await peer.createOffer()
          await peer.setLocalDescription(offer)

          channel.send({
            type: 'broadcast',
            event: 'webrtc-signal',
            payload: { type: 'offer', data: offer, from: user.id, to: from }
          })
        }

        if (payload.payload.to !== user.id) return // Only process targeted messages

        if (type === 'offer') {
          const peer = createPeer(from, user.id, localStream)
          await peer.setRemoteDescription(new RTCSessionDescription(data))
          const answer = await peer.createAnswer()
          await peer.setLocalDescription(answer)

          channel.send({
            type: 'broadcast',
            event: 'webrtc-signal',
            payload: { type: 'answer', data: answer, from: user.id, to: from }
          })
        } else if (type === 'answer') {
          const peer = peersRef.current[from]
          if (peer) {
            await peer.setRemoteDescription(new RTCSessionDescription(data))
          }
        } else if (type === 'ice-candidate') {
          const peer = peersRef.current[from]
          if (peer && data) {
            await peer.addIceCandidate(new RTCIceCandidate(data))
          }
        }
      })
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          setConnected(true)
        }
      })

    return () => {
      leaveVoice()
      supabase.removeChannel(channel)
    }
  }, [channelId, localStream])

  const createPeer = (peerId: string, currentUserId: string, stream: MediaStream | null) => {
    const peer = new RTCPeerConnection(iceServers)
    peersRef.current[peerId] = peer

    if (stream) {
      stream.getTracks().forEach(track => {
        peer.addTrack(track, stream)
      })
    }

    peer.onicecandidate = (event) => {
      if (event.candidate && channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'webrtc-signal',
          payload: { type: 'ice-candidate', data: event.candidate, from: currentUserId, to: peerId }
        })
      }
    }

    peer.ontrack = (event) => {
      setRemoteStreams(prev => ({
        ...prev,
        [peerId]: event.streams[0]
      }))
    }

    return peer
  }

  const joinVoice = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setLocalStream(stream)

      const { data: { user } } = await supabase.auth.getUser()
      if (user && channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'webrtc-signal',
          payload: { type: 'user-joined', from: user.id }
        })
      }
    } catch (err) {
      console.error('Error accessing microphone', err)
    }
  }

  const leaveVoice = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
      setLocalStream(null)
    }

    Object.values(peersRef.current).forEach(peer => peer.close())
    peersRef.current = {}
    setRemoteStreams({})
  }

  return { localStream, remoteStreams, joinVoice, leaveVoice, connected }
}
