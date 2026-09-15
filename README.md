# Phello's website

A simple, fast website for sharing downloadable course notes (PDFs) and linking to your
YouTube videos. No backend, no database — just files, so it's free to host and easy to update.

## What's in this folder

```
index.html          the whole page
css/styles.css       all the styling
js/script.js         makes the page interactive (search, filters, loading notes/videos)
data/courses.json    the list of courses and notes — EDIT THIS to add new notes
data/videos.json     the list of videos and your channel link — EDIT THIS to add new videos
notes/               the actual PDF files that get downloaded
```

You will mostly only ever touch **data/courses.json**, **data/videos.json**, and the **notes/**
folder. You should not need to edit the HTML, CSS, or JS files at all.

## Adding a new set of notes (do this whenever you have a new PDF)

1. Put the PDF file inside the `notes/` folder. Give it a simple name with no spaces, e.g.
   `mat101-trigonometry.pdf`.
2. Open `data/courses.json` in any text editor (Notepad, VS Code, or even GitHub's own editor).
3. Find the course it belongs to (matched by `code`), and add a new line inside its `"notes"` list:

   ```json
   { "title": "Trigonometry", "date": "2026-09-14", "file": "notes/mat101-trigonometry.pdf" }
   ```

   - `title` — what shows on the site
   - `date` — the day you're adding it, as YYYY-MM-DD (this also drives the "New" tag and the
     "Latest on the shelf" box on the homepage — notes from the last 30 days get the New tag
     automatically)
   - `file` — the path to the PDF you just added

4. Don't forget the comma between entries. Save the file.

**Starting a brand-new course?** Copy one whole `{ "code": ..., "name": ..., "notes": [...] }`
block, paste it before the closing `]`, and change the code, name, and notes.

## Adding a new video

Open `data/videos.json` and add a line to the `"videos"` list:

```json
{ "title": "Trigonometry — full lesson", "youtubeId": "dQw4w9WgXcQ", "course": "MAT101" }
```

The `youtubeId` is the part of the YouTube URL after `v=`. For
`https://www.youtube.com/watch?v=dQw4w9WgXcQ`, the ID is `dQw4w9WgXcQ`.

Also update `"channelUrl"` at the top of the same file with your real channel link once you have
it, so the "Subscribe on YouTube" button points to the right place.

## Before you publish: replace the placeholders

The site currently has sample content so you can see how it looks and works. Before going live:

- Delete the sample PDFs in `notes/` and the sample entries in `data/courses.json`, then add your
  real notes as above (or just start replacing them one by one).
- Replace the placeholder `youtubeId` values in `data/videos.json` with your real videos, and set
  the real `channelUrl`.
- In `index.html`, update:
  - the "About Phello" paragraph (search for `About Phello`)
  - the email address (search for `REPLACE@example.com`)
  - the WhatsApp number (search for `wa.me/2547XXXXXXXX` — replace with your number in the format
    `2547XXXXXXXX`, no plus sign, no spaces)

## Viewing it on your own computer first

Because the page loads `courses.json` and `videos.json` in the background, **double-clicking
index.html won't fully work** — browsers block that for local files. Instead, run a tiny local
server:

- If you have Python installed: open a terminal in this folder and run
  `python3 -m http.server`, then open `http://localhost:8000` in your browser.
- Or install the free "Live Server" extension in VS Code and click "Go Live".

This local-server step is only needed for previewing. Once it's hosted online (GitHub Pages or
Truehost), it works normally in any browser.

## Publishing on GitHub Pages (your first step)

1. Create a GitHub account if you don't have one, and a new repository — e.g. `phello-site`.
2. Upload every file and folder from this project into that repository (keep the folder
   structure exactly as it is).
3. In the repository, go to **Settings → Pages**.
4. Under "Build and deployment", choose **Deploy from a branch**, pick the `main` branch and
   the `/ (root)` folder, then save.
5. GitHub will give you a link like `https://yourusername.github.io/phello-site/` — that's your
   live site. It can take a minute or two to go live after each update.
6. Once you buy your domain, you can point it at this same GitHub Pages site (GitHub's docs call
   this a "custom domain" — there's a field for it right on that same Settings → Pages screen).

## Migrating to Truehost later

When you're ready to move to Truehost hosting:

1. Buy hosting + your domain on Truehost (or point a domain you already bought at their
   nameservers).
2. Log into Truehost's control panel (cPanel) and open **File Manager**, or connect with an FTP
   app like FileZilla.
3. Go to the `public_html` folder and upload everything from this project (all files and folders,
   keeping the same structure) into it.
4. Visit your domain — the site should load exactly as it did on GitHub Pages, since it's the
   exact same files. No code changes are needed for the move.

## A note on the "New" label

Any note dated within the last 30 days automatically gets a red "New" badge, and the four most
recent notes across all courses appear in the "Latest on the shelf" box on the homepage. This is
driven entirely by the `date` field in `courses.json` — nothing else to configure.
