import { useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { api } from '../services/apiClient';

export function useShareJourney() {
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const share = useCallback(async (trainId: string, trainName: string) => {
    setIsSharing(true);
    try {
      const result = await api.createShare(trainId);
      const fullUrl = `${window.location.origin}${result.url}`;
      setShareUrl(fullUrl);

      // Check if native Web Share is available
      if (navigator.share && /mobile|android|iphone/i.test(navigator.userAgent)) {
        await navigator.share({
          title: `Track ${trainName} Live on RailGaddi`,
          text: `Follow live journey, route map & delay status for train ${trainName} (${trainId})`,
          url: fullUrl
        });
      } else {
        // Copy to clipboard
        await navigator.clipboard.writeText(fullUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);

        // Confetti celebration
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#3B82F6', '#10B981', '#6366F1']
        });
      }
    } catch (err) {
      console.warn('Share operation cancelled or failed', err);
    } finally {
      setIsSharing(false);
    }
  }, []);

  return {
    share,
    isSharing,
    copied,
    shareUrl
  };
}
