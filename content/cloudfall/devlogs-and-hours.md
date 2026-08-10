---
title: Devlogs and hours
description: How time gets counted, what a devlog is for, and how to keep the two lined up.
group: ship
order: 1
---

Your hours come from Hackatime, and your devlogs are the story attached to them.
Reviewers read both, and they read them together — a project with forty tracked
hours and no visible progress gets questions.

## How hours are counted

Hackatime watches your editor and reports which project you're working on. There
is no manual entry and no retroactive fixing, which is why
[getting set up first](/cloudfall/getting-started) matters so much.

What counts:

- Time in your editor on the project you submit.
- Time spent on the parts that aren't code, when you're editing files — configs,
  compose files, documentation.

What doesn't:

- Time before the plugin was installed.
- Time on a different project, even a related one.
- Reading, planning, and thinking away from the keyboard. Real work, uncounted
  work.

> [!IMPORTANT]
> At most **30%** of the project can be AI-assisted, and you only get credit for
> hours you actually worked. This is checked, and it's the fastest way to have a
> submission rejected outright.

## Devlogs

A devlog is a short post about what you just did. Write one when you finish
something, not on a schedule:

- **What you built.** One or two sentences.
- **What broke.** The specific thing, and what fixed it.
- **A picture.** A screenshot of the working feature, or of the failure if that's
  more interesting.

Good devlogs are short, specific and frequent. "Got the transcoder working —
turns out the container needed `/dev/dri` passed through for hardware decoding"
is worth ten times "worked on video stuff today".

They also make submission trivial: when you've written eight devlogs, your
project description writes itself.

## Keeping the two lined up

Check your Hackatime dashboard once a week and ask whether the hours match the
devlogs. If there's a week with hours and nothing shipped, that's usually a sign
you're stuck on something worth asking about in **#ysws-cloudfall** rather than
grinding at alone.

If the numbers look wrong — a missing day, hours on the wrong project — raise it
in the channel *when you notice it*. It's fixable while it's recent and not
fixable at the end.
