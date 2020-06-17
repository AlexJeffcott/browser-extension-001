import { INSTALL_URL, UNINSTALL_URL } from './config'
import { track } from './trackingHelpers'

browser.runtime.setUninstallURL(UNINSTALL_URL)

browser.runtime.onInstalled.addListener(({ reason, previousVersion }) => {
	switch (reason) {
		case 'install':
			track(`browser_addon_new_installation`, { previousVersion })
			browser.tabs.update({ url: INSTALL_URL })
			break;
		case 'update':
			track(`browser_addon_updated`, { previousVersion })
			break;
		case 'chrome_update':
		case 'shared_module_update':
		default:
			track(`browser_addon_unspecified_install_event`, { previousVersion })
			break;
	}
})
