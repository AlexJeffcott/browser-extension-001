
export function sendMessageToContentScript(message, tab=0) {
	return browser.tabs.query({
		currentWindow: true,
		active: true
	}).then(tabs => browser.tabs.sendMessage(
		tabs[tab].id,
		message
	)).catch(console.log)
}
