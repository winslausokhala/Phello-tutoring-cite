(function () {
  "use strict";

  var DAYS_COUNTED_NEW = 30;

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- mobile nav ---------- */
  var navToggle = document.getElementById("nav-toggle");
  var mainNav = document.getElementById("main-nav");
  navToggle.addEventListener("click", function () {
    var open = mainNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  mainNav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      mainNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- helpers ---------- */
  function formatDate(iso) {
    var d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return iso;
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  function isRecent(iso) {
    var d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return false;
    var diffDays = (Date.now() - d.getTime()) / 86400000;
    return diffDays >= 0 && diffDays <= DAYS_COUNTED_NEW;
  }

  var downloadIcon =
    '<svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
    '<path d="M12 3v12m0 0l-4.5-4.5M12 15l4.5-4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
    "</svg>";

  var previewIcon =
    '<svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
    '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>' +
    '<circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>' +
    "</svg>";

  var noteTypeIcon =
    '<svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
    '<path d="M6 3h9l4 4v14H6V3z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>' +
    '<path d="M9 12h6M9 16h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
    "</svg>";

  var videoTypeIcon =
    '<svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>' +
    '<path d="M10 8.5l6 3.5-6 3.5v-7z" fill="currentColor"/>' +
    "</svg>";

  /* ---------- pdf preview modal ---------- */
  var pdfModal = document.getElementById("pdf-modal");
  var pdfFrame = document.getElementById("pdf-modal-frame");
  var pdfTitle = document.getElementById("pdf-modal-title");
  var pdfDownload = document.getElementById("pdf-modal-download");
  var pdfNewTab = document.getElementById("pdf-modal-newtab");
  var pdfClose = document.getElementById("pdf-modal-close");
  var pdfBackdrop = document.getElementById("pdf-modal-backdrop");
  var lastFocusedEl = null;

  function openPdfPreview(file, title) {
    lastFocusedEl = document.activeElement;
    pdfTitle.textContent = title;
    pdfFrame.src = file;
    pdfDownload.href = file;
    pdfNewTab.href = file;
    pdfModal.hidden = false;
    document.body.style.overflow = "hidden";
    pdfClose.focus();
  }

  function closePdfPreview() {
    pdfModal.hidden = true;
    pdfFrame.src = "";
    document.body.style.overflow = "";
    if (lastFocusedEl) lastFocusedEl.focus();
  }

  pdfClose.addEventListener("click", closePdfPreview);
  pdfBackdrop.addEventListener("click", closePdfPreview);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !pdfModal.hidden) closePdfPreview();
  });

  /* ---------- latest-on-the-shelf (hero) ---------- */
  function renderLatestShelf(courses, videosData) {
    var boardList = document.getElementById("latest-list");

    // Most recent notes (dated, so this sort is exact)
    var noteItems = [];
    courses.forEach(function (course) {
      course.notes.forEach(function (note) {
        noteItems.push({
          type: "note",
          course: course.code,
          title: note.title,
          date: note.date,
          onOpen: function () { openPdfPreview(note.file, course.code + " — " + note.title); }
        });
      });
    });
    noteItems.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });

    // Most recent videos. Videos may not have a "date" yet (older entries) -
    // those fall back to the start of time and simply keep their original
    // file order rather than being treated as more recent than they are.
    var videoItems = (videosData.videos || []).map(function (video) {
      var hasRealId = video.youtubeId && video.youtubeId.indexOf("REPLACE") !== 0;
      var watchUrl = hasRealId
        ? "https://www.youtube.com/watch?v=" + video.youtubeId
        : videosData.channelUrl;
      return {
        type: "video",
        course: video.course || "",
        title: video.title,
        date: video.date || null,
        href: watchUrl
      };
    });
    videoItems.sort(function (a, b) {
      var da = a.date ? new Date(a.date) : new Date(0);
      var db = b.date ? new Date(b.date) : new Date(0);
      return db - da;
    });

    // Take the most recent of each so videos are always represented,
    // then interleave everything by date for the final display order.
    var combined = noteItems.slice(0, 4).concat(videoItems.slice(0, 4));
    combined.sort(function (a, b) {
      var da = a.date ? new Date(a.date) : new Date(0);
      var db = b.date ? new Date(b.date) : new Date(0);
      return db - da;
    });

    combined.forEach(function (item) {
      var li = document.createElement("li");
      var isVideo = item.type === "video";

      var el = document.createElement(isVideo ? "a" : "button");
      el.className = "board-item";
      if (isVideo) {
        el.href = item.href;
        el.target = "_blank";
        el.rel = "noopener";
      } else {
        el.type = "button";
        el.addEventListener("click", item.onOpen);
      }

      el.innerHTML =
        '<span class="board-main">' +
        (isVideo ? videoTypeIcon : noteTypeIcon) +
        (item.course ? '<span class="board-course">' + item.course + "</span>" : "") +
        '<span class="board-title">' + item.title + "</span>" +
        "</span>" +
        '<span class="board-date">' + (item.date ? formatDate(item.date) : "") + "</span>";

      li.appendChild(el);
      boardList.appendChild(li);
    });
  }

  /* ---------- notes ---------- */
  function renderNotes(courses) {
    var groupsEl = document.getElementById("course-groups");
    var filtersEl = document.getElementById("course-filters");
    var emptyEl = document.getElementById("notes-empty");
    var searchInput = document.getElementById("note-search");

    // filter pills
    courses.forEach(function (course) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pill";
      btn.dataset.course = course.code;
      btn.textContent = course.code;
      filtersEl.appendChild(btn);
    });

    // course groups
    courses.forEach(function (course) {
      var group = document.createElement("div");
      group.className = "course-group";
      group.dataset.course = course.code;

      var head = document.createElement("div");
      head.className = "course-group-head";
      head.innerHTML =
        '<span class="course-code">' + course.code + "</span>" +
        '<span class="course-name">' + course.name + "</span>";
      group.appendChild(head);

      var sorted = course.notes.slice().sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
      });

      sorted.forEach(function (note) {
        var row = document.createElement("div");
        row.className = "note-row";
        row.dataset.title = note.title.toLowerCase();

        var info = document.createElement("div");
        info.className = "note-info";
        info.innerHTML =
          '<span class="note-title">' + note.title + "</span>" +
          '<span class="note-date">' + formatDate(note.date) + "</span>" +
          (isRecent(note.date) ? '<span class="note-new">New</span>' : "");
        row.appendChild(info);

        var actions = document.createElement("div");
        actions.className = "note-actions";

        var previewBtn = document.createElement("button");
        previewBtn.type = "button";
        previewBtn.className = "note-preview";
        previewBtn.innerHTML = previewIcon + "<span>Preview</span>";
        previewBtn.addEventListener("click", function () {
          openPdfPreview(note.file, course.code + " — " + note.title);
        });
        actions.appendChild(previewBtn);

        var link = document.createElement("a");
        link.className = "note-download";
        link.href = note.file;
        link.setAttribute("download", "");
        link.innerHTML = downloadIcon + "<span>Download PDF</span>";
        actions.appendChild(link);

        row.appendChild(actions);
        group.appendChild(row);
      });

      groupsEl.appendChild(group);
    });

    // filtering (course pill + search combined)
    var activeCourse = "all";

    function applyFilters() {
      var query = searchInput.value.trim().toLowerCase();
      var anyVisible = false;

      groupsEl.querySelectorAll(".course-group").forEach(function (group) {
        var courseMatches = activeCourse === "all" || group.dataset.course === activeCourse;
        var groupHasMatch = false;

        group.querySelectorAll(".note-row").forEach(function (row) {
          var titleMatches = !query || row.dataset.title.indexOf(query) !== -1;
          var visible = courseMatches && titleMatches;
          row.hidden = !visible;
          if (visible) groupHasMatch = true;
        });

        group.hidden = !groupHasMatch;
        if (groupHasMatch) anyVisible = true;
      });

      emptyEl.hidden = anyVisible;
    }

    filtersEl.addEventListener("click", function (e) {
      var btn = e.target.closest(".pill");
      if (!btn) return;
      filtersEl.querySelectorAll(".pill").forEach(function (p) { p.classList.remove("is-active"); });
      btn.classList.add("is-active");
      activeCourse = btn.dataset.course;
      applyFilters();
    });

    searchInput.addEventListener("input", applyFilters);
  }

  /* ---------- videos ---------- */
  var placeholderThumb =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180">' +
      '<rect width="320" height="180" fill="#16241E"/>' +
      '<circle cx="160" cy="90" r="28" fill="#D6A23A"/>' +
      '<path d="M150 76l24 14-24 14V76z" fill="#16241E"/>' +
      "</svg>"
    );

  function renderVideos(data) {
    var row = document.getElementById("video-row");
    var channelLink = document.getElementById("channel-link");
    var footerChannelLink = document.getElementById("footer-channel-link");

    channelLink.href = data.channelUrl;
    footerChannelLink.href = data.channelUrl;

    data.videos.forEach(function (video) {
      var hasRealId = video.youtubeId && video.youtubeId.indexOf("REPLACE") !== 0;
      var watchUrl = hasRealId
        ? "https://www.youtube.com/watch?v=" + video.youtubeId
        : data.channelUrl;
      var thumbUrl = hasRealId
        ? "https://img.youtube.com/vi/" + video.youtubeId + "/hqdefault.jpg"
        : placeholderThumb;

      var a = document.createElement("a");
      a.className = "video-card";
      a.href = watchUrl;
      a.target = "_blank";
      a.rel = "noopener";
      a.dataset.search = ((video.title || "") + " " + (video.course || "")).toLowerCase();
      a.innerHTML =
        '<div class="video-thumb"><img src="' + thumbUrl + '" alt="" loading="lazy" ' +
        'onerror="this.src=\'' + placeholderThumb + '\'"></div>' +
        '<div class="video-course">' + (video.course || "") + "</div>" +
        '<div class="video-title">' + video.title + "</div>";
      row.appendChild(a);
    });

    var searchInput = document.getElementById("video-search");
    var emptyEl = document.getElementById("videos-empty");

    searchInput.addEventListener("input", function () {
      var query = searchInput.value.trim().toLowerCase();
      var anyVisible = false;

      row.querySelectorAll(".video-card").forEach(function (card) {
        var visible = !query || card.dataset.search.indexOf(query) !== -1;
        card.hidden = !visible;
        if (visible) anyVisible = true;
      });

      emptyEl.hidden = anyVisible;
    });
  }

  /* ---------- boot ---------- */
  Promise.all([
    fetch("data/courses.json").then(function (r) { return r.json(); }),
    fetch("data/videos.json").then(function (r) { return r.json(); })
  ])
    .then(function (results) {
      renderNotes(results[0]);
      renderVideos(results[1]);
      renderLatestShelf(results[0], results[1]);
    })
    .catch(function (err) {
      console.error("Could not load site content:", err);
      document.getElementById("course-groups").innerHTML =
        "<p>Notes could not be loaded. If you're viewing this file directly on your computer, " +
        "run it through a local server instead of double-clicking index.html — see the README.</p>";
    });
})();
