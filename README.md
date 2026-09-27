# karan.ink

Karan Chand, photographs.

Plain static site on GitHub Pages. No build, no dependencies. One small script on the about page for the shuffle button (the page works without it).

- `index.html` - photographs
- `about.html` - about + contact
- `styles.css`
- `fonts/` - Cormorant Upright, self-hosted (SIL OFL, see `fonts/OFL.txt`)
- `images/`

## Adding photos

Copy a `<figure>` in `index.html`. Captions go: stock, format, camera, place, year.
Fill in `alt`, `width` and `height`.

New series: copy a `<section class="series">` block.

## Note

Cormorant Upright has no italic, so `cite` etc. should stay upright.

## Preview locally

    python -m http.server 8347 --bind 127.0.0.1
