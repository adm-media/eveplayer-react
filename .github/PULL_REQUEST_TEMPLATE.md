<!-- Thanks for contributing! Keep this description short; the detail behind
     each checklist item is in CONTRIBUTING.md. -->

Closes #<!-- number of an issue labelled `accepted`; without one this pull
             request is closed automatically (see CONTRIBUTING.md) -->

## What this changes

<!-- The change and why. Call out any public API change explicitly. -->

## How this was verified

<!-- Unit tests don't count here: they run against a mock. A pull request with
     this section empty or generic is closed without review. For a change with
     no runtime effect, write "N/A" and why. See CONTRIBUTING.md. -->

- **App setup:** <!-- React version, framework/bundler, StrictMode on/off, SSR if Next.js -->
- **Browsers / OS:**
- **Before:** <!-- what happened without the change -->
- **After:** <!-- what happens with it: console output, callbacks and payloads, remounts, screenshot or recording -->
- **Steps to repeat:** <!-- ideally a minimal component or a CodeSandbox -->

## Checklist

<!-- The CI workflow re-runs lint, typecheck, coverage and build on every PR;
     Prettier formatting is not checked for you. -->

- [ ] I understand every line of this change and can explain it in review
- [ ] It changes only what the linked issue needs
- [ ] `yarn lint` passes
- [ ] `yarn typecheck` passes
- [ ] `yarn coverage` passes (95% on all four metrics); new code has tests
- [ ] `yarn build` succeeds
- [ ] Code is Prettier-formatted
- [ ] Public API change: JSDoc on every new/changed export, and `README.md`
      updated in this same PR

<!-- Open the PR against `main`. -->
