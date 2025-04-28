
'use client'; // Add this directive

import Link from 'next/link';
import LandingPage from '@/components/feature/landing-page'; // Import the LandingPage component
import { Button } from '@/components/ui/button'; // Import Button
import { UserCheck } from 'lucide-react'; // Import icon

export default function Home() {
  // Render the Landing Page component directly
  return (
     <div>
        <LandingPage />
        {/* Floating Demo Button - Positioned bottom right */}
        <div className="fixed bottom-6 right-6 z-50">
            <Button asChild size="lg" className="shadow-lg">
                 {/* Link directly to login or handle demo login logic */}
                <Link href="/login">
                    {/* Wrap icon and text in a single element */}
                    <span>
                        <UserCheck className="mr-2 h-5 w-5" /> Acessar Conta Demo
                    </span>
                 </Link>
            </Button>
        </div>
    </div>
  );

}
