import browser from 'webextension-polyfill'

export function sendMessageToContentScript(message) {
	return browser.tabs.query({
		currentWindow: true,
		active: true
	}).then(tabs => browser.tabs.sendMessage(
		tabs[0].id,
		message
	)).catch(console.log);
}

export function sendMessageToBackgroundScript(message) {
	return browser.runtime.sendMessage(message).catch(console.log);
}
