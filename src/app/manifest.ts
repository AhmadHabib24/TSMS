import { MetadataRoute } from 'next';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  let logoUrl = '/favicon.ico';
  let appName = 'TSMS Client App';
  
  try {
    // Assuming backend is running locally at 8000, 
    // In production, you'd use process.env.NEXT_PUBLIC_API_URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    const res = await fetch(`${apiUrl}/api/general-settings`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      if (data.logo_path) {
        logoUrl = `${apiUrl}/storage/${data.logo_path}`;
      }
      if (data.salon_name) {
        appName = data.salon_name;
      }
    }
  } catch (error) {
    console.error('Failed to fetch settings for manifest', error);
  }

  return {
    name: appName,
    short_name: appName,
    description: 'Manage your salon easily with TSMS.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: logoUrl,
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: logoUrl,
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
