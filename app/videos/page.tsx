"use client"

import { useState } from "react"

const VIDEOS = [
  { id: 1, title: "What Is Fire? | Combustion Explained", subject: "CHEMISTRY", url: "https://www.youtube.com/embed/tPzO5UObMHs", description: "Discover the science behind fire and what it needs to burn!" },
  { id: 2, title: "States of Matter for Kids", subject: "PHYSICS", url: "https://www.youtube.com/embed/s-V7gK0n2VY", description: "Learn about solids, liquids, and gases with fun animations!" },
  { id: 3, title: "Photosynthesis - How Plants Make Food", subject: "BIOLOGY", url: "https://www.youtube.com/embed/UPdOH2S7cWQ", description: "See how plants turn sunlight into energy!" },
  { id: 4, title: "Chemical Reactions in Everyday Life", subject: "CHEMISTRY", url: "https://www.youtube.com/embed/0dSMzg0U_6w", description: "Chemistry is happening all around you - watch and learn!" },
  { id: 5, title: "Heat Transfer: Conduction, Convection, Radiation", subject: "PHYSICS", url: "https://www.youtube.com/embed/XfGNUoFz1ow", description: "How does heat move? Find out with exciting demonstrations!" },
  { id: 6, title: "The Amazing World of Cells", subject: "BIOLOGY", url: "https://www.youtube.com/embed/URUJD5NEXC8", description: "Zoom into the building blocks of life!" },
]

const SUBJECTS = ["All", "Chemistry", "Physics", "Biology"]

const SUBJECT_EMOJI: Record<string, string> = {
  BIOLOGY: "🌿",
  CHEMISTRY: "🧪",
  PHYSICS: "⚡",
}

const SUBJECT_BADGE: Record<string, string> = {
  BIOLOGY: "bg-emerald-100 text-emerald-700",
  CHEMISTRY: "bg-purple-100 text-purple-700",
  PHYSICS: "bg-blue-100 text-blue-700",
}

export default function VideosPage() {
  const [search, setSearch] = useState("")
  const [activeSubject, setActiveSubject] = useState("All")
  const [playingVideo, setPlayingVideo] = useState<{ id: number; title: string; url: string } | null>(null)
  const [embedError, setEmbedError] = useState(false)

  const filtered = VIDEOS.filter((video) => {
    const matchSearch =
      video.title.toLowerCase().includes(search.toLowerCase()) ||
      video.description.toLowerCase().includes(search.toLowerCase())
    const matchSubject =
      activeSubject === "All" || video.subject === activeSubject.toUpperCase()
    return matchSearch && matchSubject
  })

  function openVideo(video: (typeof VIDEOS)[number]) {
    setEmbedError(false)
    setPlayingVideo({ id: video.id, title: video.title, url: video.url })
  }

  return (
    <main className="min-h-screen bg-[#090A1A]">
      <div className="max-w-7xl mx-auto p-6">
        {/* Hero */}
        <div className="bg-gradient-to-br from-[#8CE600]/20 via-[#12142D] to-[#090A1A] rounded-[3rem] p-10 md:p-16 border border-[#22254F] shadow-2xl mb-12 relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#8CE600]/5 rounded-full blur-3xl" />
          <div className="absolute -left-10 -top-10 w-60 h-60 bg-[#8CE600]/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight text-[#FAF9F6]">
              🎬 Science Video Lab
            </h1>
            <p className="text-[#8888AA] text-lg md:text-xl leading-relaxed max-w-2xl">
              Watch amazing science videos and learn about chemistry, physics, and biology through fun animations and experiments!
            </p>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-10 items-start md:items-center justify-between">
          <div className="relative w-full md:w-96">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">🔍</span>
            <input
              type="text"
              placeholder="Search videos by title or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-[#22254F] bg-[#12142D] text-[#FAF9F6] font-semibold placeholder:text-[#8888AA] focus:outline-none focus:border-[#8CE600] focus:ring-4 focus:ring-[#8CE600]/20 transition-all"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {SUBJECTS.map((subject) => (
              <button
                key={subject}
                onClick={() => setActiveSubject(subject)}
                className={`px-5 py-2.5 rounded-2xl font-black text-sm tracking-wide transition-all ${
                  activeSubject === subject
                    ? "bg-[#8CE600] text-[#090A1A] shadow-lg scale-105"
                    : "bg-[#12142D] border-2 border-[#22254F] text-[#8888AA] hover:border-[#8CE600]/50 hover:text-[#8CE600]"
                }`}
              >
                {subject === "Biology" && "🌿 "}
                {subject === "Chemistry" && "🧪 "}
                {subject === "Physics" && "⚡ "}
                {subject}
              </button>
            ))}
          </div>
        </div>

        {/* Video Grid */}
        <section>
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-6xl block mb-4">🔍</span>
              <p className="text-xl font-black text-[#8888AA]">No videos found</p>
              <p className="text-[#55557A] mt-2 font-medium">Try a different search or category!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((video) => (
                <div
                  key={video.id}
                  className="group relative bg-[#12142D] p-8 rounded-[2rem] border-2 border-[#22254F] shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-[#8CE600]/30"
                >
                  {/* Video Icon */}
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 bg-gradient-to-br from-[#8CE600] to-[#6BBF00]">
                    <span className="drop-shadow-lg">🎥</span>
                  </div>

                  {/* Subject Tag */}
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${SUBJECT_BADGE[video.subject] || "bg-[#22254F] text-[#8888AA]"}`}
                  >
                    {SUBJECT_EMOJI[video.subject]} {video.subject}
                  </span>

                  {/* Title */}
                  <h3 className="text-xl font-black text-[#FAF9F6] mt-4 mb-3">
                    {video.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[#8888AA] font-medium text-sm leading-relaxed line-clamp-3">
                    {video.description}
                  </p>

                  {/* Watch Now Button */}
                  <div className="mt-6">
                    <button
                      onClick={() => openVideo(video)}
                      className="w-full py-3 px-6 rounded-2xl font-black text-sm uppercase tracking-wider bg-[#8CE600] text-[#090A1A] shadow-lg transition-all duration-300 hover:bg-[#A3FF00] hover:shadow-xl active:scale-95"
                    >
                      Watch Now ▶️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Video Modal */}
      {playingVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setPlayingVideo(null)}
        >
          <div
            className="relative w-full max-w-4xl bg-[#12142D] rounded-[2rem] shadow-2xl overflow-hidden border border-[#22254F]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#22254F]">
              <h2 className="text-lg font-black text-[#FAF9F6] truncate pr-4">
                {playingVideo.title}
              </h2>
              <button
                onClick={() => setPlayingVideo(null)}
                className="w-10 h-10 rounded-xl bg-[#22254F] hover:bg-red-500/20 text-[#8888AA] hover:text-red-400 flex items-center justify-center font-black text-lg transition-all shrink-0"
              >
                ✕
              </button>
            </div>

            {/* YouTube Embed */}
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              {embedError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#090A1A] text-center p-8">
                  <span className="text-5xl mb-4">😕</span>
                  <p className="text-[#FAF9F6] font-bold text-lg mb-2">Video unavailable</p>
                  <p className="text-[#8888AA] text-sm max-w-md">This video may be private, removed, or unavailable in your region. Try a different video!</p>
                  <button
                    onClick={() => setPlayingVideo(null)}
                    className="mt-4 px-6 py-2 bg-[#8CE600] text-[#090A1A] font-bold rounded-xl hover:bg-[#A3FF00] transition-all"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <iframe
                  src={`${playingVideo.url}?autoplay=1&mute=1&rel=0`}
                  title={playingVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                  onError={() => setEmbedError(true)}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
