import { MetadataRoute } from 'next';
import { sql } from '@/server/db';

// Define a type for the user data we expect from the database
interface User {
  id: string;
  updated_at: Date; // Assuming users table has an updated_at column
}

// Define a type for the video data we expect from the database
interface Video {
  id: string;
  updated_at: Date; // Assuming videos table has an updated_at column
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://el-helal-rpe3.vercel.app/';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/teachers`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/quiz`, // Assuming there's a public quiz listing page
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    // Add other static public pages here
  ];

  // Dynamic Teacher Pages
  let teachers: User[] = [];
  try {
    // Assuming 'users' table contains teachers and has an 'updated_at' column
    // and a 'role' column to filter for teachers.
    teachers = await sql`
      SELECT id, updated_at FROM users WHERE role = 'teacher'
    ` as User[];
  } catch (error) {
    console.error("Failed to fetch teachers for sitemap:", error);
  }

  const teacherPages: MetadataRoute.Sitemap = teachers.map((teacher) => ({
    url: `${baseUrl}/teachers/${teacher.id}`,
    lastModified: teacher.updated_at,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Dynamic Video Pages
  let videos: Video[] = [];
  try {
    // Assuming 'videos' table has an 'updated_at' column
    videos = await sql`
      SELECT id, updated_at FROM videos WHERE is_free = TRUE OR is_public = TRUE -- Adjust condition based on what videos are publicly accessible
    ` as Video[];
  } catch (error) {
    console.error("Failed to fetch videos for sitemap:", error);
  }

  const videoPages: MetadataRoute.Sitemap = videos.map((video) => ({
    url: `${baseUrl}/watch/${video.id}`,
    lastModified: video.updated_at,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticPages, ...teacherPages, ...videoPages];
}
