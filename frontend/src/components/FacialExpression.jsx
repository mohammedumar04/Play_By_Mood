import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import axios from 'axios';

let modelsPromise;

const loadModels = () => {
    if (!modelsPromise) {
        const modelUrl = '/models';
        modelsPromise = Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(modelUrl),
            faceapi.nets.faceExpressionNet.loadFromUri(modelUrl)
        ]).catch((error) => {
            modelsPromise = undefined;
            throw error;
        });
    }

    return modelsPromise;
};

export default function FacialExpression({ setSongs, mood, setMood }) {
    const videoRef = useRef(null);
    const [cameraReady, setCameraReady] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [scanError, setScanError] = useState('');

    useEffect(() => {
        let cancelled = false;
        let stream;
        const video = videoRef.current;

        const initializeDetector = async () => {
            try {
                await loadModels();
                if (cancelled) return;

                if (!navigator.mediaDevices?.getUserMedia) {
                    throw new Error('Camera access is not available in this browser.');
                }

                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (cancelled) {
                    stream.getTracks().forEach((track) => track.stop());
                    return;
                }

                if (!video) throw new Error('The camera preview is unavailable.');
                video.srcObject = stream;
                await video.play();
                if (!cancelled) setCameraReady(true);
            } catch (error) {
                if (!cancelled) {
                    console.error('Unable to initialize the mood detector:', error);
                    setScanError('Allow camera access and make sure the face models are available, then try again.');
                }
            }
        };

        initializeDetector();
        return () => {
            cancelled = true;
            if (stream) stream.getTracks().forEach((track) => track.stop());
            if (video) {
                video.pause();
                video.srcObject = null;
            }
        };
    }, []);

    async function detectMood() {
        if (!cameraReady || !videoRef.current) return;

        setIsAnalyzing(true);
        setScanError('');

        try {
            const detections = await faceapi
                .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                .withFaceExpressions();

            if (!detections || detections.length === 0) {
                setScanError('No face detected. Center your face in the camera and try again.');
                return;
            }

            const bestExpression = Object.entries(detections[0].expressions)
                .sort(([, firstScore], [, secondScore]) => secondScore - firstScore)[0];
            if (!bestExpression) {
                throw new Error('No facial expression scores were returned.');
            }

            const [expression] = bestExpression;
            const expressionName = expression.charAt(0).toUpperCase() + expression.slice(1);
            setMood(expressionName);

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const response = await axios.get(`${apiUrl}/songs`, {
                params: { mood: expression }
            });

            if (!Array.isArray(response.data?.songs)) {
                throw new Error('The songs response did not contain a song list.');
            }

            setSongs(response.data.songs);
        } catch (error) {
            console.error('Unable to detect mood or load recommendations:', error);
            setScanError('We couldn’t analyze your mood. Check your camera and connection, then try again.');
        } finally {
            setIsAnalyzing(false);
        }
    }

    return (
        <section className="grid gap-6 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.65fr)]">
            <div className="group relative aspect-[4/3] overflow-hidden rounded-[1.7rem] border border-white/10 bg-[#17151f] shadow-[0_22px_60px_rgba(0,0,0,0.35)] sm:aspect-video md:aspect-[1.18/1]">
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    className="h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
                <div className="pointer-events-none absolute left-5 top-5 h-8 w-8 rounded-tl-lg border-l-2 border-t-2 border-white/70" />
                <div className="pointer-events-none absolute right-5 top-5 h-8 w-8 rounded-tr-lg border-r-2 border-t-2 border-white/70" />
                <div className="pointer-events-none absolute bottom-5 left-5 h-8 w-8 rounded-bl-lg border-b-2 border-l-2 border-white/70" />
                <div className="pointer-events-none absolute bottom-5 right-5 h-8 w-8 rounded-br-lg border-b-2 border-r-2 border-white/70" />
                <span className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-black/45 px-3 py-1.5 text-xs font-medium text-white/85 backdrop-blur-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400 shadow-[0_0_8px_#e879f9]" />
                    Live camera
                </span>
            </div>

            <div className="flex min-h-[15rem] flex-col justify-center rounded-[1.7rem] border border-white/[0.07] bg-gradient-to-br from-[#15121f] via-[#100f18] to-[#0c0b11] p-6 sm:p-8 lg:p-10">
                <div className="mb-7 inline-flex w-fit items-center gap-2 rounded-full border border-violet-300/10 bg-violet-400/[0.08] px-4 py-2 text-xs font-medium text-violet-100/80" aria-live="polite">
                    <span className="h-2 w-2 rounded-full bg-fuchsia-400 shadow-[0_0_10px_#d946ef]" />
                    {!cameraReady ? 'Starting camera…' : isAnalyzing ? 'Analyzing your mood…' : mood ? 'Mood detected' : 'Ready to analyze your mood'}
                </div>
                <div className="flex items-center gap-5">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-violet-500/80 bg-violet-500/10 text-3xl text-violet-300 shadow-[0_0_30px_rgba(139,92,246,0.2)] sm:h-[4.5rem] sm:w-[4.5rem]">
                        <i className="ri-emotion-happy-line" aria-hidden="true" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-400">{mood ? 'You’re feeling' : 'Your soundtrack, your way'}</p>
                        <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{mood || 'Find your mood'}</h2>
                    </div>
                </div>
                <p className="mt-4 max-w-lg text-sm leading-6 text-slate-400">
                    Let your expression set the tone. We’ll find songs that fit how you feel.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                        className="inline-flex w-fit items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/40 transition duration-200 hover:scale-[1.03] hover:brightness-110 active:scale-95 disabled:cursor-wait disabled:opacity-70 disabled:hover:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#100f18]"
                        onClick={detectMood}
                        disabled={!cameraReady || isAnalyzing}
                        aria-busy={isAnalyzing}
                    >
                        <i className={`text-base ${isAnalyzing || !cameraReady ? 'ri-loader-4-line animate-spin' : 'ri-sparkling-2-line'}`} aria-hidden="true" />
                        {!cameraReady ? 'Starting camera…' : isAnalyzing ? 'Analyzing…' : 'Detect my mood'}
                    </button>
                    {mood && !isAnalyzing && (
                        <span className="inline-flex items-center gap-2 rounded-xl border border-violet-300/20 bg-violet-400/10 px-4 py-3 text-sm font-semibold text-violet-200" aria-live="polite">
                            <i className="ri-emotion-happy-line" aria-hidden="true" />
                            You’re feeling {mood}
                        </span>
                    )}
                </div>
                {scanError && <p className="mt-3 text-sm text-rose-300" role="alert">{scanError}</p>}
            </div>
        </section>
    );
}
