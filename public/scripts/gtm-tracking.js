(function() {
  var params = {};
  var keys = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term',
    'gclid','gbraid','wbraid','gad_campaignid','gad_source',
    'fbclid','fbc','fbp','ttclid','msclkid','li_fat_id','twclid','sck','ref'];
  keys.forEach(function(k) {
    var v = new URLSearchParams(window.location.search).get(k);
    if (v) params[k] = v;
  });
  if (Object.keys(params).length > 0) {
    try { sessionStorage.setItem('__wl_tracking', JSON.stringify(params)); } catch(e) {}
  }
  var fill = function() {
    var fields = document.querySelectorAll('input[id^="h_"]');
    fields.forEach(function(f) {
      var key = f.id.replace('h_','');
      if (params[key]) f.value = params[key];
    });
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fill);
  } else { fill(); }
})();
