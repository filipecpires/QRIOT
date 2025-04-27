
import LandingPage from '@/components/feature/landing-page'; // Import the LandingPage component

export default function Home() {
  // Render the Landing Page component directly
  return <LandingPage />;

  // 'use client'; // No longer needed here if LandingPage handles client interactions

  // import { useEffect } from 'react';
  // import { useRouter } from 'next/navigation';

  // export default function Home() {
  //   const router = useRouter();

  //   useEffect(() => {
  //     // Redirect to the dashboard page
  //     // In a real app, check auth status before redirecting
  //     router.replace('/dashboard');
  //   }, [router]);

  //   // You can show a loading indicator here if needed
  //   return null;
  // }
}
