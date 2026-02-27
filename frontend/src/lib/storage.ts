// A clean local storage utility to persist the user's recent submission IDs

const STORAGE_KEY = 'submission_history';
const MAX_SUBMISSIONS = 50;

/**
 * Retrieves the list of submission IDs from local storage.
 * @returns An array of string IDs, newest first.
 */
export const getSubmissionHistory = (): string[] => {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as string[];
    return [];
  } catch (error) {
    console.error("Failed to parse submission history from local storage", error);
    return [];
  }
};

/**
 * Saves a new submission ID to the top of the history list.
 * Prevents duplicates and trims the history to the last 50 entries.
 * @param id The submission UUID to save.
 */
export const saveSubmissionHistory = (id: string): void => {
  if (typeof window === 'undefined') return;

  try {
    // Get existing history
    const history = getSubmissionHistory();

    // Remove the ID if it already exists to move it to the front
    const filteredHistory = history.filter((existingId) => existingId !== id);

    // Add to the front of the array
    filteredHistory.unshift(id);

    // Limit array size
    const trimmedHistory = filteredHistory.slice(0, MAX_SUBMISSIONS);

    // Save back to local storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error("Failed to save submission to local storage", error);
  }
};
