import {h, render} from 'preact';
import {useState, useEffect} from 'preact/hooks';
import htm from 'htm';
import {track} from './tracking-helpers';
import optionsStorage from './options-storage';
import TrashIconRed from './media/trash_icon_red.png';
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
							<img src=${TrashIconRed} alt="Trash Can" className="trash_icon" onClick=${() => removeBlacklistSite(site)} />
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
