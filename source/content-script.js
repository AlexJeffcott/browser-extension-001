import tippy from 'tippy.js';
import {getData} from './api';
import {BASE_URL} from './config';
import optionsStorage from './options-storage';
import {sendMessageToBackgroundScript} from './messaging';
import { term_list_calculated, tooltip_anchor_hovered, tooltip_link_clicked } from './event-names'

const iconAmbossLogoData = 'data:image/png;base64,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';
// Var iconBookData = 'data:image/png;base64,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'

// function getAllTextNodesAsArray(node, allNodes) {
// 	if (
// 		node.tagName === 'SCRIPT' ||
// 		node.tagName === 'INPUT' ||
// 		node.tagName === 'STYLE' ||
// 		node.tagName === 'CITE' ||
// 		node.hidden
// 	) {
// 		return;
// 	}
//
// 	if (node.nodeType === Node.TEXT_NODE && /[a-zA-Z]{3,}/.exec(node.textContent) !== null) {
// 		allNodes.push(node);
// 		return;
// 	}
//
// 	if (node.childNodes && node.childNodes.length) {
// 		for (let i = 0; i < node.childNodes.length; i++) {
// 			getAllTextNodesAsArray(node.childNodes.item(i), allNodes);
// 		}
// 	}
// }

// function nodeCurrentlyInViewport(node) {
// 	const containerRect = document.body.getBoundingClientRect()
// 	const range = document.createRange();
// 	range.selectNodeContents(node);
// 	const rects = range.getClientRects();
// 	if (rects.length > 0) {
// 		// if (rects[0].height > 500) return true
// 		const topOfNodeIsWithinViewport = rects[0].top - containerRect.top > window.innerHeight
// 		// const bottomOfNodeIsWithinViewport = rects[0].bottom < window.innerHeight && rects[0].bottom > 0
//
// 		return topOfNodeIsWithinViewport
// 	}
// }

// function nodeCurrentlyInViewport (node) {
// 	const range = document.createRange();
// 	range.selectNodeContents(node);
// 	const nodeRect = range.getClientRects() || [];
// 	const holder = document.body
// 	const holderRect = holder.getBoundingClientRect()
//
// 	if(nodeRect.length > 0 && holderRect) {
// 		return nodeRect[0].top <= holderRect.top
// 			? holderRect.top - nodeRect[0].top <= nodeRect[0].height
// 			: nodeRect[0].bottom - holderRect.bottom <= nodeRect[0].height
// 	}
// }
// function nodeCurrentlyInViewport (node) {
// 	if (!node.textContent) return false;
//
// 	const range = document.createRange();
// 	range.selectNodeContents(node);
// 	const nodeRect = range.getClientRects() || [];
// 	if (nodeRect.length === 0) return false;
//
// 	const viewportTop = window.scrollY
// 	const viewportBottom = window.scrollY + window.innerHeight
// 	const nodeTop = nodeRect[0].top
// 	const nodeBottom = nodeRect[0].bottom
// 	const nodeTopIsOnScreen = nodeTop >= viewportTop && nodeTop <= viewportBottom
// 	const nodeBottomIsOnScreen = nodeBottom >= viewportTop && nodeBottom <= viewportBottom
//
// 	return nodeTopIsOnScreen || nodeBottomIsOnScreen
// }

// function getAllVisibleTextNodesAsArray(node, allNodes) {
// 	if (
// 		node.tagName === 'SCRIPT' ||
// 		node.tagName === 'INPUT' ||
// 		node.tagName === 'IMG' ||
// 		node.tagName === 'STYLE' ||
// 		node.tagName === 'CITE' ||
// 		node.tagName === 'SVG' ||
// 		node.hidden
// 		// !node.textContent && node.hasChildNodes() === false
// 	) {
// 		return;
// 	}
//
// 	if (node.nodeType === Node.TEXT_NODE && /[a-zA-Z]{3,}/.exec(node.textContent) !== null) {
// 	  // const isVisible = nodeCurrentlyInViewport(node)
// 		if (true) allNodes.push(node);
// 		return;
// 	}
//
// 	if (node.childNodes && node.childNodes.length) {
// 		for (let i = 0; i < node.childNodes.length; i++) {
// 			getAllVisibleTextNodesAsArray(node.childNodes.item(i), allNodes);
// 		}
// 	}
// }

const splitBy = /([,;(){}."])/;
const regEN = /([,;(){}.]|\[.*\]|\bAS\b|\bBE\b|\bTO\b|\bI\b|\bTHE\b|\bTHEN\b|\bWAS\b|\bWERE\b|\bAND\b|\bIN\b|\bOF\b|\bTHIS\b|\bAN\b|\bTHOSE\b|\bARE\b|\bIS\b|\bHAVE\b|\bHAD\b|\bWHEN\b|\bNOT\b|\bITS\b|\bWITH\b|\bFROM\b|\bFOR\b)/gi;

function getAllTextFromNodesAsString(allNodes) {
	return allNodes.reduce((acc, cur) => {
		if (!cur.textContent) {
			return acc;
		}

		cur.textContent.split(splitBy).forEach(i => {
			if (i.length > 2) {
				const text = i.replace(regEN, '');
				if (text.length > 2) {
					acc = acc + ' ' + text;
				}
			}
		});
		return acc;
	}, '');
}

function getSnippetTitlesThatExistInPageText(allText, snippets) {
	return snippets.reduce((acc, cur) => {
		if (cur.destinations.length === 0) {
			return acc;
		}

		if (allText.toLowerCase().includes(cur.title.toLowerCase())) {
			acc.push(cur);
			return acc;
		}

		if (cur.synonyms.length > 0) {
			cur.synonyms.forEach(syn => {
				if (allText.includes(syn)) {
					acc.push(cur);
					return acc;
				}
			});
		}

		return acc;
	}, []);
}

function getNodesAndMatchingSnippets(allTextNodes, snippetsMatchingText) {
	return allTextNodes.reduce((acc, cur) => {
		snippetsMatchingText.forEach(snippet => {
			const regexpTitleMatcher = new RegExp(snippet.title, 'i');
			const regexpTitle = regexpTitleMatcher.test(cur.textContent);
			if (regexpTitle) {
				acc.push({node: cur, snippet, matchingTerm: snippet.title});
			}

			if (snippet.synonyms && snippet.synonyms.length) {
				snippet.synonyms.forEach(synonym => {
					const regexpSynonymMatcher = new RegExp(synonym, 'i');
					const regexpSynonym = regexpSynonymMatcher.exec(cur.textContent);
					if (regexpSynonym) {
						acc.push({node: cur, snippet, matchingTerm: synonym});
					}
				});
			}
		});
		return acc;
	}, []);
}

function findAllTextNodes(n){
	var walker = n.ownerDocument.createTreeWalker(n, NodeFilter.SHOW_TEXT);
	var textNodes = [];
	while (walker.nextNode())
		if (
			walker.currentNode.parentNode.tagName !== 'SCRIPT' &&
			walker.currentNode.parentNode.tagName !== 'INPUT' &&
			walker.currentNode.parentNode.tagName !== 'IMG' &&
			walker.currentNode.parentNode.tagName !== 'STYLE' &&
			walker.currentNode.parentNode.tagName !== 'CITE' &&
			walker.currentNode.parentNode.tagName !== 'SVG' &&
			!walker.currentNode.parentNode.hidden &&
			walker.currentNode.textContent.length > 2
		)
			textNodes.push(walker.currentNode);
	return textNodes;
}

function attachTooltipsToDOM({ node, snippet, matchingTerm, language }){
		const { title, destinations, etymology, description } = snippet || {};
		const { anchor, label, lc_xid } = Array.isArray(destinations) && destinations[0] || {};
		const href = `${BASE_URL}${language === 'en' ? 'us' : 'de'}/article/${lc_xid}#${anchor}`;

		// Var textNodes = findAllTextNodes(document.body);
		const regexpMatcher = new RegExp(`\\b${matchingTerm}(s|es|'s)?\\b`, 'i');
		// TextNodes.forEach(function(textNode){
		textNodeReplace(node, regexpMatcher, textNodeReplaceHandler);

		// });

		function textNodeReplaceHandler (matched) {
			return {
				name: 'span',
				attrs: { class: 'AMBOSS_MATCH_TOOLTIP' },
				content: [
					matched,
					{
						name: 'img',
						attrs: {
							src: iconAmbossLogoData,
							'data-popover-target': 'AMBOSS_POPOVER_TARGET',
							'data-title': title,
							'data-etymology': etymology,
							'data-link': href,
							'data-label': label,
							'data-description': description
						},
						listeners: [
							{
								eventName: 'mouseover',
								eventHandler: mouseEnterHandler
							}
						]
					}
				]
			};
		}

		function mouseEnterHandler (event) {
			event.stopPropagation();
			sendMessageToBackgroundScript({
				subject: 'track',
				trackingProperties: [tooltip_anchor_hovered, { title }, window.location.hostname]
			});

			tippy(event.target, {
				allowHTML: true,
				interactive: true,
				arrow: true,
				appendTo: document.body,
				showOnCreate: true,
				content: `<div key=${title} class="ambossContent">
										<div id="ambossHeader" class="ambossHeader">
											<img src="${iconAmbossLogoData}" class="iconAmbossLogo" />
											<span>AMBOSS</span>
										</div>
										<div id="ambossSnippetTitle" class="ambossSnippetTitle">
											${title}
										</div>
										<div>
											${etymology ? `<div class="ambossSnippetEtymology">${etymology}</div>` : ''}
											<div class="ambossSnippetDescription">${description}</div>
											${lc_xid ? `<div id="ambossFooter" class="ambossFooter">
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
														<p>${label}</p>
														<div class="arrow_container">
															<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
																<line x1="5" y1="12" x2="19" y2="12"></line>
																<polyline points="12 5 19 12 12 19"></polyline>
															</svg>
													</div>
												</div>
												</a>
											</div>` : ''}
										</div>
									</div>`
			});
			const handleLinkClick = () => sendMessageToBackgroundScript({
				subject: 'track',
				trackingProperties: [tooltip_link_clicked, {
					title,
					href
				}, window.location.hostname]
			});
			document.querySelector('div[id=\'ambossFooter\']').addEventListener('click', handleLinkClick);
		}

		function textNodeReplace (node, regex, handler) {
			const mom = node.parentNode;
			const nxt = node.nextSibling;
			const doc = node.ownerDocument;
			let
				hits;
			if (regex.global) {
				while (node && (hits = regex.exec(node.nodeValue))) {
					regex.lastIndex = 0;
					node = handleResult(node, hits, handler.apply(this, hits));
				}
			} else if (hits = regex.exec(node.nodeValue)) {
				handleResult(node, hits, handler.apply(this, hits));
			}

			function handleResult (node, hits, results) {
				const orig = node.nodeValue;
				node.nodeValue = orig.slice(0, hits.index);
				[].concat(create(mom, results)).forEach(n => {
					mom.insertBefore(n, nxt);
				});
				const rest = orig.slice(hits.index + hits[0].length);
				return rest && mom.insertBefore(doc.createTextNode(rest), nxt);
			}

			function create (el, o) {
				if (o.map) {
					return o.map(v => {
						return create(el, v);
					});
				}

				if (typeof o === 'object') {
					const e = doc.createElementNS(o.namespaceURI || el.namespaceURI, o.name);
					if (o.attrs) {
						for (const a in o.attrs) {
							e.setAttribute(a, o.attrs[a]);
						}
					}

					if (o.listeners) {
						o.listeners.forEach(l => e.addEventListener(l.eventName, l.eventHandler));
					}

					if (o.content) {
						[].concat(create(e, o.content)).forEach(e.appendChild, e);
					}

					return e;
				}

				return doc.createTextNode(String(o));
			}
		}
	}

async function processDOM(language, allTextNodes) {
	// const allTextNodes = await findAllTextNodes(document.body);
	// getAllTextNodesAsArray(document.querySelector('body'), allTextNodes);

	// const allVisibleTextNodes = [];
	// getAllVisibleTextNodesAsArray(document.querySelector('body'), allTextNodes);

	// let oldDivMarker = document.querySelector("#AMBOSS_MARKER")
	// let divMarker = document.createElement("div");
	// divMarker.setAttribute("id", "AMBOSS_MARKER")
	// divMarker.style.position = "absolute"
	// divMarker.style.height = "10px"
	// divMarker.style.width = "10px"
	// divMarker.style.backgroundColor = "red"
	// divMarker.style.top = `calc(${window.scrollY}px + ${window.innerHeight / 10}px)`
	// if(!!oldDivMarker) {
	// 	oldDivMarker.replaceWith(divMarker)
	// } else {
	// 	document.body.append(divMarker);
	// }
	//
	// let options = {
	// 	root: null,
	// 	rootMargin: '0px',
	// 	threshold: 0.0
	// }
	//
	// let intersectionObserver = new IntersectionObserver(function(entries, observer) {
	// 	if(entries[0].intersectionRatio > 0) return;
	// 	processDOM(language)
	// }, options);
	// intersectionObserver.observe(divMarker);

	const allTextAsString = await getAllTextFromNodesAsString(allTextNodes);

	const snippets = await getData(language);
	const snippetsMatchingText = await getSnippetTitlesThatExistInPageText(
		allTextAsString,
		snippets
	);

	const allNodesAndMatchingSnippets = await getNodesAndMatchingSnippets(
		allTextNodes,
		snippetsMatchingText
	);

	return {snippetsMatchingText, allNodesAndMatchingSnippets};
}

async function activateTooltips(language = 'en') {
	document.body.style.height = "unset"
	const allTextNodes = await findAllTextNodes(document.body)
	let snippetsMatchingText;

	if (allTextNodes.length < 200) {
		const batch1 = await processDOM(language, allTextNodes);
		batch1.allNodesAndMatchingSnippets.forEach(i => attachTooltipsToDOM({...i, language}));
		snippetsMatchingText = batch1.snippetsMatchingText
	}

	if (allTextNodes.length > 199 && allTextNodes.length < 500) {
		const b1 = allTextNodes.length / 4
		const batch1 = await processDOM(language, allTextNodes.slice(0, b1));
		batch1.allNodesAndMatchingSnippets.forEach(i => attachTooltipsToDOM({...i, language}));

		const batch2 = await processDOM(language, allTextNodes.slice(b1-1));
		batch2.allNodesAndMatchingSnippets.forEach(i => attachTooltipsToDOM({...i, language}));

		snippetsMatchingText = [...batch1.snippetsMatchingText, ...batch2.snippetsMatchingText]
	}

	if (allTextNodes.length > 499) {
		const b1 = allTextNodes.length / 4
		const b2 = b1*2
		const b3 = b1*3
		const batch1 = await processDOM(language, allTextNodes.slice(0, b1));
		batch1.allNodesAndMatchingSnippets.forEach(i => attachTooltipsToDOM({...i, language}));

		const batch2 = await processDOM(language, allTextNodes.slice(b1-1, b2));
		batch2.allNodesAndMatchingSnippets.forEach(i => attachTooltipsToDOM({...i, language}));

		const batch3 = await processDOM(language, allTextNodes.slice(b2-1, b3));
		batch3.allNodesAndMatchingSnippets.forEach(i => attachTooltipsToDOM({...i, language}));

		const batch4 = await processDOM(language, allTextNodes.slice(b3-1));
		batch4.allNodesAndMatchingSnippets.forEach(i => attachTooltipsToDOM({...i, language}));

		snippetsMatchingText = [
			...batch1.snippetsMatchingText,
			...batch2.snippetsMatchingText,
			...batch4.snippetsMatchingText,
			...batch4.snippetsMatchingText
		]
	}

	return snippetsMatchingText
}

async function initializeTooltips() {
	const {hostname} = window.location;
	const languageGuess = recognizeLanguage();
	const {lang, blacklistedSites} = await optionsStorage.getAll();
	const isBlacklisted = await blacklistedSites.some(i => i === hostname);
	if (isBlacklisted) {
		return;
	}

	let language;
	if (lang === 'en' || lang === 'de') {
		language = lang;
	} else if (lang === 'auto') {
		language = languageGuess || 'en';
	} else {
		throw new Error('Language choice in initializeTooltips was not \'en\', \'de\' or \'auto\'');
	}

	const snippetsMatchingText = await activateTooltips(language);

	const termsFoundOnSite = snippetsMatchingText.reduce((acc, cur) => acc + '|' + cur.title, '')

	sendMessageToBackgroundScript({
		subject: 'track',
		trackingProperties: [term_list_calculated, { termsFoundOnSite }, window.location.hostname]
	})
	return snippetsMatchingText
}

function initMessageListener() {
	const {hostname, href} = window.location;
	const snippetsMatchingText = initializeTooltips();

	browser.runtime.onMessage.addListener(async message => {
		switch (message.subject) {
			case 'getHostname': {
				return Promise.resolve({hostname});
			}

			case 'getUrl': {
				return Promise.resolve({url: href});
			}

			case 'getSnippetsMatchingText': {
				return snippetsMatchingText;
			}

			default:
				throw new Error('Message requires message.subject');
		}
	});
}

initMessageListener();

function recognizeLanguage() {
	let language = document.documentElement.lang;
	if (language === '') {
		document.URL.split('.').forEach(subpart => {
			switch (subpart) {
				case 'de':
					language = 'de';
					break;
				case 'uk':
					language = 'en';
					break;
			}
		});
	}

	return language;
}
