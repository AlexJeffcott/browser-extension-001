import {h, render} from 'preact';
import htm from 'htm';
import {useEffect, useState} from 'preact/hooks';
import optionsStorage from './options-storage';
import { sendMessageToContentScript } from './messaging'
import {BASE_URL} from './config';
import {track} from './tracking-helpers';
import {
	glossary_link_clicked,
	action_opened,
	action_closed,
	blacklist_toggled_on,
	blacklist_toggled_off,
	glossary_toggled_on,
	glossary_toggled_off,
} from './event-names'

const html = htm.bind(h);

const BrowserAction = () => {
	const [hostname, setHostname] = useState('');
	const [isBlacklisted, setIsBlacklisted] = useState(false);
	const [isShowGlossary, setIsShowGlossary] = useState(true);
	const [language, setLanguage] = useState('en');
	const [terms, setTerms] = useState([]);

	useEffect(() => sendMessageToContentScript({subject: 'getHostname'}).then(res => {
		setHostname(res.hostname);
	}), []);

	useEffect(() => {
		const getStorageData = async () => {
			const {blacklistedSites, lang} = await optionsStorage.getAll();
			setIsBlacklisted(blacklistedSites.some(i => i === hostname));
			setLanguage(lang);
		};

		if (hostname) {
			getStorageData();
		}
	}, [hostname]);

	useEffect(() => {
		if (!terms.length) {
			sendMessageToContentScript({subject: 'getSnippetsMatchingText'}).then(setTerms)
			}
	}, [language]);

	useEffect(() => {
		if (hostname) {
			track(action_opened);
		}
	}, [hostname]);

	const onIsBlacklistedClick = async e => {
		setIsBlacklisted(e.target.checked);

		const {blacklistedSites} = await optionsStorage.getAll();

		if (e.target.checked) {
			setTerms([]);
			setIsShowGlossary(false);
		} else if (!e.target.checked && !terms.length) {
			sendMessageToContentScript({subject: 'getSnippetsMatchingText', language}, 0).then(setTerms);
		}

		await optionsStorage.set({blacklistedSites: e.target.checked ?
			[...blacklistedSites, hostname] :
			[...new Set(blacklistedSites.filter(i => i !== hostname))]});

		track(e.target.checked ? blacklist_toggled_on : blacklist_toggled_off);
	};

	const onIsShowGlossary = () => {
		setIsShowGlossary(!isShowGlossary);
		if (isShowGlossary && !terms.length) {
			sendMessageToContentScript({subject: 'getSnippetsMatchingText', language}, 0).then(setTerms);
		}

		track(isShowGlossary ? glossary_toggled_on : glossary_toggled_off);
	};

	return html`<div class="app">
			<div className="settings_bar">
				<label for="isBlacklisted">
					<input type="checkbox" id="isBlacklisted" checked=${isBlacklisted} onClick=${onIsBlacklistedClick}/>
					${browser.i18n.getMessage("blacklistSite", hostname)}
				</label>
				<label for="isShowGlossary">
					<input type="checkbox" id="isShowGlossary" disabled=${isBlacklisted} checked=${isShowGlossary} onClick=${onIsShowGlossary}/>
					${browser.i18n.getMessage("showGlossary")}
				</label>
			</div>
			${!isShowGlossary && html`<div class="no-glossary"></div>`}
			${isShowGlossary && !isBlacklisted && terms && terms.length === 0 && html`<div class="lds-ripple-wrapper"><div class="lds-ripple"><div></div><div></div></div></div>`}
			${isShowGlossary && !isBlacklisted && terms && terms.length > 0 && terms.map(term => html`<${Term} ...${term} language=${language} />`)}
		</div>`;
};

function Term({title, etymology, description, id, destinations, language}) {
	const [isOpen, setIsOpen] = useState(false);
	const [isClicked, setIsClicked] = useState(false);
	const {anchor, label, lc_xid} = Array.isArray(destinations) && destinations[0] || {}

	// href contains a string similar to the below example
	// https://next.amboss.com/us/article/4N03Yg#Zefeb92d093a9fbf8b7c983722bdbb10d
	const href = `${BASE_URL}${language === 'en' ? 'us' : 'de'}/article/${lc_xid}#${anchor}`;

	const handleHeaderClick = () => {
		track(isOpen ? action_opened : action_closed, {href, title});
		setIsOpen(!isOpen);
	};

	const handleLinkClick = event => {
		if(isClicked) {
			setIsClicked(false)
			return;
		}
		event.preventDefault()
		track(glossary_link_clicked, {
			href,
			title,
		})
		setIsClicked(true)

		const newEvent = new MouseEvent('click', {
			view: window,
			bubbles: true,
			cancelable: true
		})

		setTimeout(() => {
			event.target.dispatchEvent(newEvent)
		}, 1000)
	}

	return html`<div key=${id} class="ambossContent">
			<div class="ambossHeader" onClick=${handleHeaderClick}>${title}</div>
			${isOpen && html`<div>
				${Boolean(etymology) && html`<div class="ambossSnippetEtymology">${etymology}</div>`}
				<div class="ambossSnippetDescription">${description}</div>
				${Boolean(lc_xid) && html`<div id="ambossFooter" class="ambossFooter" >
					<a href=${href} target="_blank" onClick=${handleLinkClick}>
						<div class="icon_container">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<rect x="4" y="2" width="16" height="20"></rect>
								<line x1="16" y1="6" x2="8" y2="6"></line>
								<line x1="14" y1="10" x2="8" y2="10"></line>
								<rect x="8" y="14" width="8" height="4"></rect>
							</svg>
						</div>
						<div class="link_arrow_container" >
							<h4>${label}</h4>
							<div class="arrow_container">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<line x1="5" y1="12" x2="19" y2="12"></line>
									<polyline points="12 5 19 12 12 19"></polyline>
								</svg>
						</div>
					</div>
					</a>
				</div>`}
			</div>`}
		</div>`;
}

render(html`<${BrowserAction} />`, document.body);
