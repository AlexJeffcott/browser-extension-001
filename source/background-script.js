import {INSTALL_URL, UNINSTALL_URL} from './config';
import {track} from './tracking-helpers';
import {new_installation, updated, unspecified_install_event} from './event-names'

browser.runtime.setUninstallURL(UNINSTALL_URL);

browser.runtime.onInstalled.addListener(({reason, previousVersion}) => {
	switch (reason) {
		case 'install':
			track(new_installation, {previousVersion});
			browser.tabs.update({url: INSTALL_URL});
			break;
		case 'update':
			track(updated, {previousVersion});
			break;
		case 'chrome_update':
		case 'shared_module_update':
		default:
			track(unspecified_install_event, {previousVersion});
			break;
	}
});

browser.runtime.onMessage.addListener(async message => {
	switch (message.subject) {
		case 'track': {
			return track(...message.trackingProperties);
		}

		default:
			throw new Error('Message requires message.subject');
	}
});

//	"content_scripts": [
//	  {
//		"exclude_globs": [
//		  "*:*.paypal.*/*",
//		  "*:*.amboss.*/*",
//		  "*:*medicuja.*/*",
//		  "*:*google.*/*",
//		  "*:*ecosia.*/*",
//		  "*:duckduckgo.*/*",
//		  "*:mail.yahoo.com/*",
//		  "*:*.hotmail.*/*",
//		  "*:*.outlook.com/*",
//		  "*:*.icloud.*/*"
//		],
//		"matches": ["<all_urls>"],
//		"css": ["content-script-styles.css"],
//		"js": ["browser-polyfill.min.js", "content-script.js"]
//	  }
//	],




// browser.tabs.executeScript(null, { file: "content_script.js" }).then(onExecuted, onError);
//
// function onExecuted(result) {
// 	console.log(result);
// }
//
// function onError(error) {
// 	console.log(error);
// }


// chrome.tabs.onUpdated.addListener(function() {
// 	chrome.tabs.executeScript(null, { file: "jquery.js" }, function() {
// 		chrome.tabs.executeScript(null, { file: "content_script.js" });
// 	});
// });

//
// const executing = browser.tabs.executeScript({ file: "/content-script.js", allFrames: true });
// executing.then(onExecuted, onError);

// function injectIt(){
// 	chrome.tabs.executeScript({file: "content-script.js", allFrames: true}, function() {
// 		if(chrome.runtime.lastError) {
// 			console.error("Script injection failed: " + chrome.runtime.lastError.message);
// 		}
// 	});
// }
//
// chrome.tabs.onActivated.addListener(injectIt)

// async function register(_defaultHosts, _excludedHosts, _jsPaths, _cssPaths) {
// 	return browser.contentScripts.register({
// 		matches: _defaultHosts,
// 		excludeGlobs: _excludedHosts,
// 		js: _jsPaths,
// 		css: _cssPaths,
// 		runAt: "document_idle"
// 	});
// }
//
// const defaultHosts = ["<all_urls>"];
// const excludedHostGlobs = [
// 	"*:*.paypal.*/*",
// 	"*:*.amboss.*/*",
// 	"*:*medicuja.*/*",
// 	"*:*google.*/*",
// 	"*:*ecosia.*/*",
// 	"*:duckduckgo.*/*",
// 	"*:mail.yahoo.com/*",
// 	"*:*.hotmail.*/*",
// 	"*:*.outlook.com/*",
// 	"*:*.icloud.*/*"
// ];
// const jsPaths = [
// 	{file: "/browser-polyfill.min.js"},
// 	{file: "/content-script.js"}
// ];
// const cssPaths = [{file: "/content-script-styles.css"}];
//
// register(defaultHosts, excludedHostGlobs, jsPaths, cssPaths).then(res => {
// 	console.log(`!!`, res)
// 	track()
// });

