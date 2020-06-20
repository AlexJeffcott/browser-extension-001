import {SEGMENT_WRITE_KEY} from './config';
import optionsStorage from './options-storage';
import {sendMessageToContentScript} from './messaging';

// The following IFFE snippet was taken from the following:
// https://segment.com/docs/connections/sources/catalog/libraries/website/javascript/quickstart/
// I had to define 'SEGMENT_WRITE_KEY' with the segment project’s Write Key, found in the project settings.
!(function () {
	const analytics = window.analytics = window.analytics || []; if (!analytics.initialize) {
		if (analytics.invoked) {
			window.console && console.error && console.error('Segment snippet included twice.');
		} else {
			analytics.invoked = !0;
			analytics.methods = ['trackSubmit', 'trackClick', 'trackLink', 'trackForm', 'pageview', 'identify', 'reset', 'group', 'track', 'ready', 'alias', 'debug', 'page', 'once', 'off', 'on'];
			analytics.factory = function (t) {
				return function () {
					const e = Array.prototype.slice.call(arguments);
					e.unshift(t); analytics.push(e);
					return analytics;
				};
			};

			for (let t = 0; t < analytics.methods.length; t++) {
				const e = analytics.methods[t]; analytics[e] = analytics.factory(e);
			}

			analytics.load = function (t, e) {
				const n = document.createElement('script');
				n.type = 'text/javascript'; n.async = !0;
				n.src = 'https://cdn.segment.com/analytics.js/v1/' + t + '/analytics.min.js';
				const a = document.querySelectorAll('script')[0]; a.parentNode.insertBefore(n, a); analytics._loadOptions = e;
			};

			analytics.SNIPPET_VERSION = '4.1.0';
			analytics.load(SEGMENT_WRITE_KEY);
			analytics.page();
		}
	}
})();

function isFirefoxOrChrome() {
	// Chrome 1 - 71
	if (Boolean(window.chrome) && (Boolean(window.chrome.webstore) || Boolean(window.chrome.runtime))) {
		return 'chrome';
	}

	// Firefox 1.0+
	if (typeof InstallTrigger !== 'undefined') {
		return 'firefox';
	}

	console.log('!! browser identification unsuccessful');
	return 'unknown';
}

export async function track(title, _detailsObject = {}, _hostname) {
	const {version} = browser.runtime.getManifest();
	const browserName = isFirefoxOrChrome();
	const storageData = await optionsStorage.getAll();
	const hostname = _hostname || await sendMessageToContentScript({subject: 'getHostname'});

	const detailsObject = {
		..._detailsObject,
		hostname,
		browserName,
		version,
		storageData
	};
	analytics.track(title, detailsObject);
}
