'use strict';

function init() {

  var urlPath = location.pathname;
  var projectSlug = urlPath.replace('/', '');

  var poweredByLink = document.getElementById('powered-by');
  poweredByLink.href = poweredByLink.href + '&utm_term=' + projectSlug;

  if (!projectSlug) {
    var intro = document.getElementById('intro');
    intro.style.display = 'block';
    return;
  }

  poweredByLink.style.display = 'inline-block';

  var widget = new TimekitBooking();
  widget.init({
    project_slug: projectSlug
  });

}

init();
