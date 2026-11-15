// First-run onboarding flag (PRD §7 step 1). Stored in localStorage so the
// intro shows once per device. Helpers live outside the component file so the
// React Fast Refresh export rule stays satisfied.

const ONBOARDING_KEY = 'keboen-onboarded-v1';

export function hasSeenOnboarding(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === '1';
  } catch {
    return true;
  }
}

export function markOnboardingSeen(): void {
  try {
    localStorage.setItem(ONBOARDING_KEY, '1');
  } catch {
    // Storage unavailable: nothing to persist, safe to ignore.
  }
}
