
'use client'; // Add this directive

import Link from 'next/link';
import LandingPage from '@/components/feature/landing-page'; // Import the LandingPage component
// import { Button } from '@/components/ui/button'; // No longer needed here
// import { UserCheck } from 'lucide-react'; // No longer needed here

export default function Home() {
  // Render the Landing Page component directly
  return <LandingPage />;

}
