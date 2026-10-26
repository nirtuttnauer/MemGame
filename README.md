# MemGame

A browser-based memory matching game built with HTML, CSS, JavaScript, jQuery, and Bootstrap. Choose 5–15 card pairs and one of three image themes: Circles, Dragon Ball, or Anime.

## Run locally

No package installation or build step is required. With Python 3 installed, run from the repository directory:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open <http://127.0.0.1:8000> in a browser. Stop the server with Ctrl+C.

An internet connection is needed to load jQuery and Bootstrap from their CDNs. Card images and application files are included in this repository.

## Play

1. Enter your name, choose a number of pairs between 5 and 15, and select a theme.
2. Select **Start**. The cards are shown for three seconds before being hidden.
3. Select two cards to look for a matching pair. The timer begins with your first selection after the preview; each pair of selections counts as one move.
4. Match all pairs to finish. **Reset** reshuffles the current deck; **Menu** returns to the setup screen.

The leaderboard is stored in your browser's `localStorage`, not on a server. Scores are specific to the browser and origin you use (including the port). **Clear** removes the saved leaderboard.

## Repository layout

- `index.html` — menu, game board, leaderboard, and completion dialog.
- `script.js` — cards, deck, timer, game flow, themes, and local leaderboard.
- `style.css` — game layout and styling.
- `cardBack.jpg` — face-down card image.
- `themes/` — card images for each theme.

## Development checks

If Node.js is installed, check JavaScript syntax without running the game:

```sh
node --check script.js
```

There is currently no automated test suite or package manifest. For a manual smoke test, start a five-pair game, check the preview and matching behavior, then exercise Reset, Menu, and leaderboard clearing.

## Known limitations

- The leaderboard currently saves the formatted timer label rather than a numeric duration, so its time-based ordering is unreliable.
- Resetting or returning to the menu while delayed card callbacks are pending can leave inconsistent game state.
- Player names are interpolated into leaderboard HTML. Use trusted names only; escaping user-provided text is needed before using this as a shared deployment.

These limitations describe the existing implementation; the setup instructions do not imply they have been fixed.
