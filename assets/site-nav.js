/* Phones: music store links open in the same tab, so the app launches without leaving a blank tab behind.
   Computers keep opening them in a new window. Runs on its own, before the menu code, and also catches
   links the menu adds later (checked again at tap time). */
(function () {
  var stores = ["open.spotify.com", "music.apple.com", "music.youtube.com", "soundcloud.com"];
  var redirects = ["/spotify/", "/apple/", "/youtube-music/"];

  function isPhone() {
    var ua = navigator.userAgent || "";
    if (/iPhone|iPad|iPod|Android/i.test(ua)) return true;
    if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) return true; /* iPadOS */
    return !!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
  }

  function isMusicLink(a) {
    var raw = a.getAttribute("href");
    if (!raw) return false;
    var url;
    try { url = new URL(raw, location.href); } catch (err) { return false; }
    var host = url.hostname.toLowerCase();
    if (stores.indexOf(host) !== -1) return true;
    if (url.origin !== location.origin) return false;
    var path = url.pathname.replace(/index\.html$/, "");
    if (path.charAt(path.length - 1) !== "/") path += "/";
    return redirects.indexOf(path) !== -1;
  }

  function sameTab(a) {
    if (a.getAttribute("target") === "_blank" && isMusicLink(a)) a.removeAttribute("target");
  }

  function sweep() {
    if (!isPhone()) return;
    var links = document.querySelectorAll("a[target=_blank]");
    for (var i = 0; i < links.length; i++) sameTab(links[i]);
  }

  /* Tap time, capture phase: runs before the browser follows the link and leaves other click handlers alone. */
  document.addEventListener("click", function (event) {
    if (!isPhone()) return;
    var a = event.target && event.target.closest ? event.target.closest("a[href]") : null;
    if (a) sameTab(a);
  }, true);

  /* After the menu code below has built its links (and on sites where it re-adds new-window targets). */
  setTimeout(sweep, 0);
  window.addEventListener("load", sweep);
})();

/* Site menu. Add a destination by appending one entry. The open menu lists every other destination.
   Scores is the shared library for every album. Subscribe confirmation and thank-you pages are not destinations. */
(function () {
  var pages = [
    { href: "/", label: "Album" },
    { href: "https://music.apple.com/us/artist/david-rivera/1325691064?ls=1", label: "Apple Music", blank: true },
    { href: "https://open.spotify.com/artist/5qoC4NXvjfV3cylbXALzV3", label: "Spotify", blank: true },
    { href: "https://www.facebook.com/pianoincolors", label: "Facebook", blank: true, ariaLabel: "David and his Piano on Facebook" },
    { href: "https://www.instagram.com/pianodavid1492/", label: "Instagram", blank: true, ariaLabel: "David Rivera on Instagram" },
    { href: "https://lackadaisicalperfection.com/scores/", label: "Scores", blank: true },
    { href: "https://lackadaisicalperfection.com/about/", label: "About", blank: true }
  ];

  function normalize(path) {
    var p = path || "/";
    var base = location.origin && location.origin !== "null"
      ? location.origin
      : "https://melodicsubtlety.com";
    try {
      p = new URL(p, base).pathname;
    } catch (err) {
      p = "/";
    }
    if (p === "/index.html" || p.slice(-11) === "/index.html") {
      p = p.slice(0, -10);
    }
    if (p.charAt(p.length - 1) !== "/") p += "/";
    return p;
  }

  function excluded(href) {
    var path = normalize(href);
    return path.indexOf("/confirmed") !== -1
      || path.indexOf("/confirm") !== -1
      || path.indexOf("/thank") !== -1;
  }

  function reducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  var streaming = document.querySelectorAll('a[href*="music.apple.com"], a[href*="open.spotify.com"]');
  for (var i = 0; i < streaming.length; i++) {
    streaming[i].target = "_blank";
    streaming[i].rel = "noopener";
  }

  var here = normalize(location.pathname);
  var links = pages.filter(function (page) {
    return !excluded(page.href) && normalize(page.href) !== here;
  });

  var button = document.createElement("button");
  button.type = "button";
  button.className = "nav-toggle";
  button.setAttribute("aria-label", "Open menu");
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-controls", "site-menu");

  var img = document.createElement("img");
  img.src = "/assets/david-with-lp.jpg";
  img.srcset = "/assets/david-with-lp.jpg 1x, /assets/david-with-lp@2x.jpg 2x";
  img.width = 160;
  img.height = 160;
  img.alt = "";
  img.decoding = "async";
  button.appendChild(img);

  var list = document.createElement("ul");
  list.setAttribute("role", "list");
  links.forEach(function (page) {
    var item = document.createElement("li");
    var link = document.createElement("a");
    link.href = page.href;
    link.textContent = page.label;
    if (page.blank) {
      link.target = "_blank";
      link.rel = "noopener";
    }
    if (page.ariaLabel) link.setAttribute("aria-label", page.ariaLabel);
    item.appendChild(link);
    list.appendChild(item);
  });

  var menu = document.createElement("nav");
  menu.id = "site-menu";
  menu.className = "site-menu";
  menu.setAttribute("aria-label", "Pages");
  menu.hidden = true;
  menu.appendChild(list);

  /* Newest first. Domains are each repo's CNAME. The current site is a muted "You're here" row. */
  var albums = [
    { href: "https://lackadaisicalperfection.com/", title: "Lackadaisical Perfection", cover: "lackadaisical-perfection" },
    { href: "https://pianoreveries.com/", title: "Piano Reveries and Phantasies", cover: "piano-reveries" },
    { href: "https://smittenwiththemuses.com/", title: "Smitten with the Muses", cover: "smitten-with-the-muses" },
    { href: "https://whereintheworldisdiane.com/", title: "Where In The World Is Diane", cover: "where-in-the-world-is-diane" },
    { href: "https://cleancalmpiano.com/", title: "Clean Calm Piano", cover: "clean-calm-piano" },
    { href: "https://tantalizingproof.com/", title: "Tantalizing Proof", cover: "tantalizing-proof" },
    { href: "https://pianoincolors.com/", title: "Piano In Colors", cover: "piano-in-colors" },
    { href: "https://melodicsubtlety.com/", title: "Melodic Subtlety – Solo Piano", cover: "melodic-subtlety" }
  ];

  function siteHost() {
    var host = (location.hostname || "").replace(/^www\./i, "").toLowerCase();
    var known = false;
    for (var i = 0; i < albums.length; i++) {
      if (albumHost(albums[i].href) === host) known = true;
    }
    if (known) return host;
    return "melodicsubtlety.com";
  }

  function albumHost(href) {
    try {
      return new URL(href).hostname.replace(/^www\./i, "").toLowerCase();
    } catch (err) {
      return "";
    }
  }

  var albumsWrap = document.createElement("div");
  albumsWrap.className = "menu-albums";

  var albumsLabel = document.createElement("p");
  albumsLabel.className = "menu-albums-label";
  albumsLabel.id = "menu-albums-label";
  albumsLabel.textContent = "Albums";
  albumsWrap.appendChild(albumsLabel);

  var albumsList = document.createElement("ul");
  albumsList.setAttribute("role", "list");
  albumsList.setAttribute("aria-labelledby", "menu-albums-label");

  var hereHost = siteHost();
  albums.forEach(function (album) {
    var item = document.createElement("li");
    var here = albumHost(album.href) === hereHost;
    var row = document.createElement(here ? "div" : "a");
    if (here) {
      row.className = "is-here";
      row.setAttribute("aria-current", "page");
    } else {
      row.href = album.href;
      row.target = "_blank";
      row.rel = "noopener";
    }

    var thumb = document.createElement("img");
    thumb.src = "/assets/albums/" + album.cover + ".jpg";
    thumb.srcset = "/assets/albums/" + album.cover + ".jpg 1x, /assets/albums/" + album.cover + "@2x.jpg 2x";
    thumb.width = 48;
    thumb.height = 48;
    thumb.alt = album.title.split(" \u2013 ")[0].split(" – ")[0] + " album cover";
    thumb.decoding = "async";

    var copy = document.createElement("span");
    copy.className = "album-copy";
    var title = document.createElement("span");
    title.className = "album-title";
    title.textContent = album.title;
    copy.appendChild(title);
    if (here) {
      var note = document.createElement("span");
      note.className = "here-note";
      note.textContent = "You're here";
      copy.appendChild(note);
    }

    row.appendChild(thumb);
    row.appendChild(copy);
    item.appendChild(row);
    albumsList.appendChild(item);
  });

  albumsWrap.appendChild(albumsList);
  menu.appendChild(albumsWrap);

  document.body.appendChild(button);
  document.body.appendChild(menu);

  var generation = 0;
  var open = false;

  function setOpenState(next) {
    open = next;
    button.setAttribute("aria-expanded", next ? "true" : "false");
    button.setAttribute("aria-label", next ? "Close menu" : "Open menu");
  }

  function finishClose(gen) {
    if (gen !== generation || open) return;
    menu.hidden = true;
    if ("inert" in menu) menu.inert = true;
  }

  function openMenu() {
    generation += 1;
    menu.hidden = false;
    if ("inert" in menu) menu.inert = false;
    if (reducedMotion()) {
      menu.classList.add("is-open");
    } else {
      menu.classList.remove("is-open");
      void menu.offsetWidth;
      menu.classList.add("is-open");
    }
    setOpenState(true);
  }

  function closeMenu(restoreFocus) {
    var gen = generation += 1;
    setOpenState(false);
    menu.classList.remove("is-open");
    if ("inert" in menu) menu.inert = true;
    if (reducedMotion()) {
      finishClose(gen);
    } else {
      var timer = setTimeout(function () { finishClose(gen); }, 400);
      menu.addEventListener("transitionend", function onEnd(event) {
        if (event.target !== menu || event.propertyName !== "opacity") return;
        menu.removeEventListener("transitionend", onEnd);
        clearTimeout(timer);
        finishClose(gen);
      });
    }
    if (restoreFocus) button.focus();
  }

  button.addEventListener("click", function (event) {
    event.stopPropagation();
    if (open) closeMenu(false);
    else openMenu();
  });

  document.addEventListener("click", function (event) {
    if (!open) return;
    if (menu.contains(event.target)) return;
    closeMenu(false);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape" || !open) return;
    event.preventDefault();
    closeMenu(true);
  });
})();
