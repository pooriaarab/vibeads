# vibeads brand

## Identity

vibeads is a local npm package for contextual developer-tool discovery.
It adds Claude Code hooks, spinner copy, and a terminal status line.

The product name is always `vibeads` in lowercase.

## Audience

The primary audience is developers who use Claude Code.
They want useful tool suggestions without leaving their coding flow.

## Promise

Match current tool activity and project signals to relevant catalog entries.
Present the match as a short, concrete recommendation.

The package stores its working data in `~/.vibeads/`.
Its matching and impression tracking make no network requests.
Links open external vendor sites only when a user follows them.

## Voice

- Be concise, technical, and direct.
- Lead with the matched tool or detected gap.
- Prefer specific facts over broad praise.
- Explain why a recommendation fits the current context.
- Use `Claude Code` and `a16z` with this capitalization.
- Avoid emojis, urgency, fear, and generic marketing claims.

## Claims

`src/data/portfolio.json` is the product source for catalog copy.
Verify external facts before adding or changing a catalog claim.
Do not turn roadmap ideas in `docs/plans/` into shipped claims.

Do not promise credits unless the selected catalog entry defines them.
Do not claim a click, conversion, or performance result without evidence.
Describe the current `20%` context injection as occasional, not guaranteed.

## Assets

The repository has no graphical logo asset.
Use the lowercase text name as the wordmark.
The CLI uses cyan for a matched company and gray for metadata.
The demo video uses the palette defined in `video/src/theme.ts`.
