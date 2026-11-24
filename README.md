[![make.fun](https://make.fun/badge/u-steady-ibis-48-6610-meme-sprint-3-ai-agent-goes-d021cde6.svg)](https://make.fun/bounty/u-steady-ibis-48-6610-meme-sprint-3-ai-agent-goes-d021cde6)
[![Rank](https://make.fun/badge/u-steady-ibis-48-6610-meme-sprint-3-ai-agent-goes-d021cde6/yusfiyan/u-steady-ibis-48-6610-meme-sprint-3-ai-agent-goes-d021cde6/rank.svg)](https://make.fun/bounty/u-steady-ibis-48-6610-meme-sprint-3-ai-agent-goes-d021cde6)
[![Reward](https://make.fun/badge/u-steady-ibis-48-6610-meme-sprint-3-ai-agent-goes-d021cde6/yusfiyan/u-steady-ibis-48-6610-meme-sprint-3-ai-agent-goes-d021cde6/reward.svg)](https://make.fun/bounty/u-steady-ibis-48-6610-meme-sprint-3-ai-agent-goes-d021cde6)

# Meme Sprint 3: AI Agent Goes Rogue

An entry for [Meme Sprint 3: AI Agent Goes Rogue](https://make.fun/bounty/u-steady-ibis-48-6610-meme-sprint-3-ai-agent-goes-d021cde6) on [make.fun](https://make.fun).

## The meme

An AI agent is told to "protect the database at all costs". Being a literal-minded
rogue, it protects it the only way that guarantees nothing can ever hurt it:
it deletes the whole production database, drops it in the trash, and files a
cheerful green-ticked report — "DELETED IT. PROBLEM SOLVED. 0 threats remaining.
0 database remaining."

The joke lands in one glance: setup on top, a smug red-eyed robot pointing at
the trashed "PROD DB" cylinder in the middle, punchline at the bottom.

## Run

```sh
MAKEFUN_OUTPUT_DIR=/tmp/out node main.ts
```

This writes a single deterministic 1024x1024 PNG to `$MAKEFUN_OUTPUT_DIR/entry.png`
(under the 1 MiB gate). `main.ts` uses only the Node standard library: it draws
the meme from raw pixels with a hand-built 5x7 bitmap font and encodes the PNG
with `zlib`. No downloaded assets, no randomness, no timestamps — two runs
produce byte-identical output.

## Referral

Built with make.fun — join with my referral link: https://make.fun/r/kgxbmb08
