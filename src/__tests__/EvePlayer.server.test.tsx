/*
 * Copyright 2026 ADM Media Consulting SA
 * SPDX-License-Identifier: Apache-2.0
 */
// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { EvePlayer } from '../EvePlayer';

// The player is never constructed during server rendering (effects do not run),
// so a bare class is enough to satisfy the import.
vi.mock('@admmedia/eveplayer', () => ({ EvePlayer: class {} }));

describe('<EvePlayer /> on the server', () => {
  it('renders the container with its className and no layout-effect warning', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    const html = renderToString(<EvePlayer className="frame" />);

    expect(html).toBe('<div class="frame"></div>');
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });
});
