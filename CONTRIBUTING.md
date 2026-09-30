# Contributing to `@admmedia/eveplayer-react`

Thanks for taking the time to contribute! This document describes how to set up
the project, the checks a change has to pass, and how releases work.

By participating in this project you agree to abide by our
[Code of Conduct](./CODE_OF_CONDUCT.md).

## Ways to contribute

- **Report a bug** — open an issue with a minimal reproduction (a CodeSandbox or
  a short component), the React version and bundler, and what you expected vs.
  what happened.
- **Request a feature** — open an issue describing the use case before writing
  code, so we can agree on the prop / hook API shape.
- **Send a pull request** for an issue a maintainer has accepted (see below).

For anything security-sensitive, please do **not** open a public issue. Use
GitHub's *"Report a vulnerability"* (private security advisory) on this
repository instead.

## Scope of this package

This is a thin React wrapper. The player itself — playback, controls, ABR, HLS /
DASH / CMAF support — lives in
[`@admmedia/eveplayer`](https://github.com/adm-media/eveplayer). Bugs in
playback behaviour belong there; bugs in how React props map to the player, in
the lifecycle, or in the TypeScript types belong here.

## Issue first, then pull request

Every pull request from outside the maintainer team must close an issue that a
maintainer has labelled `accepted`. The order is:

1. **Open an issue** (bug report or feature request) and describe the problem
   or the use case. Don't write code yet.
2. **Wait for the `accepted` label.** A maintainer adds it once the problem is
   confirmed and the approach (and, for features, the prop / hook API shape) is
   agreed in the issue. Say in the issue if you'd like to work on it yourself.
3. **Open the pull request** and link the issue in its description with a
   closing keyword (`Closes #123`), or from the pull request's *Development*
   sidebar.

A pull request that is not linked to an open, accepted issue is closed
automatically by the *PR issue gate* workflow. Nothing is lost: once the issue
is accepted, open a new pull request that links it.

Why: reviewing a change costs the maintainers far more time than writing it
costs anyone else. Agreeing on the problem and the approach first keeps that
review time for changes the project can actually take.

Maintainers can let an exceptional pull request through (a one-line typo fix,
say) by adding the `skip-issue-check` label and reopening it.

## Show how you verified it

The unit tests run with the underlying player mocked: they prove how props and
callbacks are wired, not that the component behaves in a real app. So every
pull request that changes runtime behaviour must say, in the *How this was
verified* section of the template, how the change was checked in a real React
app:

- **App setup:** React version, framework or bundler (Vite, Next.js, …),
  whether `StrictMode` was on, and for Next.js whether the component rendered
  through SSR.
- **Browsers:** each browser and OS you tested on.
- **Before and after:** what you observed without the change and with it:
  console output, callbacks fired and their payloads, re-renders or remounts, a
  screenshot or a short recording.
- **Steps:** enough for a maintainer to repeat the check, ideally a minimal
  component or a CodeSandbox.

For a change with no runtime effect (documentation, types only, tooling), write
`N/A` and say why.

A pull request whose verification section is empty, generic ("tested, works")
or cannot be reproduced is closed without a detailed review. Maintainers may
ask about any detail of it; the author is expected to know the answers.

## You own what you submit

How you produce a change is up to you. What matters is that you can stand
behind it:

- You understand every line you submit: what it does, why it is needed, and
  how it fits with the rest of the wrapper.
- You have run it yourself (see
  [Show how you verified it](#show-how-you-verified-it)).
- In review, you can answer questions about it and make the requested changes
  yourself.

A pull request whose author cannot explain it is closed, however good the code
looks.

## What we don't accept

These pull requests are closed, even when they are linked to an accepted
issue:

- **Unrequested refactors or rewrites.** Restructuring code that works
  (renaming, moving or splitting files, swapping one pattern for another)
  unless the accepted issue asks for it.
- **Style-only changes.** Reformatting, reordering imports, rewording comments
  or updating syntax, with no change in behaviour.
- **Dependency updates**, including the supported React versions and the
  `@admmedia/eveplayer` peer range. Maintainers handle them.
- **Changes the linked issue doesn't need.** Keep the pull request to what the
  issue is about; an unrelated fix you noticed on the way needs its own issue.
- **Bulk changes from a tool the project doesn't use**, such as a linter, a
  code scanner or a codemod applied across the codebase.

If you think one of these is worth doing (a refactor that unblocks a feature,
say), open an issue and explain why. It then follows the usual
[issue-first flow](#issue-first-then-pull-request).

## Development setup

Requirements:

- **Node.js 22** (the version CI uses)
- **Yarn 1.x** (classic)

```bash
git clone https://github.com/adm-media/eveplayer-react.git
cd eveplayer-react
yarn install
```

`@admmedia/eveplayer` is a **peer dependency**. For local development it is also
listed in `devDependencies`, so `yarn install` fetches it from npm like any other
package.

### Project layout

| Path | What |
|------|------|
| `src/EvePlayer.tsx` | The `<EvePlayer>` component — a `forwardRef` shell around the hook. |
| `src/useEvePlayer.ts` | All the lifecycle logic: create once, sync reactive props, forward events. |
| `src/types.ts` | Prop / callback types, plus a re-export of the player's public types. |
| `src/index.ts` | Public entry point. Only what is exported here is public API. |
| `src/__tests__/` | Vitest + jsdom + Testing Library. The underlying player is mocked. |

### Branch naming

Branch off `main`, name it `<type>/<short-kebab-case-description>`:

- `feature/` — a new capability or public API addition (e.g. `feature/imperative-seek`)
- `fix/` — a bug fix (e.g. `fix/ref-stale-closure`)
- `docs/` — documentation only, no `src/` change (e.g. `docs/clarify-peer-dep`)
- `chore/` — tooling, CI, dependency bumps — anything with no runtime effect

Keep the description short enough to read in a branch list; it doesn't need to
restate the PR title.

### Scripts

| Command | Purpose |
|---------|---------|
| `yarn build` | Bundle to `dist/` (ESM + CJS + `.d.ts`) with tsup. |
| `yarn build:watch` | `tsup --watch`. |
| `yarn test` | Run the unit tests once. |
| `yarn test:watch` | Watch mode. |
| `yarn coverage` | Run tests with the coverage gate (95% statements / branches / functions / lines). |
| `yarn typecheck` | `tsc --noEmit`. |
| `yarn lint` | ESLint over `src`. |

## Pull request checklist

Before opening a PR, make sure:

- [ ] It closes an issue labelled `accepted` (see
      [Issue first, then pull request](#issue-first-then-pull-request)).
- [ ] The description says how the change was verified in a real React app
      (see [Show how you verified it](#show-how-you-verified-it)).
- [ ] You understand every line of the change and can explain it in review
      (see [You own what you submit](#you-own-what-you-submit)).
- [ ] It changes only what the linked issue needs (see
      [What we don't accept](#what-we-dont-accept)).
- [ ] `yarn lint` passes.
- [ ] `yarn typecheck` passes.
- [ ] `yarn coverage` passes — **95%** minimum on all four metrics. New code needs
      tests; the underlying player is mocked in `src/__tests__/` (see the
      existing suite for the pattern).
- [ ] `yarn build` succeeds.
- [ ] Code is formatted with Prettier (single quotes, semicolons, 100-char width,
      2-space indent, ES5 trailing commas — see `.prettierrc`).
- [ ] **Public API changes** carry JSDoc on every new/changed export, and update
      `README.md` in the same PR.
- [ ] The commit history is readable — imperative, present-tense subject lines
      ("Add …", "Fix …"), one logical change per commit where practical.

Open the PR against the `main` branch. The **PR issue gate** workflow
(`.github/workflows/pr-issue-gate.yml`) checks the linked issue, and the
**CI** workflow
(`.github/workflows/ci.yml`) re-runs `yarn lint`, `yarn typecheck`,
`yarn coverage` and `yarn build` on every PR and push to `main`.
It does **not** check Prettier formatting — run that locally.

## Coding notes

- Keep the wrapper thin. It should not add player behaviour — only translate
  React props, refs and lifecycle into `EvePlayerCore` calls.
- `options` is construction-only, matching the player. Reactive state
  (`source`, `currentTime`, `loop`, `muted`, `poster`, `bookmarks`) is pushed to
  the live instance; everything else means "rebuild via `key`".
- Callbacks are read from a ref so a fresh inline function each render does not
  re-subscribe the player.
- `EvePlayerProps` / `EvePlayerCallbacks` in `src/types.ts` are the public
  surface — keep them stable and typed, and re-export any new player type that
  appears in a prop signature.

## Releases

Releases are cut from `main` by a maintainer, by hand: Actions → Release →
Run workflow, with `version` set to `patch`, `minor`, `major` or an exact
number (or `gh workflow run release.yml -f version=patch`). The **Release**
workflow then, in order:

1. refuses to run from anything but `main`;
2. type-checks and runs the coverage gate;
3. works out the version, bumping from the latest `v*.*.*` tag, and stops if
   that tag already exists;
4. builds and publishes to npm (public, with provenance);
5. only then pushes the `vX.Y.Z` tag and opens a GitHub Release;
6. purges the jsDelivr cache for `@<major>` and `@latest`, so pages loading
   the CDN build by range get the new release right away (best effort).

A failed publish therefore never leaves a tag for a version that does not
exist. Contributors don't need to touch versions: `package.json` is set during
the run and never committed back, so the tags and npm are the record of what
was released.

Starting a workflow by hand needs write access to the repository, which only
maintainers have: that is the gate on what gets published, the same way `main`
only accepts merges through a reviewed, CI-passing pull request. Nobody pushes
`v*` tags by hand; a tag protection rule on `v*.*.*` keeps it that way, since
a stray tag would change what the next bump starts from.

npm is reached through trusted publishing (OIDC), so the repository holds no
npm token.

## License

This project is licensed under the [Apache License 2.0](./LICENSE). Unless you
state otherwise, any contribution you submit for inclusion in the project is
licensed under the same terms, with no additional conditions (Apache-2.0
§5, inbound = outbound).
