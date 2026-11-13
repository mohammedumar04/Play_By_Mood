import React, { useState } from 'react'
import FacialExpression from './components/FacialExpression'
import MoodSongs from './components/MoodSongs'


const App = () => {

  const [Songs, setSongs] = useState([])
  const [mood, setMood] = useState('')

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#08070c] text-slate-100 selection:bg-violet-500/30">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-44 opacity-80">
        <svg className="h-full w-full" viewBox="0 0 1440 190" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="header-wave" x1="0" x2="1">
              <stop offset="0" stopColor="#5b21b6" stopOpacity="0" />
              <stop offset=".48" stopColor="#a855f7" />
              <stop offset="1" stopColor="#7c3aed" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0 68C158 150 237 4 397 50s212 103 368 31 228-78 368-2 194 70 307-5" fill="none" stroke="url(#header-wave)" strokeWidth="2" />
          <path d="M0 74C158 156 237 10 397 56s212 103 368 31 228-78 368-2 194 70 307-5" fill="none" stroke="#7c3aed" strokeOpacity=".2" strokeWidth="10" />
        </svg>
      </div>

      <header className="relative mx-auto flex max-w-6xl justify-center px-5 pt-6 sm:pt-8">
        <div className="flex items-center gap-3">
          <svg className="h-9 w-9 text-violet-400 drop-shadow-[0_0_12px_rgba(168,85,247,0.65)]" viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <path d="M3 22h5l4-12 7 22 6-17 4 9h8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Play <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">by Mood</span>
          </h1>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-5 pb-36 pt-8 sm:px-8 sm:pt-10">
        <FacialExpression setSongs={setSongs} mood={mood} setMood={setMood} />
        <MoodSongs Songs={Songs} mood={mood} />
      </main>
    </div>
  )
}

export default App
