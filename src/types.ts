/*
 * Copyright 2026 ADM Media Consulting SA
 * SPDX-License-Identifier: Apache-2.0
 */

import type { CSSProperties, ReactNode } from 'react';
// `EvePlayer` (the core class) is imported and re-exported as `EvePlayerCore`:
// this package's own `EvePlayer` is the React component in `./EvePlayer`, so
// the player-instance type needs a different name to avoid a clash.
import type {
  Bookmark,
  EvePlayer as EvePlayerCore,
  PlayerError,
  PlayerEventMap,
  PlayerOptions,
  SourceDescription,
} from '@admmedia/eveplayer';

/**
 * Re-export of the underlying player's public type surface, so consumers can
 * pull every type from `@admmedia/eveplayer-react` without also depending on
 * `@admmedia/eveplayer` directly.
 */
export type {
  AudioTrack,
  Bookmark,
  ChapterCue,
  EvePlayer as EvePlayerCore,
  PlayerError,
  PlaybackStats,
  PlayerErrorCategory,
  PlayerEventMap,
  PlayerOptions,
  PlayerSize,
  QualityLevel,
  SourceDescription,
  SourceItem,
  SourceTextTrack,
  TextTrack,
} from '@admmedia/eveplayer';

/**
 * Event callbacks accepted by {@link EvePlayerProps}. Each maps 1:1 to an
 * `EvePlayerCore` event and receives that event's payload verbatim (see
 * `PlayerEventMap`). Every callback is read from the latest render, so passing
 * a fresh inline function each render is fine (the player is not re-subscribed).
 */
export interface EvePlayerCallbacks {
  /**
   * The `EvePlayerCore` instance has been constructed and attached to the DOM.
   * Fires once per mount, before any media event. Use it to grab the instance
   * for imperative calls (an alternative to the component `ref`).
   */
  onReady?: (player: EvePlayerCore) => void;
  /** Playback started or resumed. */
  onPlay?: () => void;
  /** Playback paused. */
  onPause?: () => void;
  /** Playback reached the end of the media. */
  onEnded?: () => void;
  /** The playback position advanced. */
  onTimeUpdate?: (data: PlayerEventMap['timeupdate']) => void;
  /** The media element's `readyState` changed. */
  onReadyStateChange?: (data: PlayerEventMap['readystatechange']) => void;
  /** Metadata (including intrinsic video size) is available. */
  onLoadedMetadata?: (data: PlayerEventMap['loadedmetadata']) => void;
  /** The active audio track changed. */
  onAudioTrackChange?: (data: PlayerEventMap['audiotrackchange']) => void;
  /** The active subtitle/caption track changed. */
  onTextTrackChange?: (data: PlayerEventMap['texttrackchange']) => void;
  /** A playback error occurred. */
  onError?: (error: PlayerError) => void;
  /** A new source was set on the player. */
  onSourceSet?: (data: PlayerEventMap['sourceset']) => void;
  /** The playback rate changed. */
  onRateChange?: (data: PlayerEventMap['ratechange']) => void;
  /** The volume or muted state changed. */
  onVolumeChange?: (data: PlayerEventMap['volumechange']) => void;
  /** The player entered or left fullscreen. */
  onFullscreenChange?: (data: PlayerEventMap['fullscreenchange']) => void;
  /** The CSS Picture-in-Picture overlay was toggled. */
  onPipChange?: (data: PlayerEventMap['pipchange']) => void;
  /** The quality SELECTION changed: a level was pinned, or ABR was restored. */
  onQualityChange?: (data: PlayerEventMap['qualitychange']) => void;
  /**
   * The rendition actually being played changed, whichever chose it. Compare
   * `level.bitrate` with `previous?.bitrate` for the direction: a step down is
   * the engine reporting that the connection is struggling.
   */
  onRenditionChange?: (data: PlayerEventMap['renditionchange']) => void;
  /** Playback crossed into a chapter cue (`kind: 'chapters'` text track). */
  onChapterEnterCue?: (data: PlayerEventMap['chapterentercue']) => void;
  /** The player auto-seeked over a detected buffer gap. */
  onGapSkip?: (data: PlayerEventMap['gapskip']) => void;
  /** Playback resumed after a mid-playback rebuffer. */
  onStall?: (data: PlayerEventMap['stall']) => void;
  /** The underlying player was disposed (on unmount). */
  onDispose?: () => void;
}

/**
 * Props for the {@link EvePlayer} component.
 *
 * `source`, `currentTime`, `loop`, `muted`, `poster` and `bookmarks` are
 * reactive: changing them updates the live player. `options` is read only once,
 * when the player is created (change the component `key` to rebuild it with
 * new options).
 */
export interface EvePlayerProps extends EvePlayerCallbacks {
  /**
   * Media to load. Forwarded to `player.setSource()` whenever it changes
   * (compared by value, so inline objects are fine). An empty `sources` array
   * pauses the player instead of raising a "no compatible source" error —
   * handy for poster-only placeholders.
   */
  source?: SourceDescription;
  /**
   * Construction-time options for the underlying `EvePlayerCore` (controls,
   * `widescreen`, `playbackRates`, `language`, …). Read once when the player is
   * created; later changes are ignored. Pass a new `key` to the component to
   * rebuild the player with different options.
   */
  options?: PlayerOptions;
  /** Controlled playback position, in seconds. Seeks the player when it changes. */
  currentTime?: number;
  /** Keeps `player.loop` in sync while provided. */
  loop?: boolean;
  /**
   * Keeps `player.muted` in sync while provided. Pushed to the player only when
   * the value changes, so a viewer who unmutes through the control bar stays
   * unmuted (the player never re-mutes itself either); to take mute back under
   * your control, drive this prop from the `onVolumeChange` payload.
   */
  muted?: boolean;
  /** Poster image URL. Applied via `player.setPoster()` when it changes. */
  poster?: string;
  /**
   * Bookmark markers rendered on the progress bar. Applied via
   * `player.setBookmarks()` when the array changes (compared by value).
   */
  bookmarks?: Bookmark[];
  /** Class name for the player container element. */
  className?: string;
  /** Inline styles for the player container element. */
  style?: CSSProperties;
  /**
   * Extra nodes rendered inside the player container, after Video.js's own
   * DOM (e.g. absolutely-positioned overlays or custom UI).
   */
  children?: ReactNode;
}
