# Using the Secure Player

- Teachers can paste Google Drive share links; the server converts them to direct MP4 links automatically.
- For best protection, convert MP4 to AES-128 HLS and host the playlist and segments behind domain restrictions.
- Student playback uses a Video.js-based player with an anti-download configuration and a moving watermark overlay.

Files:
- components/secure-video-player.tsx — React player (Video.js)
- docs/secure-video-setup.md — end-to-end instructions
- docs/hls-ffmpeg-cheatsheet.md — quick FFmpeg commands
- public/templates/secure-player.html — copy-paste HTML+JS template (replace FILE_ID)

Tip:
- The “no download” experience is best-effort in browsers. Combine with HLS, guarded key delivery, expiring URLs, and Origin/Referer checks for real protection.
