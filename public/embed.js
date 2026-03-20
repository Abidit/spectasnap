/**
 * SpectaSnap Embeddable Widget Loader
 *
 * Usage:
 * <script src="https://spectasnap-orpin.vercel.app/embed.js"
 *   data-store="luxoptica"
 *   data-frames="aviator-01,round-03"
 *   data-accent="C9A96E"
 *   data-width="100%"
 *   data-height="600px">
 * </script>
 */
(function () {
  'use strict';

  var ORIGIN = 'https://spectasnap-orpin.vercel.app';

  // Find the current script tag
  var scripts = document.getElementsByTagName('script');
  var scriptTag = scripts[scripts.length - 1];

  // Read configuration from data attributes
  var store = scriptTag.getAttribute('data-store') || '';
  var frames = scriptTag.getAttribute('data-frames') || '';
  var accent = scriptTag.getAttribute('data-accent') || '';
  var width = scriptTag.getAttribute('data-width') || '100%';
  var height = scriptTag.getAttribute('data-height') || '600px';

  // Build the embed URL
  var params = [];
  if (store) params.push('store=' + encodeURIComponent(store));
  if (frames) params.push('frames=' + encodeURIComponent(frames));
  if (accent) params.push('accent=' + encodeURIComponent(accent));
  var embedUrl = ORIGIN + '/embed' + (params.length ? '?' + params.join('&') : '');

  // Create the iframe
  var iframe = document.createElement('iframe');
  iframe.src = embedUrl;
  iframe.width = width;
  iframe.height = height;
  iframe.style.border = 'none';
  iframe.style.display = 'block';
  iframe.setAttribute('allow', 'camera');
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('title', 'SpectaSnap AR Try-On');

  // Insert after the script tag
  if (scriptTag.parentNode) {
    scriptTag.parentNode.insertBefore(iframe, scriptTag.nextSibling);
  }

  // ── Public API ──

  var listeners = {};
  var ready = false;
  var pendingCalls = [];

  function send(msg) {
    if (iframe.contentWindow) {
      iframe.contentWindow.postMessage(msg, ORIGIN);
    }
  }

  function callOrQueue(msg) {
    if (ready) {
      send(msg);
    } else {
      pendingCalls.push(msg);
    }
  }

  // Listen for messages from the embed iframe
  window.addEventListener('message', function (event) {
    if (event.origin !== ORIGIN) return;
    var data = event.data;
    if (!data || typeof data.type !== 'string') return;
    if (data.type.indexOf('spectasnap:') !== 0) return;

    // Mark ready and flush queued calls
    if (data.type === 'spectasnap:ready') {
      ready = true;
      for (var i = 0; i < pendingCalls.length; i++) {
        send(pendingCalls[i]);
      }
      pendingCalls = [];
    }

    // Extract event name: "spectasnap:frameChanged" -> "frameChanged"
    var eventName = data.type.replace('spectasnap:', '');
    var cbs = listeners[eventName];
    if (cbs) {
      for (var j = 0; j < cbs.length; j++) {
        try {
          cbs[j](data);
        } catch (e) {
          // swallow callback errors
        }
      }
    }
  });

  window.SpectaSnap = {
    /** Select a frame by ID. */
    selectFrame: function (frameId) {
      callOrQueue({ type: 'spectasnap:selectFrame', frameId: frameId });
    },

    /** Request a snapshot — listen for the "snapshot" event to receive the dataUrl. */
    getSnapshot: function () {
      callOrQueue({ type: 'spectasnap:getSnapshot' });
    },

    /** Request a PD measurement — listen for the "pd" event to receive the result. */
    getPD: function () {
      callOrQueue({ type: 'spectasnap:getPD' });
    },

    /**
     * Subscribe to events from the embed.
     * Event names: "ready", "frameChanged", "snapshot", "pd", "error"
     * Returns an unsubscribe function.
     */
    on: function (eventName, callback) {
      if (!listeners[eventName]) {
        listeners[eventName] = [];
      }
      listeners[eventName].push(callback);
      return function () {
        listeners[eventName] = listeners[eventName].filter(function (cb) {
          return cb !== callback;
        });
      };
    },
  };
})();
