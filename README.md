# Safari Video Speed

A bookmarklet that lifts the 2x playback cap on Moodle (echo360) lectures (and any page with a plain HTML5 video) in Safari on macOS, with hotkeys to change speed on the fly.

**Install page (drag-to-install):** `https://<your-username>.github.io/safari-video-speed/`

### Safari
 
1. Choose **View → Show Favorites Bar**.
2. Open the install page above and drag the **Speed** button onto the Favorites bar.
Doing it by hand instead:
 
1. Bookmark any page and save it to Favorites, named "Speed".
2. Right-click the bookmark → **Edit Address**.
3. Delete the URL and paste the contents of [`dist/bookmarklet.txt`](dist/bookmarklet.txt) as one line.

### Chrome
 
1. Show the bookmarks bar with `Cmd+Shift+B` (`Ctrl+Shift+B` on Windows/Linux).
2. Open the install page above and drag the **Speed** button onto the bookmarks bar.
Doing it by hand instead: right-click the bar → **Add page**, name it "Speed", and paste the contents of [`dist/bookmarklet.txt`](dist/bookmarklet.txt) into the URL field.

## Use

1. Open your video and click **Speed** once per page load.
2. Enter a starting speed, for example `2.5`. A starting speed of `0` begins paused.
3. Choose whether to keep normal pitch (OK) or turn pitch correction off (Cancel).

| Key | Action |
| --- | --- |
| `]` | Faster by 0.25x (up to 16x) |
| `[` | Slower by 0.25x. At 0 the video pauses |
| `\` | Reset to 1x and resume |

A small badge in the top-right corner shows the current speed. Hotkeys are ignored while you're typing in a text field.

## Known limitations

- **Cross-origin iframes:** Videos embedded from another site (Kaltura, Panopto, YouTube) can't be reached by a bookmarklet. Open the video in its own tab or window and run it there.
- **Audio crackling:** High speeds can distort audio in Safari. Choosing **Cancel** on the pitch prompt (no pitch correction) usually helps, or step down with `[`.
- **Per page load:** The hotkeys last until you reload or navigate. Click the bookmarklet again after that.
- **Pause at 0:** While at 0 the video is re-paused every 100 ms, so the player's own play button won't stick. Press `]` or `\` to resume.
- **Tested only in Safari on macOS.** It should work in other browsers, but that is untested.

## How it works

The 2x limit is enforced by the player's UI, not by the browser. The bookmarklet finds every `<video>` and `<audio>` element on the page (including same-origin iframes) and sets `playbackRate` directly. Because players often reset the rate themselves, it replaces the `playbackRate` property on each element with a fake one, so the page's own code can't override the real value.

Read the full, commented source in [`src/speed.js`](src/speed.js) before running it. A bookmarklet runs inside your logged-in session, so it's worth knowing what it does.

## Disclaimer

This tool only changes the local playback rate in your own browser. It doesn't bypass any access controls or download content. Check your institution's policies if you're unsure whether faster playback is acceptable for your course.

## License

[MIT](LICENSE)