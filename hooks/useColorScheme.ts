/**
 * The app is dark-first (Hevy-style). We intentionally ignore the system
 * color scheme so cards, themed text and icons never collapse to the
 * half-finished light palette. See also `app.json` `userInterfaceStyle`.
 */
export function useColorScheme(): 'dark' {
  return 'dark';
}
