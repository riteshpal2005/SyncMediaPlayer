# Changelog

All notable changes to the SyncMediaPlayer project will be documented in this file.

## [0.0.1] - Initial Release / Development

### ✨ Features
- **UI & Layout:**
  - Initialize project with Expo, NativeWind setup, and MMKV storage configuration.
  - Migrate to Expo Router, add NativeWind styling, and implement MMKV-backed theme persistence.
  - Implement tab layout with video, audio, and settings screens.
  - Redesign bottom tabs to be floating with chip and text, then minimal icon-only style.
  - Migrate entire app to Lucide icons.
  - Make dark theme default in global.css and add pitch-black to store.
  - Replace static splash screen with animated SVG triangle.
  - Add transparent icon assets in PNG and SVG formats.
- **Video Player & Browser:**
  - Implement custom Video Player with gesture controls, playback speed toggle, and MaterialIcons.
  - Lock orientation to landscape and hide native controls.
  - Real-time slider scrubbing for video player.
  - Add browse screen to pick media from device folders and hook up to mediaScanner.
  - Implement unified Grid View for videos with smart folder grouping.
  - Track video progress using MMKV.
  - Implement scan on boot and pull-to-refresh.
- **Audio Player & Library:**
  - Implement AudioScreen listing songs with search, sort UI, and favorites system.
  - Implement Audio Player UI with `expo-video` supporting mini dock and background playback.
  - Use Modal for fullscreen audio player with 120fps responsive swipe mechanics (Reanimated/GestureHandler).
  - Add lyrics and visualizer screens with horizontal pager.
  - Implement synced lyrics parser with auto-scrolling flatlist and tap-to-seek.
  - Animate currently playing visualizer based on playing state.
  - Add advanced filename text cleaner for better API matching and fetch high-res album art via iTunes API.
  - Real-time slider scrubbing for audio player.
  - Show audio duration in mini player UI and inline with sliders.

### 🚀 Performance
- Optimize `MaterialTopTabs` for instant interactions (removed swipe delay and deferred rendering).
- Defer heavy modal mounting in `AudioPlayerOverlay` to ensure 60fps expand animations.

### 🐛 Bug Fixes
- **Core & Gestures:**
  - Resolve gesture conflict between pan gesture and scrollview pager (isolated pan gesture to upper modal area).
  - Replace deprecated `runOnJS` with `scheduleOnRN` in worklets to prevent UI thread crashes.
  - Migrate deprecated `PanGestureHandler` to `GestureDetector` API.
  - Replace scrollview with pagerview for jitter-free native paging on Android.
- **UI Tweaks & Edge Cases:**
  - Fix prebuild crash by using PNG instead of SVG for the adaptive app icon.
  - Resolve audio player duration showing `0:00` and move duration to the right side of the card.
  - Align tab bar icons perfectly by rendering invisible text in unfocused state.
  - Use `opacity-0` instead of `text-transparent` for Android compatibility.
  - Fix translucent navbar and global background colors due to CSS variable string unparsing.
  - Add `statusBarTranslucent` to Modal to prevent black status bar on Android.
- **Data & APIs:**
  - Remove broken legacy `react-native-media-meta` module and fallback completely to iTunes API.
  - Update advanced string cleaner to catch mismatched brackets and trailing YouTube IDs.
  - Remove artificial bottom padding clipping lyrics container and increase item height to prevent text clipping.
  - Add `POST_NOTIFICATIONS` permission for Android 14+ background video services.
  - Remove `estimatedItemSize` from FlashList for v2 compatibility.
- **Mass Audits:**
  - Resolved low (L-1 to L-9), medium (M-1 to M-8), high (H-1 to H-9), and critical (C-1 to C-6) priority bugs during mass codebase audit phases.

### 🛠 Refactoring, Styling & Chores
- **Style:**
  - Apply Spotify-like massive extrabold lyrics styling and fix bounding.
  - Lift visualizer up vertically by grouping and applying bottom margin.
  - Remove fixed layout height and implement dynamic padding for constant gap spacing.
  - Replace inline styles with NativeWind classes across the video tab and AudioPlayerOverlay.
- **Chores:**
  - Update app version and configure new adaptive launcher icons.
  - Completely nuke native splash image from `app.json`.
  - Add `clean-codebase.js` script to extract comments to `CODE_COMMENTS.md` (and configured it to ignore `@ts-ignore`).
  - Adjust GitHub Actions workflow for Expo CNG and optimize to build specifically for `arm64-v8a` APK splits.
