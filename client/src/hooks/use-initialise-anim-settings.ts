import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

export type AnimationPreference = 'always' | 'daily' | 'never';

const PREF_COOKIE = 'initAnimPref';
const LAST_SEEN_COOKIE = 'initAnimLastSeen';

export function useInitAnimPreference() {
  const [preference, setPreferenceState] =
    useState<AnimationPreference>('daily');
  const [shouldPlay, setShouldPlay] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from cookies on mount
  useEffect(() => {
    const savedPref =
      (Cookies.get(PREF_COOKIE) as AnimationPreference) || 'daily';
    const lastSeen = Cookies.get(LAST_SEEN_COOKIE);
    const today = new Date().toISOString().split('T')[0];

    setPreferenceState(savedPref);

    let play = true;

    if (savedPref === 'never') {
      play = false;
    } else if (savedPref === 'daily' && lastSeen === today) {
      play = false;
    }

    setShouldPlay(play);
    setIsLoaded(true);
  }, []);

  const setPreference = (newPref: AnimationPreference) => {
    Cookies.set(PREF_COOKIE, newPref, { expires: 365 });

    const today = new Date().toISOString().split('T')[0] as string;

    let play = true;
    if (newPref === 'never') {
      play = false;
    } else if (newPref === 'daily') {
      // When switching to daily, we usually want to show it today
      play = true;
      Cookies.set(LAST_SEEN_COOKIE, today, { expires: 1 });
    } else {
      // 'always' → clear last seen
      Cookies.remove(LAST_SEEN_COOKIE);
    }

    setPreferenceState(newPref);
    setShouldPlay(play);
  };

  const markAsSeenToday = () => {
    if (preference === 'daily') {
      const today = new Date().toISOString().split('T')[0] as string;
      Cookies.set(LAST_SEEN_COOKIE, today, { expires: 1 });
      setShouldPlay(false);
    }
  };

  return {
    shouldPlay,
    preference,
    setPreference,
    markAsSeenToday,
    isLoaded, // useful to avoid flash before cookie read
  };
}
