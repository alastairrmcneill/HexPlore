<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into HexPlore.

## Summary of changes

All 16 analytics events specified in the product brief were already wired up in the codebase using a custom `track()` wrapper. The integration work focused on three areas:

1. **Environment variables** — Created `.env` with `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST`, and created `app.config.js` to expose them via `Constants.expoConfig?.extra` at build time (Expo pattern).

2. **Analytics module** (`lib/analytics/index.ts`) — Removed the hardcoded placeholder API key. The module now reads the token from `Constants.expoConfig?.extra?.posthogProjectToken`, safely disables PostHog when unconfigured, and exports the shared `posthog` client instance for use by the provider.

3. **Root layout** (`app/_layout.tsx`) — Added `PostHogProvider` wrapping the app with the shared client (enables `usePostHog()` hook in any component). Added a `ScreenTracker` component that calls `posthog.screen(pathname)` on every Expo Router navigation change, giving automatic screen-view tracking.

## Events

| Event | Description | File |
|---|---|---|
| `onboarding_started` | Fired when the onboarding screen mounts on first launch | `app/onboarding/index.tsx` |
| `onboarding_screen_viewed` | Fired on each phase change; `{ screen: 1\|2\|3 }` | `app/onboarding/index.tsx` |
| `camera_permission_requested` | Fired when "Scan my photos" is tapped | `app/onboarding/index.tsx` |
| `camera_permission_granted` | Fired when the user grants camera-roll permission | `app/onboarding/index.tsx` |
| `camera_permission_denied` | Fired when the user denies camera-roll permission | `app/onboarding/index.tsx` |
| `scan_completed` | Fired when the scan finishes; `{ photo_count, hex_count, duration_ms }` | `app/onboarding/index.tsx` |
| `results_reveal_viewed` | Fired when the user taps "See results" | `app/onboarding/index.tsx` |
| `app_entered` | Fired when the user enters the main app | `app/onboarding/index.tsx` |
| `map_viewed` | Fired when the map screen mounts | `features/map/MapScreen.tsx` |
| `cell_tapped` | Fired when the user taps a land hex; `{ source: 'visited'\|'empty', country }` | `features/map/MapScreen.tsx` |
| `cell_marked_manual` | Fired when the user manually marks an empty hex as visited | `features/map/MapScreen.tsx` |
| `stats_viewed` | Fired when the stats screen mounts | `features/stats/StatsScreen.tsx` |
| `share_initiated` | Fired when share card capture begins | `features/share/generateShareCard.ts` |
| `share_completed` | Fired after the native share sheet is opened | `features/share/generateShareCard.ts` |
| `settings_viewed` | Fired when the settings screen mounts | `features/settings/SettingsScreen.tsx` |
| `accent_colour_changed` | Fired when the user picks a new accent colour; `{ colour }` | `features/settings/AccentColourPicker.tsx` |

## Next steps

We've built some insights and a dashboard to keep an eye on user behaviour, based on the events instrumented:

- [Analytics basics dashboard](/dashboard/1579994)
- [Onboarding funnel](/insights/ABKP2zPi) — Conversion from `onboarding_started` → permission grant → scan → `app_entered`
- [Daily active users](/insights/HymhroD6) — Unique users opening the map screen per day
- [Feature engagement](/insights/JBszwiCI) — Map vs Stats vs Settings screen visits over time
- [Share conversion](/insights/gWhTcHL5) — `share_initiated` → `share_completed` funnel
- [Camera permission grant rate](/insights/Q106RZiT) — Granted vs denied over time

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
