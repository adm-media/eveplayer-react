/*
 * Copyright 2026 ADM Media Consulting SA
 * SPDX-License-Identifier: Apache-2.0
 */

import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { useEvePlayer } from './useEvePlayer';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';
import type { EvePlayerProps, EvePlayerCore } from './types';

/** Splits a `className` string into its class tokens. */
function classTokens(className: string | undefined): string[] {
  return className ? className.split(/\s+/).filter(Boolean) : [];
}

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

    // The player adds its own classes to the container, both when it is created
    // (`vjsp-widescreen`, `vjsp-hide-play`, ...) and while it runs
    // (`vjsp-pip-active`, `vjsp-hidden`, ...). If React owned the `class`
    // attribute, any change to `className` would make it rewrite the attribute
    // as a whole and drop them (a widescreen player collapses to zero width, an
    // open PiP window loses its layout). So React renders only the first value,
    // which never changes, and later values are applied here token by token,
    // touching only the classes that came from this prop.
    const [initialClassName] = useState(props.className);
    const appliedClassNameRef = useRef(props.className);

    // A layout effect applies class changes before paint.
    useIsomorphicLayoutEffect(() => {
      // Always set here: the container is rendered unconditionally.
      const container = containerRef.current as HTMLDivElement;
      const previous = classTokens(appliedClassNameRef.current);
      const next = classTokens(props.className);
      container.classList.remove(...previous.filter((token) => !next.includes(token)));
      container.classList.add(...next.filter((token) => !previous.includes(token)));
      appliedClassNameRef.current = props.className;
    }, [props.className]);

    useImperativeHandle<EvePlayerCore | null, EvePlayerCore | null>(
      ref,
      () => player,
      [player]
    );

    return (
      <div ref={containerRef} className={initialClassName} style={props.style}>
        {props.children}
      </div>
    );
  }
);

export default EvePlayer;
