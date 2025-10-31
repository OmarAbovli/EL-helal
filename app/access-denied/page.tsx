import Link from 'next/link';

export default function AccessDeniedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
      <p className="text-lg mb-8">You do not have permission to view this page.</p>
      <Link href="/" className="text-blue-600 hover:underline">
        Go to Home
      </Link>
    </div>
  );
}