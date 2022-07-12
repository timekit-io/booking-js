'use strict';

function init() {

  const urlPath = location.pathname;
  const projectSlug = urlPath.replace('/', '');
  const urlParams = new URLSearchParams(window.location.search);
  const host = location.host.includes('localhost') ? '-localhost' : '';
  
  const uuid = urlParams.get('uuid');
  const action = urlParams.get('action');
  const eventEnd = urlParams.get('event.end');
  const eventStart = urlParams.get('event.start');

  const poweredByLink = document.getElementById('powered-by');
  poweredByLink.href = poweredByLink.href + '&utm_term=' + projectSlug;

  if (!projectSlug) {
    var intro = document.getElementById('intro');
    intro.style.display = 'block';
    return;
  }

  poweredByLink.style.display = 'inline-block';

  new TimekitBooking().init({
    project_slug: projectSlug,
    api_base_url: 'https://api' + host + '.timekit.io/',
    reschedule: {
      uuid,
      action,
      eventEnd,
      eventStart
    }
  });

}

init();