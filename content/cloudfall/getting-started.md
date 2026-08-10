---
title: Getting started
description: Two accounts, one plugin, and the Slack channel. Fifteen minutes, once.
group: start
order: 1
---

Do this before you write any code. The hours you work before Hackatime is
installed can't be counted, and that's the most common way people lose a week.

## 1. Sign up for CloudFall

Use the join button in the header. It takes you to the program's welcome page,
where you'll sign in with your Hack Club account and get added to the round.

If the button isn't there, the round isn't open — the header shows the status,
and the sidebar panel says what happened.

## 2. Join the Slack channel

Everything happens in **#ysws-cloudfall**. Ask your questions there rather than
in DMs — someone else has the same one, and answers in the channel become
answers for everyone.

If you've never used Hack Club Slack, sign up at
[hackclub.com/slack](https://hackclub.com/slack) first.

## 3. Install Hackatime

Hackatime is how your hours get counted. It's a plugin for your editor that
reports what you're working on.

1. Sign in at [hackatime.hackclub.com](https://hackatime.hackclub.com) with your
   Hack Club account.
2. Follow the setup for your editor — VS Code, JetBrains, Neovim and most others
   are supported.
3. Write some code, wait a minute, and check that time is showing up on your
   Hackatime dashboard.

> [!IMPORTANT]
> Untracked time cannot be counted, and it can't be added back later. If you
> notice your editor stopped reporting, say so in the channel *while it's
> happening* rather than at submission time.

## 4. Check what counts as your project

Hackatime reports a project name, taken from your folder name by default. Keep
your CloudFall work in one folder from the start, so the hours line up with the
repo you eventually submit.

```bash
# Fine: one folder, one project name, hours all in one place.
~/code/jukebox/

# Painful at submission time: work spread across three folders that
# Hackatime reports as three unrelated projects.
~/code/test2/
~/Downloads/jukebox-old/
~/Desktop/final-real/
```

## Then what

Pick something to build. [Pick a project](/cloudfall/pick-a-project) is a list of
subscriptions and the open-source thing that replaces each one, including the
port it listens on — which is a surprisingly good way to tell whether a project
is real yet.
