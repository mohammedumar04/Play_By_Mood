import React, { useEffect, useRef, useState } from 'react'

const MoodSongs = ({ Songs = [], mood = '' }) => {
    const audioRef = useRef(null)
    const playbackRequestRef = useRef(0)
    const [selectedSong, setSelectedSong] = useState(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isRepeating, setIsRepeating] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(0.75)
    const [playbackError, setPlaybackError] = useState('')

    const currentTrackIndex = selectedSong === null ? null : Songs.indexOf(selectedSong)
    const currentSong = currentTrackIndex === null || currentTrackIndex < 0 ? null : selectedSong

    useEffect(() => {
        if (audioRef.current) audioRef.current.volume = volume
    }, [volume])

    useEffect(() => {
        const audio = audioRef.current
        playbackRequestRef.current += 1
        audio.pause()
        audio.removeAttribute('src')
        audio.load()
    }, [Songs])

    const startPlayback = async (requestId) => {
        try {
            await audioRef.current.play()
            if (requestId !== playbackRequestRef.current) return
            setIsPlaying(true)
            setPlaybackError('')
        } catch (error) {
            if (requestId !== playbackRequestRef.current || error?.name === 'AbortError') return
            console.error('Unable to play this track:', error)
            setIsPlaying(false)
            setPlaybackError('This track could not be played. Check its audio source and try again.')
        }
    }

    const playTrack = async (index) => {
        const song = Songs[index]
        const audio = audioRef.current

        if (!song?.audio) {
            console.error(`Track "${song?.title ?? 'Unknown'}" has no audio source.`)
            playbackRequestRef.current += 1
            audio.pause()
            setSelectedSong(song ?? null)
            setIsPlaying(false)
            setPlaybackError('This track does not have an audio source.')
            return
        }

        const requestId = ++playbackRequestRef.current
        audio.pause()
        audio.src = song.audio
        audio.loop = isRepeating
        audio.load()
        setSelectedSong(song)
        setCurrentTime(0)
        setDuration(0)
        setPlaybackError('')
        await startPlayback(requestId)
    }

    const handlePlayPause = async (index) => {
        if (currentTrackIndex !== index) {
            await playTrack(index)
            return
        }

        if (isPlaying) {
            playbackRequestRef.current += 1
            audioRef.current.pause()
            setIsPlaying(false)
        } else {
            const requestId = ++playbackRequestRef.current
            await startPlayback(requestId)
        }
    }

    const handleDockPlayPause = async () => {
        if (currentTrackIndex === null || currentTrackIndex < 0) {
            if (Songs.length > 0) await playTrack(0)
            return
        }

        await handlePlayPause(currentTrackIndex)
    }

    const playAdjacentTrack = (direction) => {
        if (Songs.length === 0) return
        const nextIndex = currentTrackIndex === null || currentTrackIndex < 0
            ? 0
            : (currentTrackIndex + direction + Songs.length) % Songs.length
        playTrack(nextIndex)
    }

    const handleSeek = (event) => {
        const time = Number(event.target.value)
        audioRef.current.currentTime = time
        setCurrentTime(time)
    }

    const handleVolumeChange = (event) => {
        const nextVolume = Number(event.target.value)
        audioRef.current.volume = nextVolume
        setVolume(nextVolume)
    }

    const formatTime = (time) => {
        if (!Number.isFinite(time)) return '0:00'
        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time % 60).toString().padStart(2, '0')
        return `${minutes}:${seconds}`
    }

    const coverStyles = [
        'from-orange-300 via-rose-400 to-violet-600',
        'from-sky-300 via-cyan-400 to-blue-600',
        'from-rose-200 via-pink-300 to-orange-300',
        'from-violet-300 via-purple-500 to-indigo-700',
        'from-amber-200 via-yellow-400 to-orange-500',
    ]

    return (
        <>
            <section className="mt-9">
                <div className="mb-4 flex items-end justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300/70">
                            {mood ? `Picked for ${mood}` : 'Made for this moment'}
                        </p>
                        <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">Recommended Tracks</h2>
                    </div>
                    <span className="pb-1 text-xs text-slate-500">{Songs.length} {Songs.length === 1 ? 'track' : 'tracks'}</span>
                </div>
                <div className="divide-y divide-white/[0.07]">
                    {Songs.length > 0 ? Songs.map((song, index) => (
                        <div
                            className={`group flex items-center gap-4 py-2.5 transition hover:bg-white/[0.025] sm:px-2 ${
                                currentTrackIndex === index ? 'bg-violet-400/[0.04]' : ''
                            }`}
                            key={song._id ?? `${song.title}-${song.artist}-${index}`}
                        >
                            <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${coverStyles[index % coverStyles.length]} shadow-lg`}>
                                <span className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(255,255,255,0.55),transparent_35%)]" />
                                <i className="ri-music-2-line relative text-lg text-white/90 drop-shadow" aria-hidden="true" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="truncate text-sm font-medium text-slate-100">{song.title}</h3>
                                <p className="mt-0.5 truncate text-xs text-slate-400">{song.artist}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    className={`flex h-9 w-9 items-center justify-center rounded-full border transition duration-200 hover:scale-105 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
                                        currentTrackIndex === index && isPlaying
                                            ? 'border-violet-400 bg-violet-500 text-white'
                                            : 'border-white/25 text-white hover:border-violet-300 hover:text-violet-200'
                                    }`}
                                    onClick={() => handlePlayPause(index)}
                                    aria-label={`${currentTrackIndex === index && isPlaying ? 'Pause' : 'Play'} ${song.title}`}
                                >
                                    <i className={currentTrackIndex === index && isPlaying ? 'ri-pause-fill' : 'ri-play-fill'} aria-hidden="true" />
                                </button>
                                <span className="flex h-9 w-8 items-center justify-center text-slate-400" aria-hidden="true">
                                    <i className="ri-more-2-fill" />
                                </span>
                            </div>
                        </div>
                    )) : (
                        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-8 text-center">
                            <i className="ri-headphone-line text-2xl text-violet-300/80" aria-hidden="true" />
                            <p className="mt-2 text-sm font-medium text-slate-300">Your recommendations will appear here</p>
                            <p className="mt-1 text-xs text-slate-500">Detect your mood to get your first playlist.</p>
                        </div>
                    )}
                </div>
            </section>

            <div className="fixed inset-x-0 bottom-0 z-10 px-3 pb-3 sm:px-6 sm:pb-5">
                <div className="mx-auto max-w-6xl rounded-2xl border border-white/10 bg-[#15121e]/95 p-3 shadow-[0_12px_55px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:px-5 sm:py-3.5">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${coverStyles[Math.max(currentTrackIndex ?? 0, 0) % coverStyles.length]}`}>
                            <i className="ri-music-2-line text-lg text-white/90" aria-hidden="true" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-white">
                                {currentSong?.title ?? 'Your player is ready'}
                            </p>
                            <p className={`truncate text-xs ${playbackError ? 'text-rose-300' : 'text-slate-400'}`} aria-live="polite">
                                {playbackError || currentSong?.artist || 'Choose a mood to find your next track'}
                            </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1 sm:gap-3">
                            <button
                                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-300 transition hover:bg-white/10 hover:text-white active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
                                onClick={() => playAdjacentTrack(-1)}
                                disabled={Songs.length === 0}
                                aria-label="Previous track"
                            >
                                <i className="ri-skip-back-fill text-lg" aria-hidden="true" />
                            </button>
                            <button
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-500 text-white shadow-lg shadow-violet-950/40 transition hover:scale-105 hover:bg-violet-400 active:scale-90 disabled:cursor-not-allowed disabled:opacity-50"
                                onClick={handleDockPlayPause}
                                disabled={Songs.length === 0}
                                aria-label={isPlaying ? 'Pause track' : 'Play track'}
                            >
                                <i className={isPlaying ? 'ri-pause-fill text-lg' : 'ri-play-fill text-lg'} aria-hidden="true" />
                            </button>
                            <button
                                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-300 transition hover:bg-white/10 hover:text-white active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
                                onClick={() => playAdjacentTrack(1)}
                                disabled={Songs.length === 0}
                                aria-label="Next track"
                            >
                                <i className="ri-skip-forward-fill text-lg" aria-hidden="true" />
                            </button>
                            <button
                                className={`hidden h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10 active:scale-90 sm:flex ${
                                    isRepeating ? 'text-fuchsia-300' : 'text-slate-400 hover:text-white'
                                }`}
                                onClick={() => {
                                    const nextRepeat = !isRepeating
                                    setIsRepeating(nextRepeat)
                                    if (audioRef.current) audioRef.current.loop = nextRepeat
                                }}
                                aria-label={isRepeating ? 'Disable repeat' : 'Repeat track'}
                                aria-pressed={isRepeating}
                            >
                                <i className="ri-repeat-2-line text-base" aria-hidden="true" />
                            </button>
                        </div>
                        <div className="hidden w-28 items-center gap-2 md:flex">
                            <i className={`text-slate-300 ${volume === 0 ? 'ri-volume-mute-line' : 'ri-volume-up-line'}`} aria-hidden="true" />
                            <input
                                className="h-1 w-full cursor-pointer accent-fuchsia-400"
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={handleVolumeChange}
                                aria-label="Volume"
                            />
                        </div>
                        <i className="ri-play-list-2-line hidden text-lg text-slate-300 sm:block" aria-hidden="true" />
                    </div>
                    <div className="mt-2 flex items-center gap-2 sm:mt-3">
                        <span className="w-9 text-right text-[10px] tabular-nums text-slate-500">{formatTime(currentSong ? currentTime : 0)}</span>
                        <input
                            className="h-1 min-w-0 flex-1 cursor-pointer accent-fuchsia-400 disabled:cursor-default disabled:opacity-40"
                            type="range"
                            min="0"
                            max={duration || 0}
                            step="0.1"
                            value={currentSong ? Math.min(currentTime, duration || 0) : 0}
                            onChange={handleSeek}
                            disabled={!currentSong || !duration}
                            aria-label="Track progress"
                        />
                        <span className="w-9 text-[10px] tabular-nums text-slate-500">{formatTime(currentSong ? duration : 0)}</span>
                    </div>
                </div>
            </div>

            <audio
                ref={audioRef}
                preload="metadata"
                onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
                onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
                onPause={(event) => {
                    if (event.currentTarget.paused) setIsPlaying(false)
                }}
                onEnded={() => setIsPlaying(false)}
                onError={(event) => {
                    if (event.currentTarget.currentSrc) {
                        console.error('Audio source failed to load:', event.currentTarget.error)
                        setIsPlaying(false)
                        setPlaybackError('This track could not be loaded. Check its audio URL and try again.')
                    }
                }}
            />
        </>
    )
}

export default MoodSongs
