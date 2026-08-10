---
title: Hardware and electronics
description: Electronics count. What to document, and what stands in for a live link when the project is a physical object.
group: build
order: 1
---

Electronics is one of this program's project types, alongside websites and
software. A device, an enclosure, a board, a printed object — all submittable.

## What stands in for a live link

Software submissions need a link a reviewer can open. A physical object obviously
can't offer that, so hardware substitutes evidence that it exists and works:

- **A build video.** Thirty seconds of the thing powered on and doing its job
  beats any amount of description.
- **Schematics.** The circuit, in a form someone else could build from.
- **Photos of the real object**, not just renders — including the messy inside.

Put them in the README, not only in the submission form. The README is what
someone finds later.

## What still has to be open

Open source means the *design*, not only any firmware:

- Schematics and board files, if you made a board.
- CAD source — the `.f3d`, `.step` or `.scad`, not just an exported `.stl`.
- Firmware, with the toolchain and build steps written down.
- A bill of materials, so someone can price the build before starting it.

```
future-radio/
  README.md          ← what it is, the word "future" in it, photos, video link
  LICENSE
  cad/               ← source files, not just exports
  pcb/               ← schematic + board
  firmware/          ← code, with build instructions
  BOM.md             ← what to buy, roughly what it costs
```

## Documenting a build

Write it so a stranger could rebuild it:

1. **What it is**, in one sentence, and which future it's from.
2. **The parts**, with the ones that matter called out (the specific sensor, the
   specific display).
3. **How it goes together** — wiring, pin assignments, the mistake you made first.
4. **How to flash it**, exactly, including the board setting in your toolchain.

> [!WARNING]
> Mains voltage, lithium cells and anything that gets hot deserve real caution.
> If your project involves them, say so in the README, and don't skip the safety
> notes because they're boring — someone will try to build this.

## CAD-only and design projects

A replicated controller shell or a Rams-style dock is a valid project even with no
electronics inside it. The same rules apply: source files in the repo, photos or
renders of the result, the word "future" somewhere a reviewer sees, and hours
tracked in Hackatime while you were modelling.

## Then what

[Devlogs and hours](/future/devlogs-and-hours) covers how time gets counted, which
matters more here than in software — CAD and bench work are easy to do with the
plugin not running.
