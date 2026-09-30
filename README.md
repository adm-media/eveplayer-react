# @admmedia/eveplayer-react

The official **React** wrapper for
[`@admmedia/eveplayer`](https://github.com/adm-media/eveplayer) — a
production-grade, framework-agnostic TypeScript player library built on
[Video.js](https://videojs.com/).

Supports **MP4**, **MP3**, **HLS** (`.m3u8`), **MPEG-DASH** (`.mpd`) and **CMAF**
delivered over HLS or DASH manifests. Targets modern evergreen browsers and
Safari (iOS and macOS) — see
[`@admmedia/eveplayer`'s format support matrix](https://github.com/adm-media/eveplayer#format-support-matrix)
for per-format/per-browser caveats (MPEG-DASH on Safari macOS is currently
**unreliable**; prefer HLS there).

The wrapper is deliberately thin: it creates one `EvePlayerCore` per mount,
keeps a handful of reactive props in sync with the live instance, forwards every
player event to an `on*` callback, and hands you the instance through a `ref`.

---

## Installation

```bash
npm install @admmedia/eveplayer-react @admmedia/eveplayer
# or
yarn add @admmedia/eveplayer-react @admmedia/eveplayer
```

`@admmedia/eveplayer`, `react` and `react-dom` are **peer dependencies** —
install them alongside the wrapper.

> | Package                | Version                        | Notes                              |
> |------------------------|--------------------------------|------------------------------------|
> | `@admmedia/eveplayer` | `^1`                           | The player itself (peer dep)       |
> | `react` / `react-dom`  | `^17`, `^18` or `^19`          | Peer deps                          |

### Stylesheet

The wrapper ships **no CSS**. Import the player's stylesheet once, anywhere in
your app (a layout module, `main.tsx`, `_app.tsx`, …):

```ts
import '@admmedia/eveplayer/style.css';
```

---

## Quick start

```tsx
import { EvePlayer } from '@admmedia/eveplayer-react';
import '@admmedia/eveplayer/style.css';

export function Demo() {
  return (
    <EvePlayer
      style={{ maxWidth: 960 }}
      options={{ widescreen: true, autoplay: false, muted: false }}
      source={{
        sources: [
          { src: 'https://example.com/video.m3u8', type: 'application/x-mpegURL' },
        ],
        poster: 'https://example.com/poster.jpg',
      }}
      onPlay={() => console.log('playing')}
      onTimeUpdate={({ currentTime }) => console.log('t =', currentTime)}
      onError={(err) => console.error(err.category, err.code, err.message)}
    />
  );
}
```

---

## Props

Every prop is optional.

### Media & configuration

| Prop | Type | Behaviour |
|------|------|-----------|
| `source` | `SourceDescription` | Media to load. Forwarded to `player.setSource()` **whenever it changes**, compared by value — inline objects are fine. An empty `sources` array pauses the player instead of raising a "no compatible source" error (useful for poster-only placeholders). |
| `options` | `PlayerOptions` | Construction-time options (`widescreen`, `hideControls`, `playbackRates`, `language`, `pip`, `chapters`, …). **Read once**, when the player is created. To apply new options, change the component `key` so it remounts. |
| `currentTime` | `number` | Controlled playback position in seconds. Seeks when it changes. |
| `loop` | `boolean` | Kept in sync with `player.loop` while provided. |
| `muted` | `boolean` | Kept in sync with `player.muted` while provided. |
| `poster` | `string` | Applied via `player.setPoster()` when it changes. |
| `bookmarks` | `Bookmark[]` | Progress-bar markers. Applied via `player.setBookmarks()` when the array changes (compared by value). |

### Container

| Prop | Type | Behaviour |
|------|------|-----------|
| `className` | `string` | Class on the container element the player mounts into. |
| `style` | `CSSProperties` | Inline styles on that container. |
| `children` | `ReactNode` | Rendered inside the container, after Video.js's own DOM — e.g. absolutely-positioned overlays. |

### Event callbacks

Each maps 1:1 to an `EvePlayerCore` event and receives its payload verbatim.
Callbacks are read from the latest render, so passing a fresh inline function
each render is fine — the player is **not** re-subscribed.

| Prop | Payload |
|------|---------|
| `onReady` | `(player: EvePlayerCore)` — fires once, after construction, before any media event |
| `onPlay` | — |
| `onPause` | — |
| `onEnded` | — |
| `onTimeUpdate` | `{ currentTime: number }` |
| `onReadyStateChange` | `{ readyState: number }` |
| `onLoadedMetadata` | `{ size: PlayerSize }` |
| `onAudioTrackChange` | `{ track: AudioTrack }` |
| `onTextTrackChange` | `{ track: TextTrack }` |
| `onError` | `PlayerError` — `{ code, message, category }` |
| `onSourceSet` | `{ source: SourceDescription }` |
| `onRateChange` | `{ playbackRate: number }` |
| `onVolumeChange` | `{ volume: number; muted: boolean }` |
| `onFullscreenChange` | `{ isFullscreen: boolean }` |
| `onPipChange` | `{ isPip: boolean }` |
| `onQualityChange` | `{ level: QualityLevel }` |
| `onChapterEnterCue` | `{ cue: ChapterCue }` |
| `onGapSkip` | `{ from: number; to: number }` |
| `onStall` | `{ duration: number }` |
| `onDispose` | — fires on unmount |

`onGapSkip` and `onStall` are independent streaming-health signals, not always
correlated: `onGapSkip` is VHS auto-correcting a buffer gap on its own (not an error),
`onStall` is playback resuming after any mid-playback rebuffer (gap-related or not). See
[`@admmedia/eveplayer`'s README](https://github.com/adm-media/eveplayer#events) for the
full explanation.

---

## Imperative access (`ref`)

The forwarded `ref` resolves to the live `EvePlayerCore` instance (or `null`
before mount). Use it for anything imperative — seeking, fullscreen, quality
control, reading state:

```tsx
import { useRef } from 'react';
import { EvePlayer, type EvePlayerCore } from '@admmedia/eveplayer-react';

function WithControls() {
  const ref = useRef<EvePlayerCore | null>(null);

  return (
    <>
      <EvePlayer ref={ref} source={/* … */} />
      <button onClick={() => ref.current?.play()}>Play</button>
      <button onClick={() => ref.current?.requestFullscreen()}>Fullscreen</button>
      <button onClick={() => console.log(ref.current?.getQualityLevels())}>
        Log qualities
      </button>
    </>
  );
}
```

`onReady` gives you the same instance if you prefer a callback to a ref.

---

## Hook: `useEvePlayer`

For full control over the container element, use the hook directly. It takes a
ref to the mount element and the same props object as the component, and returns
the instance (or `null` until created):

```tsx
import { useRef } from 'react';
import { useEvePlayer } from '@admmedia/eveplayer-react';
import '@admmedia/eveplayer/style.css';

function CustomShell() {
  const containerRef = useRef<HTMLDivElement>(null);
  const player = useEvePlayer(containerRef, {
    options: { widescreen: true },
    source: { sources: [{ src: '/video.m3u8', type: 'application/x-mpegURL' }] },
    onPlay: () => console.log('playing'),
  });

  return <div ref={containerRef} className="my-player-frame" />;
}
```

`<EvePlayer>` is just this hook plus a `forwardRef` container.

---

## Recipes

### Rebuild with new options

`options` is construction-only. Change the `key` to get a fresh player:

```tsx
<EvePlayer key={language} options={{ language }} source={source} />
```

### Controlled play/pause

Drive playback from the ref in an effect keyed on your own state:

```tsx
useEffect(() => {
  if (!player) return;
  if (shouldPlay) void player.play();
  else player.pause();
}, [player, shouldPlay]);
```

### Chapters drawer

```tsx
<EvePlayer
  source={{ sources, textTracks: [{ kind: 'chapters', src: '/chapters.vtt', srclang: 'en' }] }}
  onChapterEnterCue={({ cue }) => setActiveChapter(cue.id)}
/>
```

---

## SSR / Next.js

The component renders a single `<div>` on the server; the player is created in an
effect, so it is client-only by construction — no `dynamic(..., { ssr: false })`
needed. Just keep the `import '@admmedia/eveplayer/style.css'` in a client
module or your global stylesheet.

---

## TypeScript

Written in TypeScript; types ship in the package. Every public type from
`@admmedia/eveplayer` that appears in a prop signature
(`SourceDescription`, `PlayerOptions`, `PlayerError`, `QualityLevel`,
`AudioTrack`, `TextTrack`, `Bookmark`, `ChapterCue`, `PlayerEventMap`,
`PlayerSize`, `EvePlayerCore`, …) is re-exported from
`@admmedia/eveplayer-react`, so you can import everything from one place.

---

## Versioning

Semantic Versioning. The wrapper tracks the player's major line: `eveplayer-react@1.x`
targets `eveplayer@1.x`.

---

## License

[Apache-2.0](./LICENSE) © ADM Media Consulting SA.

Video.js and `@videojs/http-streaming` are distributed under their own licenses.
