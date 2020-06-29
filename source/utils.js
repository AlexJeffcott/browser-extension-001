import {BASE_URL} from './config'

export function isFirefoxOrChrome() {
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


export const uniqByProp = prop => arr =>
	Array.from(
		arr.reduce((acc, cur) => (cur && cur[prop] && acc.set(cur[prop], cur), acc), new Map()).values()
	);

export function getHref({anchor, lc_xid, title, language}){
	// https://next.amboss.com/us/4N03Yg#Zefeb92d093a9fbf8b7c983722bdbb10d&utm_source=chrome_plugin&utm_medium=browser_plugin&utm_campaign=browser_plugin&utm_term=FAST
	const BROWSER_NAME = isFirefoxOrChrome()
	const anchorString = anchor ? `#${anchor}` : ''
	const utmString = `&utm_source=${BROWSER_NAME}_plugin&utm_medium=browser_plugin&utm_campaign=browser_plugin&utm_term=${title}`
	return `${BASE_URL}${language === 'en' ? 'us' : 'de'}/article/${lc_xid}${anchorString}${utmString}`;
}
