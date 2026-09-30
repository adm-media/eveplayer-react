/*
 * Copyright 2026 ADM Media Consulting SA
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * `@admmedia/eveplayer-react`: the official React wrapper for
 * `@admmedia/eveplayer`.
 *
 * Exports the {@link EvePlayer} component, the {@link useEvePlayer} hook, and a
 * re-export of the underlying player's public types. Only what is exported here
 * is public API.
 *
 * The player's stylesheet is not bundled; import it once in your app:
 * `import '@admmedia/eveplayer/style.css'`.
 *
 * @packageDocumentation
 */

export { EvePlayer, default } from './EvePlayer';
export { useEvePlayer } from './useEvePlayer';
export type { EvePlayerProps, EvePlayerCallbacks } from './types';
export type {
  AudioTrack,
  Bookmark,
  ChapterCue,
  EvePlayer as EvePlayerCore,
  PlayerError,
  PlayerEventMap,
  PlayerOptions,
  PlayerSize,
  QualityLevel,
  SourceDescription,
  SourceItem,
  SourceTextTrack,
  TextTrack,
} from '@admmedia/eveplayer';
