/**
 * Ricardo Tocha — tracking padrao GTM.
 * Captura UTMs, click IDs, cookies Meta e dados de sessao.
 * Persiste em sessionStorage, expoe window.__wlTracking e fornece
 * window.__wlPushLeadSubmit para padronizar o evento form_submit_lead.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "__wl_tracking";
  var TRACKING_FIELDS = [
    "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
    "gclid", "gbraid", "wbraid", "gad_campaignid", "gad_source",
    "fbclid", "fbc", "fbp",
    "ttclid", "msclkid", "li_fat_id", "twclid", "sck",
    "landing_page", "referrer", "user_agent", "first_visit",
    "session_id", "session_attributes_encoded", "originPage", "ref"
  ];
  var URL_PARAMS = [
    "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
    "gclid", "gbraid", "wbraid", "gad_campaignid", "gad_source",
    "fbclid",
    "ttclid", "msclkid", "li_fat_id", "twclid", "sck",
    "ref"
  ];

  function getParam(name) {
    var match = RegExp("[?&]" + name + "=([^&]*)").exec(window.location.search);
    return match ? decodeURIComponent(match[1].replace(/\+/g, " ")) : "";
  }

  function getCookie(name) {
    var match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : "";
  }

  function setCookie(name, value, maxAge) {
    document.cookie = name + "=" + encodeURIComponent(value)
      + ";max-age=" + maxAge + ";path=/;SameSite=Lax";
  }

  function generateSessionId() {
    return Date.now().toString(36) + "." + Math.random().toString(36).slice(2, 10);
  }

  function readStoredTracking() {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || null;
    } catch (e) {
      return null;
    }
  }

  function writeStoredTracking(data) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}
  }

  function collectTracking() {
    var stored = readStoredTracking();
    if (stored) return stored;

    stored = {};
    URL_PARAMS.forEach(function (field) {
      var value = getParam(field);
      if (value) stored[field] = value;
    });

    var fbc = getCookie("_fbc");
    var fbp = getCookie("_fbp");
    if (fbc) stored.fbc = fbc;
    if (fbp) stored.fbp = fbp;
    if (stored.fbclid && !stored.fbc) {
      stored.fbc = "fb.1." + Date.now() + "." + stored.fbclid;
    }

    stored.landing_page = window.location.href;
    stored.originPage = window.location.href;
    stored.referrer = document.referrer || "";
    stored.user_agent = navigator.userAgent;
    stored.first_visit = new Date().toISOString();
    stored.session_id = generateSessionId();

    var attrs = {};
    URL_PARAMS.forEach(function (field) {
      if (stored[field]) attrs[field] = stored[field];
    });
    try {
      stored.session_attributes_encoded = btoa(JSON.stringify(attrs));
    } catch (e) {}

    writeStoredTracking(stored);
    return stored;
  }

  var tracking = collectTracking();
  window.__wlTracking = tracking;
  window.__wlTrackingFields = TRACKING_FIELDS.slice();

  if (tracking.fbclid) {
    var fbcValue = tracking.fbc || ("fb.1." + Date.now() + "." + tracking.fbclid);
    setCookie("_fbc", fbcValue, 90 * 24 * 60 * 60);
    tracking.fbc = fbcValue;
    writeStoredTracking(tracking);
  }

  function populateHiddenFields(root) {
    var scope = root && root.querySelectorAll ? root : document;

    TRACKING_FIELDS.forEach(function (field) {
      var value = tracking[field] || "";
      var selector = 'input[type="hidden"][name="' + field + '"], #h_' + field;
      var inputs = scope.querySelectorAll(selector);
      inputs.forEach(function (input) {
        input.value = value;
      });
    });
  }

  function buildLeadSubmitEvent(lead, extra) {
    var event = {
      event: "form_submit_lead",
      lead_name: lead && lead.name ? lead.name : null,
      lead_email: lead && lead.email ? lead.email : null,
      lead_whatsapp: lead && lead.whatsapp ? lead.whatsapp : null
    };

    TRACKING_FIELDS.forEach(function (field) {
      event[field] = tracking[field] || null;
    });

    if (extra) {
      Object.keys(extra).forEach(function (key) {
        event[key] = extra[key];
      });
    }

    return event;
  }

  window.__wlPopulateHiddenFields = populateHiddenFields;
  window.__wlPushLeadSubmit = function (lead, extra) {
    populateHiddenFields();
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(buildLeadSubmitEvent(lead || {}, extra || {}));
  };

  function enrichCtaLinks() {
    var links = document.querySelectorAll("a.cta-link");
    if (!links.length) return;

    var linkParams = TRACKING_FIELDS.concat(["session_id"]);
    links.forEach(function (link) {
      var href = link.getAttribute("href");
      if (!href) return;

      try {
        var url = new URL(href, window.location.href);
        linkParams.forEach(function (field) {
          if (tracking[field]) url.searchParams.set(field, tracking[field]);
        });
        link.setAttribute("href", url.toString());
      } catch (e) {}
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      populateHiddenFields();
      enrichCtaLinks();
    });
  } else {
    populateHiddenFields();
    enrichCtaLinks();
  }
})();
