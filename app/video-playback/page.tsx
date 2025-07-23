import db from '#/lib/db';
import Link from 'next/link';
import { format } from 'date-fns';

export default async function VideoPlaybackPage() {
  const videos = db.video.findMany();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Video Library</h1>
        <div className="text-sm text-gray-500">
          {videos.length} video{videos.length !== 1 ? 's' : ''} available
        </div>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No videos</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding a video to your library.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <Link
              key={video.id}
              href={`/video-playback/${video.id}`}
              className="group relative overflow-hidden rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow block"
            >
              {/* Video Thumbnail */}
              <div className="aspect-video bg-gray-200 relative overflow-hidden">
                {video.thumbnailUrl ? (
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gray-300">
                    <svg
                      className="h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
                
                {/* Duration overlay */}
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                  {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                </div>

                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-25">
                  <div className="bg-white bg-opacity-90 rounded-full p-3">
                    <svg
                      className="h-6 w-6 text-gray-900"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Video Info */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-indigo-600">
                  {video.title}
                </h3>
                <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                  {video.description}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>by {video.publisher}</span>
                  <span>{format(new Date(video.uploadDate), 'MMM d, yyyy')}</span>
                </div>
                
                {/* Click indicator */}
                <div className="mt-4 flex items-center justify-center">
                  <div className="text-xs text-gray-500 group-hover:text-indigo-600 transition-colors">
                    Click to watch
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
