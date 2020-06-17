import { h, render } from 'preact'
import htm from 'htm'
import { useEffect, useState } from 'preact/hooks'
import get from 'lodash.get'
import optionsStorage from './options-storage'
import { sendMessageToContentScript } from './messaging'
import { BASE_URL } from './config'
import { track } from './trackingHelpers'

const html = htm.bind(h)

const BrowserAction = () => {
	const [hostname, setHostname] = useState('')
	const [isBlacklisted, setIsBlacklisted] = useState(false)
	const [isShowGlossary, setIsShowGlossary] = useState(true)
	// const [isShowTooltips, setIsShowTooltips] = useState(true)
	const [language, setLanguage] = useState("en")
	const [terms, setTerms] = useState([])

	useEffect(() => sendMessageToContentScript({ subject: 'getHostnameAndLanguageGuess' }, 0).then(res => {
		setHostname(res.hostname)
	}), [])

	useEffect(() => {
		if (!terms.length) sendMessageToContentScript({ subject: 'getSnippetsMatchingText' }, 0).then(setTerms)
	}, [])

	// useEffect(() => {
	// 	if (isShowTooltips) sendMessageToContentScript({ subject: 'activateTooltips' }, 0).then(setTerms)
	// }, [])

	useEffect(() => {
		if (hostname) track('browser_addon_browser_action_opened')
	}, [hostname])

	useEffect(() => {
		const getStorageData = async () => {
			const { blacklistedSites, lang } = await optionsStorage.getAll()
			setIsBlacklisted(blacklistedSites.some(i => i === hostname))
			setLanguage(lang)
		}
		if (hostname) getStorageData()
	}, [hostname])

	const onIsBlacklistedClick = async e => {
		setIsBlacklisted(e.target.checked)

		const { blacklistedSites } = await optionsStorage.getAll()

		if (e.target.checked) {
			setTerms([])
			setIsShowGlossary(false)
		} else if (!e.target.checked && !terms.length) {
			sendMessageToContentScript({ subject: 'getSnippetsMatchingText', language }, 0).then(setTerms)
		}

		await optionsStorage.set({ blacklistedSites: e.target.checked
				? [...blacklistedSites, hostname]
				: [...new Set(blacklistedSites.filter(i => i !== hostname))] })

		track(`browser_addon_browser_action_blacklist_${e.target.checked ? 'on' : 'off'}`)
	}

	const onIsShowGlossary = () => {
		setIsShowGlossary(!isShowGlossary)
		if(isShowGlossary && !terms.length) sendMessageToContentScript({ subject: 'getSnippetsMatchingText', language }, 0).then(setTerms)
		track(`browser_addon_browser_action_glossary_${isShowGlossary ? 'on' : 'off'}`)
	}

	// const onIsShowTooltips = () => {
	// 	setIsShowTooltips(!isShowTooltips)
	// 	if(isShowTooltips) sendMessageToContentScript({ subject: 'activateTooltips', language }, 0)
	// 	track(`browser_addon_browser_action_tooltips_${isShowTooltips ? 'on' : 'off'}`)
	// }

				// <label for="isShowTooltips">
				// 	<input type="checkbox" id="isShowTooltips" disabled=${isBlacklisted} checked=${isShowTooltips} onClick=${onIsShowTooltips}/>
				// 	show tooltips
				// </label>
	return html`<div class="app">
			<div className="settings_bar">
				<label for="isBlacklisted">
					<input type="checkbox" id="isBlacklisted" checked=${isBlacklisted} onClick=${onIsBlacklistedClick}/>
					blacklist ${hostname}
				</label>
				<label for="isShowGlossary">
					<input type="checkbox" id="isShowGlossary" disabled=${isBlacklisted} checked=${isShowGlossary} onClick=${onIsShowGlossary}/>
					show glossary
				</label>
			</div>
				${isShowGlossary && !isBlacklisted && terms && terms.length > 0 && terms.map(term => html`<${Term} ...${term} language=${language} />`)}
		</div>`
}

function Term({title, etymology, description, id, destinations, language}){
	const [ isOpen, setIsOpen ] = useState(false)
	const { anchor, label, lc_xid } = get(destinations, `[0]`, {})

	// const anchorString = anchor ? `&anker=${anchor}` : ''
	// https://next.amboss.com/us/4N03Yg&anker=Zefeb92d093a9fbf8b7c983722bdbb10d&utm_source=chrome_plugin&utm_medium=browser_plugin&utm_campaign=browser_plugin&utm_term=FAST
	// const href = `${BASE_URL}${language === 'en' ? 'us' : 'de'}/${lc_xid}${anchorString}&utm_source=${BROWSER_NAME}_plugin&utm_medium=browser_plugin&utm_campaign=browser_plugin&utm_term=${title}`

	// https://next.amboss.com/us/article/4N03Yg#Zefeb92d093a9fbf8b7c983722bdbb10d
	const href = `${BASE_URL}${language === 'en' ? 'us' : 'de'}/article/${lc_xid}#${anchor}`

	const handleHeaderClick = () => {
		track(`browser_addon_${isOpen ? "closed" : "opened"}_content`, {href, title})
		setIsOpen(!isOpen)
	}

	const handleLinkClick = () => track(`browser_addon_content_link_clicked`, {href, title})

	return html`<div key=${id} class="ambossContent">
			<div class="ambossHeader" onClick=${handleHeaderClick}>${title}</div>
			${isOpen && html`<div>
				${!!etymology && html`<div class="ambossSnippetEtymology">${etymology}</div>`}
				<div class="ambossSnippetDescription">${description}</div>
				${!!lc_xid && html`<div id="ambossFooter" class="ambossFooter" onClick=${handleLinkClick}>
					<a href=${href} target="_blank">
						<div class="icon_container">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<rect x="4" y="2" width="16" height="20"></rect>
								<line x1="16" y1="6" x2="8" y2="6"></line>
								<line x1="14" y1="10" x2="8" y2="10"></line>
								<rect x="8" y="14" width="8" height="4"></rect>
							</svg>
						</div>
						<div class="link_arrow_container">
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
		</div>`
}

render(html`<${BrowserAction} />`, document.body);
