/*
 * video-speed-bookmarklet
 
 * Bookmarklet that lifts the playback speed cap on HTML5 video/audio and adds
 * hotkeys to change it. Built for Moodle in Safari on macOS, but it works on
 * any page that uses a plain <video> or <audio> element.
 *
 * Keys:  ]  faster (+0.25x)    [  slower (-0.25x, 0 = paused)    \  reset to 1x
 *
 */
(function () {
  // Guard: don't install twice on the same page.
  if (window.__spd) {
    alert('Speed hotkeys already active on this page.');
    return;
  }

  var STEP = 0.25;
  var MAX = 16;
  var PAUSED_RATE = 0.0625; // lowest rate Safari accepts; used while "paused" at 0

  // ---- Ask for the starting speed and pitch behaviour ---------------------
  var speed = parseFloat(prompt('Starting speed (0 = pause):', '2.5'));
  if (isNaN(speed) || speed < 0) return;

  var keepPitch = confirm(
    'Keep normal pitch?\n\n' +
    'OK = normal pitch (may crackle at high speed)\n' +
    'Cancel = no pitch correction (higher pitch, usually cleaner)'
  );

  // The real setter for playbackRate. Players often reset the rate on their own,
  // so we call this directly and replace the property on each element with a
  // harmless fake (see lockElement) so the page can't undo our value.
  var realRate = Object.getOwnPropertyDescriptor(
    HTMLMediaElement.prototype,
    'playbackRate'
  );

  var pauseTimer;

  // ---- Find media elements, including same-origin iframes -----------------
  function findMedia(doc) {
    var found = [].slice.call(doc.querySelectorAll('video,audio'));
    [].slice.call(doc.querySelectorAll('iframe')).forEach(function (frame) {
      try {
        found = found.concat(findMedia(frame.contentDocument));
      } catch (e) {
        /* cross-origin iframe: not reachable from a bookmarklet */
      }
    });
    return found;
  }

  // ---- On-screen speed badge ----------------------------------------------
  var badge = document.createElement('div');
  badge.style.cssText =
    'position:fixed;top:16px;right:16px;z-index:2147483647;' +
    'background:rgba(0,0,0,.8);color:#fff;' +
    'font:600 20px -apple-system,sans-serif;' +
    'padding:8px 14px;border-radius:8px;' +
    'opacity:0;transition:opacity .2s;pointer-events:none';
  document.body.appendChild(badge);

  var badgeTimer;
  function showBadge(text) {
    badge.textContent = text;
    badge.style.opacity = 1;
    clearTimeout(badgeTimer);
    badgeTimer = setTimeout(function () {
      badge.style.opacity = 0;
    }, 1200);
  }

  // ---- Stop the page from overwriting our playback rate -------------------
  // The page can still read and write el.playbackRate, but it only touches a
  // fake value. We set the real one through realRate.set.
  function lockElement(el) {
    if (el.__lk) return;
    el.__lk = 1;
    var fake = el.playbackRate;
    Object.defineProperty(el, 'playbackRate', {
      configurable: true,
      get: function () { return fake; },
      set: function (n) { fake = n; }
    });
  }

  // ---- Apply the current speed to every media element ---------------------
  function apply() {
    clearInterval(pauseTimer);
    var media = findMedia(document);
    if (!media.length) {
      showBadge('No video found');
      return;
    }

    media.forEach(function (el) {
      lockElement(el);
      el.preservesPitch = keepPitch;
      el.webkitPreservesPitch = keepPitch;

      if (speed === 0) {
        // "Paused": drop to the minimum rate first so a stray resume is
        // nearly frozen, then pause.
        try { realRate.set.call(el, PAUSED_RATE); } catch (e) {}
        el.pause();
        el.__ps = 1;
      } else {
        realRate.set.call(el, speed);
        if (el.__ps) {
          el.__ps = 0;
          var p = el.play();
          if (p && p.catch) p.catch(function () {});
        }
      }
    });

    // While at 0, keep re-pausing in case the player or Safari resumes.
    if (speed === 0) {
      pauseTimer = setInterval(function () {
        findMedia(document).forEach(function (el) {
          if (!el.paused) el.pause();
        });
      }, 100);
    }

    showBadge(speed === 0 ? '⏸ Paused (0x)' : speed + 'x');
  }

  // ---- Hotkeys -------------------------------------------------------------
  function onKey(e) {
    // Ignore keystrokes while typing in a field.
    var t = e.target;
    if (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable)) return;

    var code = e.code;
    if (code === 'BracketRight') speed = Math.min(MAX, speed + STEP);
    else if (code === 'BracketLeft') speed = Math.max(0, speed - STEP);
    else if (code === 'Backslash') speed = 1;
    else return;

    e.preventDefault();
    apply();
  }

  // Listen on the page and on any same-origin iframes so keys work when the
  // video has focus inside a frame.
  function hookKeys(doc) {
    doc.addEventListener('keydown', onKey, true);
    [].slice.call(doc.querySelectorAll('iframe')).forEach(function (frame) {
      try {
        hookKeys(frame.contentDocument);
      } catch (e) {
        /* cross-origin iframe */
      }
    });
  }

  hookKeys(document);
  window.__spd = 1;
  apply();
})();