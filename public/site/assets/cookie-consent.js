(function(){
  var KEY = 'bsg-cookie-consent';
  try {
    var existing = localStorage.getItem(KEY);
    if(existing){
      try {
        var parsed = JSON.parse(existing);
        if(parsed && parsed.value === 'accept' && typeof gtag === 'function'){
          gtag('consent', 'update', { 'analytics_storage': 'granted' });
        }
      } catch(e){}
      return;
    }
  } catch(e){}

  var css = ''
    + '.cc-banner{position:fixed;left:16px;right:16px;bottom:16px;z-index:9998;'
    + 'background:#0A0D08;color:#fff;border-radius:14px;padding:18px 20px;'
    + 'display:flex;gap:16px;align-items:center;flex-wrap:wrap;justify-content:space-between;'
    + 'box-shadow:0 18px 40px rgba(0,0,0,.35);font-family:var(--font-body,system-ui);'
    + 'max-width:980px;margin:0 auto;transform:translateY(140%);transition:transform .4s ease}'
    + '.cc-banner.is-in{transform:translateY(0)}'
    + '.cc-banner p{margin:0;font-size:14px;line-height:1.5;flex:1;min-width:240px;color:rgba(255,255,255,.85)}'
    + '.cc-banner a{color:#A8D047;text-decoration:underline}'
    + '.cc-banner .cc-actions{display:flex;gap:8px;flex-wrap:wrap}'
    + '.cc-banner button{font-family:var(--font-display,system-ui);font-weight:700;font-size:12px;'
    + 'letter-spacing:.06em;text-transform:uppercase;padding:11px 18px;border-radius:999px;'
    + 'border:1px solid rgba(255,255,255,.35);background:transparent;color:#fff;cursor:pointer}'
    + '.cc-banner button.primary{background:#629630;border-color:#629630;color:#0A0D08}'
    + '@media (max-width:600px){.cc-banner{left:10px;right:10px;bottom:10px;padding:14px 16px}'
    + '.cc-banner .cc-actions{width:100%}.cc-banner .cc-actions button{flex:1}}';

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var bar = document.createElement('div');
  bar.className = 'cc-banner';
  bar.setAttribute('role','dialog');
  bar.setAttribute('aria-label','Informativa cookie');
  bar.innerHTML = ''
    + '<p>Usiamo cookie tecnici e, previo consenso, cookie analitici e di marketing per migliorare la tua esperienza. '
    + 'Leggi la <a href="cookie.html">Cookie Policy</a> e la <a href="privacy.html">Privacy Policy</a>.</p>'
    + '<div class="cc-actions">'
    + '<button type="button" data-cc="reject">Rifiuta</button>'
    + '<button type="button" class="primary" data-cc="accept">Accetta</button>'
    + '</div>';

  function mount(){
    document.body.appendChild(bar);
    requestAnimationFrame(function(){ bar.classList.add('is-in'); });
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }

  function save(val){
    try { localStorage.setItem(KEY, JSON.stringify({ value: val, ts: Date.now() })); } catch(e){}
    if(val === 'accept' && typeof gtag === 'function'){
      gtag('consent', 'update', { 'analytics_storage': 'granted' });
    }
    bar.classList.remove('is-in');
    setTimeout(function(){ bar.remove(); }, 400);
  }
  bar.addEventListener('click', function(e){
    var btn = e.target.closest('[data-cc]');
    if(!btn) return;
    save(btn.getAttribute('data-cc'));
  });
})();