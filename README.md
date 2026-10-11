# Carom

Carom is a browser paddle duel built around curved shots and banked rebounds. Move a paddle as it strikes to put spin on the ball, then steer rallies through two swaying, rotating obstacles. Play against the AI or share a keyboard for a local two-player match. First to 11 wins by two.

## Run

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. To build the complete static site, run `npm run build` and serve `dist/` at the root of any static web server. `npm run preview` serves that build locally.

## Controls

| Action | Keys |
| --- | --- |
| Left paddle | W / S |
| Right paddle in Versus | Up / Down arrows |
| Menu selection | W / S or Up / Down, then Enter or Space |
| Pause or resume | P or Escape |
| Mute | M |

In Solo, either paddle key pair moves the left paddle. Menus also respond to mouse and touch. On touchscreens, the engine shows on-screen paddle and menu controls.

## Checks

Run `npm run typecheck`, `npm run lint`, `npm run format`, and `npm test` to verify the source. The game uses the supplied Simple 2D engine for timing, input, sound, canvas fitting, and diagnostics. All graphics and audio cues are generated in code.
