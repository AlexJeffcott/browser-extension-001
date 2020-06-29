import browser from 'webextension-polyfill'
import {h, render} from 'preact';
import {useState, useEffect} from 'preact/hooks';
import htm from 'htm';
import {track} from './tracking-helpers';
import optionsStorage from './options-storage';
import {options_opened, remove_blacklisted_site_clicked, add_blacklisted_site_clicked, language_choice_clicked} from './event-names'

const html = htm.bind(h);

const OptionsUi = () => {
	const [language, setLanguage] = useState('auto');
	const [blacklistedSites, setBlacklistedSites] = useState();
	const [blacklistInput, setBlacklistInput] = useState('');

	useEffect(() => {
		const getStorageData = async () => {
			const storageData = await optionsStorage.getAll();
			setBlacklistedSites(storageData.blacklistedSites);
			setLanguage(storageData.lang);
		};

		getStorageData();
	}, []);

	useEffect(() => track(options_opened), []);

	const onBlacklistInputChange = e => {
		setBlacklistInput(e.target.value);
	};

	const removeBlacklistSite = site => {
		track(remove_blacklisted_site_clicked, {blacklistedSiteNameRemoved: site})
		setBlacklistedSites(blacklistedSites.filter(i => i !== site));
	};

	const addBlacklistSite = () => {
		if (blacklistedSites.find(i => i === blacklistInput)) {
			console.log(`${blacklistInput} is already blacklisted`);
			track(add_blacklisted_site_clicked, {blacklistedSiteNameAdded: blacklistInput})
			return;
		}

		track(`clicked blacklist add button success for ${blacklistInput}`)
		setBlacklistInput('');
		setBlacklistedSites([...blacklistedSites, blacklistInput]);
	};

	const onLanguageRadioChange = e => {
		track(language_choice_clicked, {previousLanguageChoice: language, newLanguageChoice: e.target.value});
		setLanguage(e.target.value);
	};

	const onSubmit = e => {
		e.preventDefault();
		optionsStorage.set({blacklistedSites, lang: language});
	};

	return language && blacklistedSites && html`
		<form onSubmit=${onSubmit}>
			<div class="options_language_container">
				<h3>Language of Medical Terms</h3>
				<label for="lang_auto">
				<input
						type="radio"
						id="lang_auto"
						name="lang"
						value="auto"
						checked=${language === 'auto'}
						onClick=${onLanguageRadioChange}
				/>
					${browser.i18n.getMessage("languageChoiceAuto")}
				</label>
				<label for="lang_en">
					<input
						type="radio"
						id="lang_en"
						name="lang"
						value="en"
						checked=${language === 'en'}
						onClick=${onLanguageRadioChange}
					/>
					${browser.i18n.getMessage("languageChoiceEn")}
				</label>
				<label for="lang_de">
					<input
						type="radio"
						id="lang_de"
						name="lang"
						value="de"
						checked=${language === 'de'}
						onClick=${onLanguageRadioChange}
					/>
					${browser.i18n.getMessage("languageChoiceDe")}
				</label>
			</div>
			<div class="options_blacklist_container">
				<h3>${browser.i18n.getMessage("blacklistedSitesTitle")}</h3>
				<ul>
					${!blacklistedSites.length && html`<li>There are no blacklisted sites</li>`}
					${Boolean(blacklistedSites.length) && blacklistedSites.map(site => html`
						<li>
							${site}
							<svg class="trash_icon" onClick=${() => removeBlacklistSite(site)} xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="xMidYMid" viewBox="0 0 20 24">
							  <path d="M19.000,6.000 L17.910,6.000 L16.105,22.118 C15.986,23.173 15.062,24.000 14.000,24.000 L6.000,24.000 C4.937,24.000 4.014,23.172 3.897,22.116 L2.120,6.000 L1.000,6.000 C0.447,6.000 0.000,5.552 0.000,5.000 C0.000,4.448 0.447,4.000 1.000,4.000 L6.000,4.000 L6.000,3.000 C6.000,1.346 7.346,-0.000 9.000,-0.000 L11.000,-0.000 C12.654,-0.000 14.000,1.346 14.000,3.000 L14.000,4.000 L19.000,4.000 C19.553,4.000 20.000,4.448 20.000,5.000 C20.000,5.552 19.553,6.000 19.000,6.000 ZM12.000,3.000 C12.000,2.449 11.552,2.000 11.000,2.000 L9.000,2.000 C8.448,2.000 8.000,2.449 8.000,3.000 L8.000,4.000 L12.000,4.000 L12.000,3.000 ZM4.132,6.000 L5.885,21.896 C5.889,21.935 5.960,22.000 6.000,22.000 L14.000,22.000 C14.040,22.000 14.113,21.935 14.117,21.894 L15.897,6.000 L4.132,6.000 Z" class="cls-1"/>
							</svg>
						</li>
					`)}
				</ul>
				<input type="text" value=${blacklistInput} onChange=${onBlacklistInputChange} />
				<button onClick=${addBlacklistSite}>+</button>
			</div>
			<button type="submit">${browser.i18n.getMessage("submitOptionsButton")}</button>
		</form>
	`;
};

render(html`<${OptionsUi} />`, document.body);
