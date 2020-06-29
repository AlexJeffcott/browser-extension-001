import browser from 'webextension-polyfill'
import {h, render} from 'preact';
import htm from 'htm';
import {useEffect, useState} from 'preact/hooks';
import optionsStorage from './options-storage';
import { sendMessageToContentScript } from './messaging'
import {track} from './tracking-helpers';
import {getHref} from './utils'
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
					<svg width="140" viewBox="0 0 102 17" fill="none" xmlns="http://www.w3.org/2000/svg">
						<mask id="mask0" mask-type="alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="16" height="17">
							<path fill-rule="evenodd" clip-rule="evenodd" d="M0 0.87207H15.0659V16.6997H0V0.87207Z" fill="white"/>
						</mask>
						<g mask="url(#mask0)">
							<path fill-rule="evenodd" clip-rule="evenodd" d="M12.0472 15.6584H3.01465L3.58547 14.6171H11.4764L12.0472 15.6584ZM8.72977 5.2334L13.3032 13.5758H12.0977L8.72315 7.42013L8.12696 8.50715L10.9056 13.5758H4.15637L8.72977 5.2334ZM15.0661 14.6171L8.72311 3.04666L8.13375 4.1461L2.9643 13.5758H1.7589L8.127 1.95923L7.53101 0.87207L-0.00402832 14.6171H2.39348L1.25183 16.6997H13.8103L12.6685 14.6171H15.0661Z" fill="#24A3AA"/>
						</g>
						<path fill-rule="evenodd" clip-rule="evenodd" d="M23.7406 10.9808H30.5153L27.4271 3.55892C27.3772 3.44132 27.3273 3.30815 27.2775 3.15928C27.2276 3.01054 27.1777 2.85306 27.1279 2.68698C27.078 2.85306 27.0281 3.01054 26.9783 3.15928C26.9284 3.30815 26.8785 3.44474 26.8287 3.5693L23.7406 10.9808ZM33.8599 16.3162H33.0157C32.9159 16.3162 32.834 16.2902 32.7699 16.2383C32.7058 16.1864 32.6559 16.1189 32.6203 16.0359L30.8358 11.7696H23.4092L21.6354 16.0359C21.6069 16.1122 21.557 16.1779 21.4858 16.2331C21.4145 16.2887 21.329 16.3162 21.2294 16.3162H20.3959L26.5829 1.62817H27.6728L33.8599 16.3162Z" fill="#000105"/>
						<path fill-rule="evenodd" clip-rule="evenodd" d="M43.3173 12.6623C43.3594 12.5517 43.403 12.4427 43.4487 12.3354C43.4941 12.2281 43.5448 12.1261 43.601 12.0291L49.4426 1.8254C49.4986 1.73553 49.5546 1.68007 49.6107 1.65931C49.6667 1.63855 49.7437 1.62817 49.8418 1.62817H50.5878V16.3162H49.6422V3.79764C49.6422 3.61776 49.6527 3.4275 49.6737 3.22673L43.8216 13.4928C43.7234 13.6728 43.5834 13.7626 43.4014 13.7626H43.2332C43.0581 13.7626 42.9181 13.6728 42.8129 13.4928L36.8033 3.21635C36.8243 3.41712 36.8349 3.61079 36.8349 3.79764V16.3162H35.8998V1.62817H36.6352C36.7332 1.62817 36.812 1.63855 36.8716 1.65931C36.9311 1.68007 36.9889 1.73553 37.045 1.8254L43.0442 12.0395C43.1492 12.2333 43.2402 12.4409 43.3173 12.6623Z" fill="#000105"/>
						<path fill-rule="evenodd" clip-rule="evenodd" d="M55.3269 9.27838V15.465H59.0408C60.3449 15.465 61.3283 15.1865 61.9909 14.6294C62.6535 14.0724 62.9847 13.2887 62.9847 12.2783C62.9847 11.8147 62.8958 11.3977 62.718 11.0274C62.5401 10.6574 62.2838 10.3424 61.9491 10.0828C61.6144 9.82334 61.2028 9.62455 60.7147 9.48599C60.2264 9.34763 59.6719 9.27838 59.0513 9.27838H55.3269ZM55.3269 8.4999H58.5386C59.222 8.4999 59.8061 8.41344 60.2909 8.24039C60.7756 8.06748 61.1732 7.83911 61.4836 7.5553C61.7938 7.27162 62.0224 6.94983 62.1687 6.58994C62.3153 6.23018 62.3885 5.85991 62.3885 5.47926C62.3885 4.48972 62.0727 3.74057 61.4416 3.23194C60.8103 2.72331 59.8358 2.46899 58.5177 2.46899H55.3269V8.4999ZM54.2599 16.3162V1.62817H58.5177C59.3615 1.62817 60.0921 1.71122 60.7094 1.8773C61.3265 2.04338 61.8373 2.28732 62.242 2.6091C62.6463 2.93089 62.9481 3.3237 63.147 3.78726C63.3456 4.25095 63.4451 4.77693 63.4451 5.36505C63.4451 5.75267 63.377 6.12636 63.241 6.48611C63.105 6.84601 62.9079 7.17817 62.65 7.48261C62.3919 7.78719 62.0762 8.05189 61.7032 8.2767C61.33 8.50165 60.903 8.67292 60.4217 8.79052C61.5864 8.96357 62.4826 9.34764 63.1102 9.94272C63.738 10.538 64.0519 11.3233 64.0519 12.299C64.0519 12.9218 63.9402 13.4824 63.717 13.9806C63.4938 14.4789 63.1695 14.9011 62.7442 15.247C62.3186 15.5931 61.7956 15.8578 61.1749 16.0411C60.5542 16.2245 59.8497 16.3162 59.0617 16.3162H54.2599Z" fill="#000105"/>
						<mask id="mask1" mask-type="alpha" maskUnits="userSpaceOnUse" x="66" y="1" width="36" height="16">
							<path fill-rule="evenodd" clip-rule="evenodd" d="M66.1226 1.63208H101.959V16.7201H66.1226V1.63208Z" fill="white"/>
						</mask>
						<g mask="url(#mask1)">
							<path fill-rule="evenodd" clip-rule="evenodd" d="M79.2436 9.17295C79.2436 8.14396 79.0992 7.21912 78.811 6.39858C78.5221 5.57818 78.1158 4.88281 77.5915 4.31259C77.0671 3.74251 76.4359 3.3061 75.6963 3.00363C74.958 2.70116 74.1379 2.54993 73.2372 2.54993C72.3503 2.54993 71.5392 2.70116 70.8037 3.00363C70.0683 3.3061 69.4351 3.74251 68.9039 4.31259C68.3725 4.88281 67.9609 5.57818 67.6688 6.39858C67.3768 7.21912 67.2308 8.14396 67.2308 9.17295C67.2308 10.2091 67.3768 11.1356 67.6688 11.9525C67.9609 12.7696 68.3725 13.4632 68.9039 14.0333C69.4351 14.6035 70.0683 15.0382 70.8037 15.3371C71.5392 15.6361 72.3503 15.7856 73.2372 15.7856C74.1379 15.7856 74.958 15.6361 75.6963 15.3371C76.4359 15.0382 77.0671 14.6035 77.5915 14.0333C78.1158 13.4632 78.5221 12.7696 78.811 11.9525C79.0992 11.1356 79.2436 10.2091 79.2436 9.17295ZM80.3626 9.17294C80.3626 10.3134 80.1903 11.3476 79.8452 12.2758C79.5007 13.2041 79.0146 13.9968 78.3889 14.6539C77.7618 15.311 77.0124 15.8186 76.1402 16.1767C75.2672 16.5349 74.2999 16.7138 73.2373 16.7138C72.1887 16.7138 71.2282 16.5349 70.3553 16.1767C69.4829 15.8186 68.7333 15.311 68.1071 14.6539C67.4807 13.9968 66.9935 13.2041 66.6451 12.2758C66.2967 11.3476 66.1226 10.3134 66.1226 9.17294C66.1226 8.03965 66.2967 7.00873 66.6451 6.08046C66.9935 5.15219 67.4807 4.35952 68.1071 3.70243C68.7333 3.04534 69.4829 2.53606 70.3553 2.17444C71.2282 1.81296 72.1887 1.63208 73.2373 1.63208C74.2999 1.63208 75.2672 1.81117 76.1402 2.16922C77.0124 2.52741 77.7618 3.03669 78.3889 3.69721C79.0146 4.35787 79.5007 5.15219 79.8452 6.08046C80.1903 7.00873 80.3626 8.03965 80.3626 9.17294Z" fill="#000105"/>
							<path fill-rule="evenodd" clip-rule="evenodd" d="M90.0524 3.59291C89.9892 3.71121 89.8975 3.77022 89.7781 3.77022C89.6864 3.77022 89.5677 3.706 89.4232 3.57727C89.2788 3.44868 89.0822 3.30609 88.8357 3.14964C88.5885 2.99319 88.2794 2.84895 87.9086 2.7168C87.5384 2.58477 87.0815 2.51863 86.5377 2.51863C85.9939 2.51863 85.5154 2.5952 85.1029 2.74809C84.6897 2.9011 84.3439 3.1097 84.0647 3.37388C83.7855 3.6382 83.5737 3.9441 83.4293 4.29172C83.2848 4.63948 83.2126 5.00453 83.2126 5.38687C83.2126 5.88751 83.3195 6.30127 83.5348 6.62803C83.7494 6.95493 84.0335 7.23297 84.3855 7.46243C84.7376 7.69189 85.1377 7.88484 85.5856 8.04129C86.0328 8.19774 86.4926 8.35254 86.9648 8.50543C87.437 8.65844 87.8968 8.82718 88.344 9.01128C88.7919 9.19559 89.192 9.42683 89.5441 9.70487C89.8962 9.98305 90.1802 10.3255 90.3948 10.7322C90.6101 11.139 90.7177 11.6448 90.7177 12.2498C90.7177 12.8687 90.6101 13.451 90.3955 13.9968C90.1809 14.5428 89.8691 15.0174 89.4614 15.4205C89.0531 15.8238 88.5537 16.1419 87.9628 16.3748C87.3711 16.6077 86.696 16.7242 85.9356 16.7242C84.9501 16.7242 84.1022 16.5521 83.3918 16.208C82.6806 15.8638 82.0584 15.3928 81.5229 14.7946L81.8188 14.3358C81.9035 14.2314 82.0021 14.1793 82.1146 14.1793C82.1778 14.1793 82.2591 14.221 82.3577 14.3045C82.4563 14.3879 82.5758 14.4906 82.7167 14.6122C82.8577 14.7339 83.0272 14.8661 83.2244 15.0085C83.4216 15.1511 83.6508 15.2833 83.9112 15.4048C84.1723 15.5266 84.4717 15.6291 84.8099 15.7125C85.1481 15.796 85.5321 15.8377 85.962 15.8377C86.5544 15.8377 87.0829 15.749 87.5475 15.5717C88.0128 15.3944 88.4058 15.1529 88.7267 14.8468C89.0468 14.5409 89.292 14.1777 89.4614 13.7569C89.6302 13.3364 89.7149 12.886 89.7149 12.4062C89.7149 11.8847 89.6073 11.4555 89.3927 11.1181C89.1774 10.7809 88.8933 10.4993 88.5412 10.2733C88.1891 10.0474 87.7891 9.85789 87.3412 9.70487C86.894 9.55199 86.4342 9.40233 85.962 9.25638C85.4898 9.11036 85.03 8.94705 84.5828 8.76617C84.1348 8.58543 83.7348 8.35419 83.3827 8.07258C83.0306 7.79097 82.7466 7.43992 82.532 7.01916C82.3167 6.59853 82.2098 6.07181 82.2098 5.43902C82.2098 4.94538 82.3042 4.46903 82.4952 4.01011C82.6855 3.55119 82.9633 3.14621 83.33 2.79502C83.6966 2.44397 84.1494 2.16236 84.6883 1.95019C85.2272 1.73816 85.8418 1.63208 86.5328 1.63208C87.3079 1.63208 88.0037 1.75381 88.6204 1.99713C89.2371 2.24059 89.7989 2.6125 90.3059 3.11313L90.0524 3.59291Z" fill="#000105"/>
							<path fill-rule="evenodd" clip-rule="evenodd" d="M101.294 3.59291C101.231 3.71121 101.14 3.77022 101.02 3.77022C100.928 3.77022 100.81 3.706 100.665 3.57727C100.52 3.44868 100.324 3.30609 100.077 3.14964C99.8305 2.99319 99.5215 2.84895 99.1506 2.7168C98.7805 2.58477 98.3228 2.51863 97.7791 2.51863C97.236 2.51863 96.7575 2.5952 96.3443 2.74809C95.9318 2.9011 95.5852 3.1097 95.3068 3.37388C95.0276 3.6382 94.8158 3.9441 94.6713 4.29172C94.5262 4.63948 94.454 5.00453 94.454 5.38687C94.454 5.88751 94.5616 6.30127 94.7762 6.62803C94.9915 6.95493 95.2748 7.23297 95.6276 7.46243C95.9797 7.69189 96.3797 7.88484 96.827 8.04129C97.2749 8.19774 97.7346 8.35254 98.2069 8.50543C98.6791 8.65844 99.1388 8.82718 99.5861 9.01128C100.033 9.19559 100.433 9.42683 100.786 9.70487C101.138 9.98305 101.422 10.3255 101.637 10.7322C101.852 11.139 101.959 11.6448 101.959 12.2498C101.959 12.8687 101.852 13.451 101.638 13.9968C101.423 14.5428 101.111 15.0174 100.703 15.4205C100.295 15.8238 99.7951 16.1419 99.2041 16.3748C98.6131 16.6077 97.9374 16.7242 97.1777 16.7242C96.1922 16.7242 95.3443 16.5521 94.6338 16.208C93.9227 15.8638 93.2998 15.3928 92.765 14.7946L93.0609 14.3358C93.1449 14.2314 93.2435 14.1793 93.3567 14.1793C93.4199 14.1793 93.5012 14.221 93.5998 14.3045C93.6984 14.3879 93.8178 14.4906 93.9588 14.6122C94.0998 14.7339 94.2692 14.8661 94.4665 15.0085C94.6637 15.1511 94.8922 15.2833 95.1533 15.4048C95.4137 15.5266 95.713 15.6291 96.0519 15.7125C96.3901 15.796 96.7742 15.8377 97.2041 15.8377C97.7957 15.8377 98.3242 15.749 98.7895 15.5717C99.2548 15.3944 99.6479 15.1529 99.968 14.8468C100.289 14.5409 100.534 14.1777 100.703 13.7569C100.872 13.3364 100.956 12.886 100.956 12.4062C100.956 11.8847 100.849 11.4555 100.634 11.1181C100.419 10.7809 100.135 10.4993 99.7833 10.2733C99.4305 10.0474 99.0305 9.85789 98.5833 9.70487C98.136 9.55199 97.6763 9.40233 97.2041 9.25638C96.7318 9.11036 96.2721 8.94705 95.8241 8.76617C95.3769 8.58543 94.9769 8.35419 94.6248 8.07258C94.272 7.79097 93.9887 7.43992 93.7734 7.01916C93.5588 6.59853 93.4511 6.07181 93.4511 5.43902C93.4511 4.94538 93.5463 4.46903 93.7366 4.01011C93.9269 3.55119 94.2053 3.14621 94.572 2.79502C94.938 2.44397 95.3908 2.16236 95.9304 1.95019C96.4693 1.73816 97.0839 1.63208 97.7749 1.63208C98.5499 1.63208 99.2458 1.75381 99.8625 1.99713C100.479 2.24059 101.041 2.6125 101.548 3.11313L101.294 3.59291Z" fill="#000105"/>
						</g>
					</svg>
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

	const href = getHref({anchor, lc_xid, title, language})
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

	// TODO: fix this content
	const newLabel = label === "Open in Amboss" ? title : label

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
							<h4>${newLabel}</h4>
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
