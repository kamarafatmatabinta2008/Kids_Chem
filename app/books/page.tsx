"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const BOOKS = [
  { id: 1, title: "The Wonders of Biology", author: "Dr. Sarah J. Maas", subject: "BIOLOGY", description: "Explore the amazing world of living things, from microscopic cells to giant whales!", color: "from-emerald-500 to-green-600" },
  { id: 2, title: "Chemistry Magic", author: "Prof. Robert Boyle Jr.", subject: "CHEMISTRY", description: "Discover how atoms dance and molecules mingle to create everything around us!", color: "from-purple-500 to-pink-600" },
  { id: 3, title: "Physics for Future Geniuses", author: "Dr. Lisa R. Einstein", subject: "PHYSICS", description: "Learn about forces, energy, and the secrets of the universe through fun experiments!", color: "from-blue-500 to-cyan-500" },
  { id: 4, title: "Akiola's Animal Kingdom", author: "Akiola Science Press", subject: "BIOLOGY", description: "A colorful journey through the animal kingdom, perfect for young explorers ages 8-14.", color: "from-emerald-600 to-teal-500" },
  { id: 5, title: "Akiola's Periodic Adventure", author: "Akiola Science Press", subject: "CHEMISTRY", description: "Meet the elements! A kid-friendly guide to the periodic table with fun facts about each element.", color: "from-purple-600 to-indigo-500" },
  { id: 6, title: "Akiola's Energy Lab", author: "Akiola Science Press", subject: "PHYSICS", description: "From light to sound to electricity - explore all forms of energy with hands-on activities.", color: "from-blue-600 to-sky-500" },
  { id: 7, title: "Microbe Adventures", author: "Dr. Antonie L.", subject: "BIOLOGY", description: "Zoom into the invisible world of bacteria, viruses, and the tiny life all around us.", color: "from-green-500 to-lime-500" },
  { id: 8, title: "Reaction Revolution", author: "Prof. Marie C.", subject: "CHEMISTRY", description: "Mix, fizz, pop! Learn about chemical reactions you can try at home (with adult supervision!).", color: "from-pink-500 to-rose-500" },
  { id: 9, title: "Space & Beyond", author: "Dr. Carl S. Jr.", subject: "PHYSICS", description: "Blast off into space! Learn about planets, stars, and the mysteries of the cosmos.", color: "from-indigo-500 to-violet-500" },
]

const SUBJECT_EMOJI: Record<string, string> = {
  BIOLOGY: "🌿",
  CHEMISTRY: "🧪",
  PHYSICS: "⚡",
}

const SUBJECTS = ["All", "Biology", "Chemistry", "Physics"]

export default function BooksPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [activeSubject, setActiveSubject] = useState("All")

  const filtered = BOOKS.filter((book) => {
    const matchSearch =
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.description.toLowerCase().includes(search.toLowerCase())
    const matchSubject =
      activeSubject === "All" || book.subject === activeSubject.toUpperCase()
    return matchSearch && matchSubject
  })

  return (
    <main className="min-h-screen bg-[#090A1A]">
      <div className="max-w-7xl mx-auto p-6">
        {/* Hero */}
        <div className="bg-gradient-to-br from-[#8CE600]/20 via-[#12142D] to-[#090A1A] rounded-[3rem] p-10 md:p-16 border border-[#22254F] shadow-2xl mb-12 relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#8CE600]/5 rounded-full blur-3xl" />
          <div className="absolute -left-10 -top-10 w-60 h-60 bg-[#8CE600]/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight text-[#FAF9F6]">
              📚 Science Library
            </h1>
            <p className="text-[#8888AA] text-lg md:text-xl leading-relaxed max-w-2xl">
              Discover amazing science books from the Akiola collection and beyond. Read, learn, and explore!
            </p>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-10 items-start md:items-center justify-between">
          <div className="relative w-full md:w-96">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">🔍</span>
            <input
              type="text"
              placeholder="Search books by title or keyword..."
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

        {/* Book Grid */}
        <section>
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-6xl block mb-4">🔍</span>
              <p className="text-xl font-black text-[#8888AA]">No books found</p>
              <p className="text-[#55557A] mt-2 font-medium">Try a different search or category!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((book) => (
                <div
                  key={book.id}
                  className="group relative bg-[#12142D] p-8 rounded-[2rem] border-2 border-[#22254F] shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-[#8CE600]/30"
                >
                  {/* Book Icon */}
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 bg-gradient-to-br ${book.color}`}
                  >
                    <span className="drop-shadow-lg">📖</span>
                  </div>

                  {/* Subject Tag */}
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                      book.subject === "BIOLOGY"
                        ? "bg-emerald-900/50 text-emerald-300"
                        : book.subject === "CHEMISTRY"
                          ? "bg-purple-900/50 text-purple-300"
                          : "bg-blue-900/50 text-blue-300"
                    }`}
                  >
                    {SUBJECT_EMOJI[book.subject]} {book.subject}
                  </span>

                  {/* Title */}
                  <h3 className="text-xl font-black text-[#FAF9F6] mt-4 mb-1">
                    {book.title}
                  </h3>

                  {/* Author */}
                  <p className="text-[#8888AA] font-bold text-sm mb-3">
                    by {book.author}
                  </p>

                  {/* Description */}
                  <p className="text-[#8888AA] font-medium text-sm leading-relaxed line-clamp-3">
                    {book.description}
                  </p>

                  {/* Read Now Button */}
                  <div className="mt-6">
                    <button
                      onClick={() => router.push(`/books/${book.id}`)}
                      className="w-full py-3 px-6 rounded-2xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transition-all duration-300 hover:from-emerald-500 hover:to-teal-500 hover:shadow-xl active:scale-95"
                    >
                      Read Now 📖
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
