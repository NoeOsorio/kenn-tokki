# Songs folder

Drop audio files here (`.wav`, `.mp3`, `.m4a`, `.ogg`) to make them playable
from the mixtape.

## How to add a new song

1. Copy the audio file into this folder, e.g. `public/songs/midnight-shibuya.mp3`.
2. Open `src/components/Mixtape.tsx`.
3. Find the `TRACKS` array (around line 5) and add a `src` field to the
   matching entry:

```ts
{
  t: 'Medianoche en Shibuya',
  n: '01',
  sub: 'City Pop ◆ Apertura',
  dur: '3:42',
  src: '/songs/midnight-shibuya.mp3',
},
```

The `src` path is relative to the `public/` folder, so start it with `/songs/`.

## Behavior

- Tracks **with** a `src` are playable — click them or the ▶ Reproducir button.
- Tracks **without** a `src` are dimmed and show "próximamente" when clicked.
- Primary button toggles play/pause. Stop resets the playhead.

## Current songs

| # | Track | File |
|---|-------|------|
| 08 | Feliz Cumpleaños Kenn | `happy-bday-tokki.wav` |

## Tips

- Prefer `.mp3` or `.m4a` over `.wav` for web — much smaller file size.
- Keep each file under ~10 MB so the page loads quickly.
- Filenames: lowercase, hyphens, no spaces.
