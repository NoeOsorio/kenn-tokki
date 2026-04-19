# Songs folder

Drop audio files here to make them playable from the mixtape.

**Ship `.m4a` (AAC) or `.mp3`, not `.wav`.** Cloudflare Pages has a 25 MiB
per-file limit and raw WAVs blow past it quickly (~10 MB/min). A 3-minute
song at 192 kbps AAC is roughly 4 MB, audibly identical for web playback.

### Convert a WAV with macOS's built-in `afconvert`

```sh
afconvert -f m4af -d aac -b 192000 input.wav input.m4a
```

Keep the WAV master outside the repo — `*.wav` in `public/songs/` is
gitignored.

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
