(function () {
  var root = document.documentElement;

  function apply(v) {
    root.classList.toggle('is-photographer', v === 'photographer');
  }

  // arriving home from the photographs page: start in charcoal, then fade to pearl
  var fromDark = !root.dataset.is && /\/photographs(\.html)?([?#]|$)/.test(document.referrer);

  root.classList.add('js');
  apply(fromDark ? 'photographer' : root.dataset.is);

  document.addEventListener('DOMContentLoaded', function () {
    var pick = document.querySelector('.intro select');
    if (!pick) return;
    var ruler = document.querySelector('.intro .ruler');

    function fit() {
      if (!pick.value) {
        pick.style.width = '';
        return;
      }
      ruler.textContent = pick.options[pick.selectedIndex].text;
      pick.style.width = (ruler.offsetWidth + 2) + 'px';
    }

    function update() {
      apply(pick.value);
      fit();
    }

    function reset() {
      pick.selectedIndex = 0;
      update();
    }

    pick.addEventListener('change', update);

    // "about" or the name, clicked while already here: fade back instead of reloading
    document.querySelectorAll('a[href="index.html"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        if (!pick.value || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        reset();
      });
    });

    // back button restores the old page as it was; start blank again
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) reset();
    });

    pick.selectedIndex = 0;
    fit();
    if (fromDark) void document.body.offsetWidth; // lock in charcoal so the change below fades
    apply('');
    if (document.fonts) document.fonts.ready.then(fit);
  });
})();
