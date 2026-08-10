---
title: Pick a project
description: Start from a line on a bill. Here are the ones people replace most, and what they replace them with.
group: start
order: 2
---

The strongest CloudFall submissions start from something specific: a service, a
price, a month. "A media server" is a category. "The £17.99 I pay Netflix, and
the discs already in the cupboard" is a project.

## Things people rent, and what runs instead

| You pay for | Runs instead | Port | What you actually get |
| --- | --- | --- | --- |
| Netflix | Jellyfin | 8096 | Rip the discs you own, stream them to every screen in the house. Nothing leaves the building. |
| Spotify | Navidrome | 4533 | Your library, your playlists, Subsonic apps on every phone. The album stays yours when the deal expires. |
| Google Photos | Immich | 2283 | Same auto-backup, same face search, on a box in your room instead of a rack in Iowa. |
| iCloud+ | Syncthing | 8384 | Every photo and backup your phone makes, landing on a drive in your house, with no account in the middle. |

That table is a starting point, not the list of allowed projects. The test is in
[what reviewers check](/cloudfall/review): does it replace something proprietary
that people pay for, and is it open source when you're done.

## Ways to make it yours

Installing Jellyfin isn't a project — somebody already built Jellyfin. Building
something *around* the problem is:

- The **thing that's missing** from an existing tool. A phone client for the
  service you run. A migration tool that gets your data out of the paid thing.
- The **glue**. Something that watches a folder, tags what lands in it, and files
  it where three other services can find it.
- The **hardware end**. An antenna that pulls in radio and streams it to your
  network. A sensor that logs something the paid app charges you to see.
- The **subscription nobody has replaced yet**. Gym trackers, recipe apps,
  language courses, parking apps. Look at the last three things that charged
  your card.

> [!TIP]
> Ask in **#ysws-cloudfall** before you commit a week to an idea. "Does this
> count?" gets answered in minutes, and the answer sometimes makes the project
> better rather than smaller.

## Hardware projects

Hardware is in scope as long as it's useful to a homelab or on-prem setup, even
somewhat indirectly — the antenna example above is the canonical one. The same
rules apply: it has to be documented well enough that someone else could build
it, and open source means the schematics and firmware too, not just a photo of
the finished box.

## Scoping it

Aim for something that runs end to end, then make it better. A working thing
with three features beats a beautiful thing that doesn't start — reviewers open
it and use it, so "it runs" is the requirement everything else sits on.
