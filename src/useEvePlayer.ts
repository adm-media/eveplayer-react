/*
 * Copyright 2026 ADM Media Consulting SA
 * SPDX-License-Identifier: Apache-2.0
 */

import { type RefObject, useEffect, useRef, useState } from 'react';
// Imported as `EvePlayerCore`: this package's own `EvePlayer` export is the
// React component below, so the core class needs a different name here (and
// in the public API) to avoid a clash with it.
import { EvePlayer as EvePlayerCore, type PlayerEventMap } from '@admmedia/eveplayer';
import type { EvePlayerCallbacks, EvePlayerProps } from './types';

/** `on()` is exactly typed per event; this is the shape after erasing the generic. */
type BoundEventHandler = Parameters<EvePlayerCore['on']>[1];

/** Maps each `EvePlayerCore` event to the prop that should receive its payload. */
const EVENT_TO_CALLBACK: {
  [K in keyof PlayerEventMap]: keyof EvePlayerCallbacks;
} = {
  play: 'onPlay',
  pause: 'onPause',
  ended: 'onEnded',
  timeupdate: 'onTimeUpdate',
  readystatechange: 'onReadyStateChange',
  loadedmetadata: 'onLoadedMetadata',
  audiotrackchange: 'onAudioTrackChange',
  texttrackchange: 'onTextTrackChange',
  error: 'onError',
  sourceset: 'onSourceSet',
  ratechange: 'onRateChange',
  volumechange: 'onVolumeChange',
  fullscreenchange: 'onFullscreenChange',
  pipchange: 'onPipChange',
  qualitychange: 'onQualityChange',
  renditionchange: 'onRenditionChange',
  chapterentercue: 'onChapterEnterCue',
  gapskip: 'onGapSkip',
  stall: 'onStall',
  dispose: 'onDispose',
};

const EVENT_NAMES = Object.keys(EVENT_TO_CALLBACK) as (keyof PlayerEventMap)[];

/**
 * Creates and drives a single `EvePlayerCore` bound to `containerRef`.
 *
 * The player is constructed once (from `props.options`, captured at first
 * render) and disposed on unmount. The reactive props (`source`, `currentTime`,
 * `loop`, `muted`, `poster`, `bookmarks`) are pushed to the live player as they
 * change. All `on*` callbacks are always read from the latest render, so inline
 * functions don't cause re-subscription.
 *
 * @param containerRef - Ref to the element the player mounts into.
 * @param props - The same props object accepted by {@link EvePlayer}.
 * @returns The player instance, or `null` until it has been created.
 */
export function useEvePlayer(
  containerRef: RefObject<HTMLElement | null>,
  props: EvePlayerProps
): EvePlayerCore | null {
  const { source, currentTime, loop, muted, poster, bookmarks } = props;

  // Options are intentionally read once (the underlying player takes them only
  // at construction). `useState`'s initializer captures the first value and never
  // recomputes, giving a stable reference for the create-once effect.
  const [initialOptions] = useState(() => props.options ?? {});

  const [player, setPlayer] = useState<EvePlayerCore | null>(null);

  // Latest callbacks, refreshed every render so listeners never go stale.
  const callbacksRef = useRef<EvePlayerCallbacks>(props);
  callbacksRef.current = props;

  const lastSourceKey = useRef<string | undefined>(undefined);
  const lastBookmarksKey = useRef<string | undefined>(undefined);

  // --- Create / destroy -----------------------------------------------------
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const instance = new EvePlayerCore(container, initialOptions);

    const offs = EVENT_NAMES.map((event) => {
      const handler = (payload?: unknown): void => {
        const fn = callbacksRef.current[EVENT_TO_CALLBACK[event]] as
          | ((data?: unknown) => void)
          | undefined;
        fn?.(payload);
      };
      instance.on(event, handler as BoundEventHandler);
      return () => instance.off(event, handler as BoundEventHandler);
    });

    setPlayer(instance);
    callbacksRef.current.onReady?.(instance);

    return () => {
      lastSourceKey.current = undefined;
      lastBookmarksKey.current = undefined;
      // dispose() emits 'dispose' before tearing the emitter down, so keep the
      // listeners attached across it (onDispose then fires). The off() calls
      // after are no-ops (the emitter is already cleared) but keep things tidy.
      instance.dispose();
      offs.forEach((off) => off());
      setPlayer(null);
    };
    // `containerRef` is stable; `initialOptions` never changes after first render.
  }, [containerRef, initialOptions]);

  // --- Reactive props -----------------------------------------------------
  useEffect(() => {
    if (!player || !source) return;
    const key = JSON.stringify(source);
    if (key === lastSourceKey.current) return;
    lastSourceKey.current = key;

    if (!source.sources || source.sources.length === 0) {
      player.pause();
      return;
    }
    player.setSource(source);
  }, [player, source]);

  useEffect(() => {
    if (player && currentTime !== undefined) player.currentTime = currentTime;
  }, [player, currentTime]);

  useEffect(() => {
    if (player && loop !== undefined) player.loop = loop;
  }, [player, loop]);

  useEffect(() => {
    if (player && muted !== undefined) player.muted = muted;
  }, [player, muted]);

  useEffect(() => {
    if (player && poster !== undefined) player.setPoster(poster);
  }, [player, poster]);

  useEffect(() => {
    if (!player || !bookmarks) return;
    const key = JSON.stringify(bookmarks);
    if (key === lastBookmarksKey.current) return;
    lastBookmarksKey.current = key;
    player.setBookmarks(bookmarks);
  }, [player, bookmarks]);

  return player;
}
