'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function useRedirectBackToHome() {
  const router = useRouter();

  useEffect(() => {
    // 1. Push a new entry into the history stack so "Back" doesn't leave the app immediately
    window.history.pushState(null, '', window.location.href);

    // 2. Listen for the 'popstate' event (triggered when back button is pressed)
    const handlePopState = (event: PopStateEvent) => {
      // Prevent the default back action
      event.preventDefault();
      
      // Force redirect to home
      router.replace('/'); 
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [router]);
}