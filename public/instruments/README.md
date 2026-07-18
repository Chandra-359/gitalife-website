# Instrument images — Bhajan Clubbing vibe cards

Drop instrument images in this folder and the four cards in the
"The Vibe" section of `/bhajanclubbing` pick them up automatically —
no code changes needed. While an image is missing, the card shows its
line-art glyph instead.

## Expected filenames

| File               | Card               |
| ------------------ | ------------------ |
| `mridanga.png`     | Live kirtan        |
| `kartals.png`      | A sattvic rave     |
| `bansuri.png`      | Free prasadam      |
| `harmonium.png`    | Everyone's invited |

`.webp` and `.jpg` also work (tried in the order `.png` → `.webp` →
`.jpg`), but use one format per instrument.

## Image guidance

- **Transparent background (PNG/WebP) looks best** — the instrument
  floats over the card's dark video window with a soft shadow, like
  the current line art does.
- Roughly square, at least ~480×480px.
- Keep files lean (< 300 KB each) — they load on the main event page.
