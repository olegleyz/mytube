'use client';

import { useEffect, useRef, useState } from 'react';

// Declare dashjs module for TypeScript
declare global {
  interface Window {
    dashjs: any;
  }
}

interface DashPlayerProps {
  manifestUrl: string;
  posterUrl?: string;
  title: string;
  className?: string;
  autoPlay?: boolean;
  controls?: boolean;
}

export default function DashPlayer({
  manifestUrl,
  posterUrl,
  title,
  className = '',
  autoPlay = false,
  controls = true,
}: DashPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashLoaded, setDashLoaded] = useState(false);

  // Load dash.js library dynamically
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.dashjs) {
      const script = document.createElement('script');
      script.src = 'https://cdn.dashjs.org/latest/dash.all.min.js';
      script.async = true;
      script.onload = () => {
        setDashLoaded(true);
      };
      script.onerror = () => {
        setError('Failed to load dash.js library');
        setIsLoading(false);
      };
      document.head.appendChild(script);
    } else if (window.dashjs) {
      setDashLoaded(true);
    }
  }, []);

  // Initialize dash.js player
  useEffect(() => {
    if (!dashLoaded || !videoRef.current || !manifestUrl) return;

    try {
      // Create dash.js player
      const player = window.dashjs.MediaPlayer().create();
      playerRef.current = player;

      // Configure player settings
      player.updateSettings({
        streaming: {
          abr: {
            autoSwitchBitrate: {
              video: true,
              audio: true,
            },
          },
          buffer: {
            bufferTimeAtTopQuality: 30,
            bufferTimeAtTopQualityLongForm: 60,
          },
        },
      });

      // Set up event listeners
      player.on('streamInitialized', () => {
        console.log('DASH stream initialized');
        setIsLoading(false);
      });

      player.on('error', (e: any) => {
        console.error('DASH player error:', e);
        setError(`Playback error: ${e.error || 'Unknown error'}`);
        setIsLoading(false);
      });

      // Initialize player with video element and manifest
      player.initialize(videoRef.current, manifestUrl, autoPlay);

    } catch (err) {
      console.error('Error initializing DASH player:', err);
      setError('Failed to initialize video player');
      setIsLoading(false);
    }

    // Cleanup function
    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (err) {
          console.error('Error destroying player:', err);
        }
        playerRef.current = null;
      }
    };
  }, [dashLoaded, manifestUrl, autoPlay]);

  // Fallback for non-DASH videos (regular MP4, etc.)
  const isRegularVideo = !manifestUrl.includes('.mpd') && !manifestUrl.includes('.m3u8');

  if (error) {
    return (
      <div className={`bg-gray-900 flex items-center justify-center ${className}`}>
        <div className="text-center text-white p-8">
          <svg
            className="mx-auto h-12 w-12 text-red-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <h3 className="text-lg font-medium mb-2">Video Error</h3>
          <p className="text-sm text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-black ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-10">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-sm">Loading video...</p>
          </div>
        </div>
      )}
      
      <video
        ref={videoRef}
        className="w-full h-full"
        controls={controls}
        poster={posterUrl}
        preload="metadata"
        playsInline
        aria-label={title}
      >
        {isRegularVideo && (
          <>
            <source src={manifestUrl} type="video/mp4" />
            <source src={manifestUrl} type="video/webm" />
          </>
        )}
        <p className="text-white p-4">
          Your browser doesn't support this video format.
          <a href={manifestUrl} className="text-blue-400 underline ml-1">
            Download the video
          </a>
        </p>
      </video>
    </div>
  );
}
