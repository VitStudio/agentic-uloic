export function MembersList() {
  const members = [
    { id: 1, name: 'Alice', status: 'online' },
    { id: 2, name: 'Bob', status: 'idle' },
    { id: 3, name: 'Charlie', status: 'offline' },
  ]

  return (
    <div className="w-60 bg-[#2b2d31] hidden lg:flex flex-col h-full shrink-0">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <h3 className="text-xs font-semibold text-[#80848e] uppercase mb-2">Online — 2</h3>
          <div className="space-y-[2px]">
            {members.filter(m => m.status !== 'offline').map(member => (
              <div key={member.id} className="flex items-center px-2 py-1.5 rounded hover:bg-[#3f4147]/50 cursor-pointer group">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center">
                    <span className="text-white text-xs">{member.name.charAt(0)}</span>
                  </div>
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#2b2d31] ${member.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                </div>
                <span className="ml-3 font-medium text-[#80848e] group-hover:text-[#dbdee1] truncate">{member.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
