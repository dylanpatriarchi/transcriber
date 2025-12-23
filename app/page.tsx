import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
          AI Transcriber
        </h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
          Securely upload your audio files and get instant transcriptions powered by OpenAI Whisper.
        </p>
        <div className="flex justify-center space-x-4">
          <Link href="/login" className="px-6 py-3 rounded-full bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
