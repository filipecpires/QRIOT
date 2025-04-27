
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
// import { signOut } from "firebase/auth"; // Import when Firebase Auth is set up
// import { auth } from "@/lib/firebase"; // Import your Firebase config

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // --- UNCOMMENT AND CONFIGURE FIREBASE LATER ---
        // console.log("Attempting to sign out...");
        // await signOut(auth);
        // console.log("Sign out successful.");
        // --- END FIREBASE BLOCK ---

         // Simulate logout delay
         await new Promise(resolve => setTimeout(resolve, 1000));

        // Redirect to login page after logout (root in this case)
        router.replace('/');
      } catch (error) {
        console.error("Logout failed:", error);
        // Optionally show an error message to the user
        // For now, redirect anyway or show an error page
        router.replace('/'); // Redirect even on error for now
      }
    };

    performLogout();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
       <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Saindo...</p>
    </div>
  );
}
