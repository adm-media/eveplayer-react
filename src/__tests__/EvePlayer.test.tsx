/*
 * Copyright 2026 ADM Media Consulting SA
 * SPDX-License-Identifier: Apache-2.0
 */
import { createRef } from 'react';
import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EvePlayer } from '../EvePlayer';
import type { EvePlayerCore, PlayerEventMap } from '../types';

// --- Fake EvePlayer --------------------------------------------------------
// jsdom can't run Video.js, so the underlying package is replaced with a
// hand-built double: a real typed emitter plus vi.fn() stubs for the methods the
// wrapper calls. Instances register on globalThis so tests can reach the latest.

type FakePlayer = {
  container: HTMLElement;
  options: unknown;
  disposed: boolean;
  loop: boolean;
  muted: boolean;
  currentTime: number;
  on(e: string, h: (p?: unknown) => void): void;
  off(e: string, h: (p?: unknown) => void): void;
  emit<K extends keyof PlayerEventMap>(e: K, payload?: PlayerEventMap[K]): void;
  setSource: ReturnType<typeof vi.fn>;
  setPoster: ReturnType<typeof vi.fn>;
  setBookmarks: ReturnType<typeof vi.fn>;
  pause: ReturnType<typeof vi.fn>;
  dispose: ReturnType<typeof vi.fn>;
};

declare global {
  // eslint-disable-next-line no-var
  var __evePlayers: FakePlayer[];
}

vi.mock('@admmedia/eveplayer', () => {
  class Fake {
    container: HTMLElement;
    options: unknown;
    disposed = false;
    loop = false;
    muted = false;
    currentTime = 0;
    handlers = new Map<string, Set<(p?: unknown) => void>>();
    setSource = vi.fn();
    setPoster = vi.fn();
    setBookmarks = vi.fn();
    pause = vi.fn();
    dispose = vi.fn(() => {
      this.disposed = true;
      this.emit('dispose');
    });

    constructor(container: HTMLElement, options: unknown) {
      this.container = container;
      this.options = options;
      (globalThis.__evePlayers ??= []).push(this as unknown as FakePlayer);
    }

    on(e: string, h: (p?: unknown) => void) {
      let set = this.handlers.get(e);
      if (!set) this.handlers.set(e, (set = new Set()));
      set.add(h);
    }
    off(e: string, h: (p?: unknown) => void) {
      this.handlers.get(e)?.delete(h);
    }
    emit(e: string, payload?: unknown) {
      this.handlers.get(e)?.forEach((h) => h(payload));
    }
  }
  return { EvePlayer: Fake };
});

const players = (): FakePlayer[] => globalThis.__evePlayers ?? [];
const latest = (): FakePlayer => {
  const list = players();
  return list[list.length - 1];
};

beforeEach(() => {
  globalThis.__evePlayers = [];
});
afterEach(() => {
  vi.clearAllMocks();
});

describe('<EvePlayer />', () => {
  it('creates one player on mount with the given options', () => {
    render(<EvePlayer options={{ widescreen: true }} />);
    expect(players()).toHaveLength(1);
    expect(latest().options).toEqual({ widescreen: true });
    expect(latest().container).toBeInstanceOf(HTMLElement);
  });

  it('applies className and style to the container', () => {
    const { container } = render(
      <EvePlayer className="my-player" style={{ width: 320 }} />
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el).toHaveClass('my-player');
    expect(el.style.width).toBe('320px');
  });

  it('renders children inside the container', () => {
    const { getByTestId } = render(
      <EvePlayer>
        <div data-testid="overlay" />
      </EvePlayer>
    );
    expect(getByTestId('overlay')).toBeInTheDocument();
  });

  it('calls onReady once with the instance', () => {
    const onReady = vi.fn();
    render(<EvePlayer onReady={onReady} />);
    expect(onReady).toHaveBeenCalledTimes(1);
    expect(onReady.mock.calls[0][0]).toBe(latest());
  });

  it('forwards player events to the matching callbacks', () => {
    const onPlay = vi.fn();
    const onTimeUpdate = vi.fn();
    const onError = vi.fn();
    render(
      <EvePlayer onPlay={onPlay} onTimeUpdate={onTimeUpdate} onError={onError} />
    );

    act(() => {
      latest().emit('play');
      latest().emit('timeupdate', { currentTime: 12 });
      latest().emit('error', { code: 4, message: 'boom', category: 'source-unsupported' });
    });

    expect(onPlay).toHaveBeenCalledTimes(1);
    expect(onTimeUpdate).toHaveBeenCalledWith({ currentTime: 12 });
    expect(onError).toHaveBeenCalledWith({
      code: 4,
      message: 'boom',
      category: 'source-unsupported',
    });
  });

  it('always calls the latest callback without re-subscribing', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = render(<EvePlayer onPlay={first} />);
    rerender(<EvePlayer onPlay={second} />);

    act(() => latest().emit('play'));

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('sets the source when it changes and skips an unchanged value', () => {
    const src = {
      sources: [{ src: 'https://example.com/a.m3u8', type: 'application/x-mpegURL' }],
    };
    const { rerender } = render(<EvePlayer source={src} />);
    expect(latest().setSource).toHaveBeenCalledTimes(1);

    // Same value, new object reference -> no extra call.
    rerender(<EvePlayer source={{ ...src, sources: [...src.sources] }} />);
    expect(latest().setSource).toHaveBeenCalledTimes(1);

    rerender(
      <EvePlayer
        source={{ sources: [{ src: 'https://example.com/b.m3u8', type: 'application/x-mpegURL' }] }}
      />
    );
    expect(latest().setSource).toHaveBeenCalledTimes(2);
  });

  it('pauses instead of setting an empty source', () => {
    render(<EvePlayer source={{ sources: [] }} />);
    expect(latest().pause).toHaveBeenCalledTimes(1);
    expect(latest().setSource).not.toHaveBeenCalled();
  });

  it('keeps loop, muted, currentTime and poster in sync', () => {
    const { rerender } = render(
      <EvePlayer loop={false} muted={false} currentTime={0} />
    );
    rerender(<EvePlayer loop muted currentTime={30} poster="p.jpg" />);

    expect(latest().loop).toBe(true);
    expect(latest().muted).toBe(true);
    expect(latest().currentTime).toBe(30);
    expect(latest().setPoster).toHaveBeenCalledWith('p.jpg');
  });

  it('applies bookmarks by value', () => {
    const { rerender } = render(
      <EvePlayer bookmarks={[{ id: 1, offset: 5, content: 'a' }]} />
    );
    expect(latest().setBookmarks).toHaveBeenCalledTimes(1);

    rerender(<EvePlayer bookmarks={[{ id: 1, offset: 5, content: 'a' }]} />);
    expect(latest().setBookmarks).toHaveBeenCalledTimes(1);

    rerender(<EvePlayer bookmarks={[{ id: 2, offset: 9, content: 'b' }]} />);
    expect(latest().setBookmarks).toHaveBeenCalledTimes(2);
  });

  it('exposes the instance through a ref and disposes on unmount', () => {
    const ref = createRef<EvePlayerCore | null>();
    const { unmount } = render(<EvePlayer ref={ref} />);
    const instance = latest();
    expect(ref.current).toBe(instance);

    unmount();
    expect(instance.dispose).toHaveBeenCalledTimes(1);
    expect(ref.current).toBeNull();
  });

  it('calls onDispose on unmount', () => {
    const onDispose = vi.fn();
    const { unmount } = render(<EvePlayer onDispose={onDispose} />);
    unmount();
    expect(onDispose).toHaveBeenCalledTimes(1);
  });
});
