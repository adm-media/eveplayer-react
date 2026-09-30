/*
 * Copyright 2026 ADM Media Consulting SA
 * SPDX-License-Identifier: Apache-2.0
 */

import { forwardRef, useImperativeHandle, useRef } from 'react';
import { useEvePlayer } from './useEvePlayer';
import type { EvePlayerProps, EvePlayerCore } from './types';

/**
 * React wrapper around `@admmedia/eveplayer`'s `EvePlayerCore`.
 *
 * Renders a single container element that the player mounts into. The player is
 * created on mount from `options` and disposed on unmount; `source`,
 * `currentTime`, `loop`, `muted`, `poster` and `bookmarks` stay in sync with the
 * live player as they change. Every `on*` prop maps to the matching player event.
 *
 * The forwarded `ref` resolves to the live `EvePlayerCore` instance (or `null`
 * before mount), exposing its full imperative API (`play()`, `requestFullscreen()`,
 * `getQualityLevels()`, and so on).
 *
 * Import the stylesheet once, anywhere in your app:
 * `import '@admmedia/eveplayer/style.css'`.
 *
 * @example
 * ```tsx
 * import { EvePlayer } from '@admmedia/eveplayer-react';
 * import '@admmedia/eveplayer/style.css';
 *
 * function Demo() {
 *   return (
 *     <EvePlayer
 *       options={{ widescreen: true }}
 *       source={{ sources: [{ src: 'https://example.com/video.m3u8', type: 'application/x-mpegURL' }] }}
 *       onPlay={() => console.log('playing')}
 *     />
 *   );
 * }
 * ```
 */
export const EvePlayer = forwardRef<EvePlayerCore | null, EvePlayerProps>(
  function EvePlayer(props, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const player = useEvePlayer(containerRef, props);

    useImperativeHandle<EvePlayerCore | null, EvePlayerCore | null>(
      ref,
      () => player,
      [player]
    );

    return (
      <div ref={containerRef} className={props.className} style={props.style}>
        {props.children}
      </div>
    );
  }
);

export default EvePlayer;
