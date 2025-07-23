'use cache';

import db from '#/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import DashPlayer from '../_components/DashPlayer';

export async function generateStaticParams() {
  const videos = db.video.findMany();

  return videos.map((video) => ({ id: video.id }));
}

interface VideoDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function VideoDetailPage({ params }: VideoDetailPageProps) {
  const { id } = await params;
  const video = db.video.find({ where: { id } });

  if (!video) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <div className="flex items-center gap-4">
        <Link
          href="/video-playback"
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Video Library
        </Link>
      </div>

      {/* Video Player */}
      <div className="space-y-4">
        <DashPlayer
          manifestUrl={video.manifestUrl}
          posterUrl={video.thumbnailUrl}
          title={video.title}
          className="aspect-video rounded-lg overflow-hidden shadow-lg"
          autoPlay={false}
          controls={true}
        />

        {/* Video Info */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{video.title}</h1>
            <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center">
                <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {video.publisher}
              </span>
              <span>•</span>
              <span className="flex items-center">
                <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
{format(new Date(video.uploadDate), 'MMM d, yyyy')}
              </span>
              <span>•</span>
              <span className="flex items-center">
                <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{video.description}</p>
            </div>
          </div>

          {/* Technical Details */}
          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Technical Details</h2>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Video ID:</span>
                <span className="text-sm text-gray-900 font-mono">{video.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Manifest URL:</span>
                <span className="text-sm text-gray-900 font-mono truncate max-w-xs" title={video.manifestUrl}>
                  {video.manifestUrl}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Format:</span>
                <span className="text-sm text-gray-900">
                  {video.manifestUrl.includes('.mpd') ? 'DASH (MPD)' : 
                   video.manifestUrl.includes('.m3u8') ? 'HLS (M3U8)' : 
                   'Regular Video'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation to other videos */}
          {(video.prev || video.next) && (
            <div className="border-t pt-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">More Videos</h2>
              <div className="flex justify-between">
                {video.prev && (
                  <Link
                    href={`/video-playback/${video.prev}`}
                    className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-md transition-colors"
                  >
                    <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous Video
                  </Link>
                )}
                {video.next && (
                  <Link
                    href={`/video-playback/${video.next}`}
                    className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-md transition-colors ml-auto"
                  >
                    Next Video
                    <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
