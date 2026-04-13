export function Sidebar() {
  const servers = [
    { id: 1, name: 'Home', isHome: true },
    { id: 2, name: 'Gaming Server' },
    { id: 3, name: 'Dev Community' },
  ]

  return (
    <div className="w-[72px] bg-[#1e1f22] flex flex-col items-center py-3 gap-2 h-full z-20 shrink-0">
      {servers.map((server) => (
        <div key={server.id} className="relative group flex items-center justify-center">
          <div className="absolute left-0 w-1 bg-white rounded-r-full transition-all duration-200 h-2 group-hover:h-5" />
          <div className={`w-12 h-12 flex items-center justify-center text-white bg-[#313338] hover:bg-[#5865F2] hover:text-white transition-all duration-200 cursor-pointer ${server.isHome ? 'rounded-[16px]' : 'rounded-[24px] hover:rounded-[16px]'}`}>
            {server.isHome ? (
              <span className="text-xl">🏠</span>
            ) : (
              <span className="text-sm font-medium">{server.name.charAt(0)}</span>
            )}
          </div>
        </div>
      ))}
      <div className="w-8 h-[2px] bg-[#3f4147] rounded-full my-2" />
      <div className="w-12 h-12 flex items-center justify-center text-[#23a559] bg-[#313338] hover:bg-[#23a559] hover:text-white rounded-[24px] hover:rounded-[16px] transition-all duration-200 cursor-pointer">
        <span className="text-2xl font-light">+</span>
      </div>
    </div>
  )
}
