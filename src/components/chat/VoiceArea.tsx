'use client'

import { useWebRTC } from '@/hooks/useWebRTC'
import { PhoneCall, PhoneOff } from 'lucide-react'

export function VoiceArea({ channelId, channelName }: { channelId: string, channelName: string }) {
  const { localStream, remoteStreams, joinVoice, leaveVoice, connected } = useWebRTC(channelId)

  return (
    <div className="flex-1 bg-[#313338] flex flex-col min-w-0 p-4 items-center justify-center space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">{channelName} Voice</h2>
        <p className="text-[#80848e]">
          {connected ? 'Connected to signaling server' : 'Connecting to signaling server...'}
        </p>
      </div>

      <div className="flex flex-wrap gap-4 justify-center max-w-4xl w-full">
        {/* Local Stream */}
        <div className="w-64 h-64 bg-[#2b2d31] rounded-lg flex flex-col items-center justify-center border-2 border-[#5865F2]">
          <div className="w-20 h-20 bg-[#5865F2] rounded-full flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">You</span>
          </div>
          {localStream ? (
            <p className="text-green-400 text-sm font-medium">Mic Active</p>
          ) : (
            <p className="text-[#80848e] text-sm">Not in voice</p>
          )}
        </div>

        {/* Remote Streams */}
        {Object.entries(remoteStreams).map(([peerId, stream]) => (
          <div key={peerId} className="w-64 h-64 bg-[#2b2d31] rounded-lg flex flex-col items-center justify-center border-2 border-transparent">
            <div className="w-20 h-20 bg-[#23a559] rounded-full flex items-center justify-center mb-4">
              <span className="text-white text-xl">User</span>
            </div>
            <p className="text-[#dbdee1] text-sm">Voice Active</p>
            {/* Auto-play the remote audio stream */}
            <audio
              autoPlay
              ref={audio => {
                if (audio && audio.srcObject !== stream) {
                  audio.srcObject = stream
                }
              }}
            />
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        {!localStream ? (
          <button
            onClick={joinVoice}
            disabled={!connected}
            className="flex items-center gap-2 px-6 py-3 bg-[#23a559] hover:bg-[#1a7f44] text-white rounded-full font-medium transition-colors disabled:opacity-50"
          >
            <PhoneCall size={20} />
            Join Voice
          </button>
        ) : (
          <button
            onClick={leaveVoice}
            className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium transition-colors"
          >
            <PhoneOff size={20} />
            Disconnect
          </button>
        )}
      </div>
    </div>
  )
}
