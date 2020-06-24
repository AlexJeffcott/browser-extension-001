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

