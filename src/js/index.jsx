import React from 'react';
import { render } from 'react-dom';
import Tree from './components/tree';
import { createFileTree, createOrGetPRFilesChangedTreeContainerEl, getPartialDiscussionHeaderEl, switchDiffPanelToHash } from './lib';
import type { ExtSettings } from '../common/options';
import { defaultExtensionOptions, OptionKeys } from '../common/options';

const { document, MutationObserver } = window;

let observer;
const observe = () => {
	observer && observer.disconnect();
	const pjaxContainer = document.querySelector("[data-pjax-container]");
	if (!pjaxContainer) {
		return;
	}
	observer = new MutationObserver(start);
	observer.observe(pjaxContainer, { childList: true });
};

const injectStyles = (settings: ExtSettings) => {
	let cssToInject = {};

	if (settings[OptionKeys.common.pageWidth]) {
		cssToInject[".container"] = {
			"width": settings[OptionKeys.common.pageWidth],
		};
	}
	if (settings[OptionKeys.pr.filesChanged.fileTreeWidth]) {
		cssToInject[".enable_better_github_pr .__better_github_pr"] = {
			width: settings[OptionKeys.pr.filesChanged.fileTreeWidth],
		};

		cssToInject[".enable_better_github_pr .diff-view, .enable_better_github_pr .commit.full-commit.prh-commit"] = {
			"margin-left": `calc(${settings[OptionKeys.pr.filesChanged.fileTreeWidth]} + 10px)`,
		};
	}

	const cssSelectors = Object.keys(cssToInject);
	if (!cssSelectors.length) {
		return;
	}

	const cssStr = cssSelectors.reduce((str, selector, index) => {
		const cssPropValuePairs = Object.entries(cssToInject[selector]).map(([key, value]) => `${key}: ${value};`);
		str += `${selector} { ${cssPropValuePairs} }\n`;
		return str;
	}, "");

	const styleEl = document.createElement("style");
	styleEl.type = "text/css";
	if ("textContent" in styleEl) {
		styleEl.textContent = cssStr;
	} else {
		styleEl.innerText = cssStr;
	}
	document.head.appendChild(styleEl);
};

const renderTree = (extSettings: ExtSettings) => {
	const rootElement = createOrGetPRFilesChangedTreeContainerEl();
	const enabled = Boolean(rootElement);
	document.body.classList.toggle("enable_better_github_pr", enabled);
	if (!enabled) {
		return;
	}

	const { tree } = createFileTree(settings);
	render(<Tree root={ tree } extSettings={ settings }/>, rootElement);

	const singleFileDiffing = extSettings[OptionKeys.pr.filesChanged.singleFileDiffing];
	if (singleFileDiffing) {
		switchDiffPanelToHash(extSettings);
	}

	if (document.querySelector('.diff-progressive-loader')) {
		setTimeout(renderTree.bind(this, settings), 100);
	}
};

const renderToBottomLink = (extSettings: ExtSettings) => {
	const containerEl = getPartialDiscussionHeaderEl();
	if (!containerEl || containerEl.querySelector("#better-github-to-bottom")) {
		return;
	}

	const onClick = () => {
		const footer = document.querySelector('.footer');
		if (footer) {
			footer.scrollIntoView();
		}
	};

	const targetEl = document.createElement("div");
	containerEl.appendChild(targetEl);
	render(<span id="better-github-to-bottom" className="btn-link" onClick={ onClick }>Jump to Bottom</span>, targetEl);
};

const start = (settings: ExtSettings) => {
	observe();
	renderTree(settings);
};

let settings;
chrome.storage.sync.get(defaultExtensionOptions, (extSettings) => {
	settings = extSettings;
});

window.addEventListener('DOMContentLoaded', (e) => {
	let contentBody = document.body.querySelector('.application-main');
	if (contentBody) {
		contentBody.style.visibility = 'hidden';
	}

	require('./style.css');

	while (!settings) { }

	injectStyles(settings);
	if (contentBody) {
		contentBody.style.visibility = '';
	}

	renderToBottomLink(settings);

	if (settings[OptionKeys.pr.filesChanged.singleFileDiffing]) {
		window.addEventListener('popstate', (e) => {
			switchDiffPanelToHash(settings);
		});
	}

	observe();
	start(settings);
});

