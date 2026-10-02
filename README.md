# karan.ink

Karan Chand, photographs.

Plain static site on GitHub Pages. No build, no dependencies. One small script, `site.js`: picking "a photographer" on the home page turns the site charcoal and shows the photographs tab. The home page always starts on "select". The photographs page is always charcoal. Without JS the tab just shows.

- `index.html` - home / about, the "Karan Chand is ..." dropdown
- `photographs.html` - photographs
- `styles.css`
- `site.js`
- `fonts/` - Cormorant Upright, self-hosted (SIL OFL, see `fonts/OFL.txt`)
- `images/`

## Adding photos

Copy a `<figure>` in `photographs.html`. Captions go: stock, format, camera, place, year.
Fill in `alt`, `width` and `height`.

New series: copy a `<section class="series">` block.

## Note

Cormorant Upright has no italic, so `cite` etc. should stay upright.

## Preview locally

    python -m http.server 8347 --bind 127.0.0.1
