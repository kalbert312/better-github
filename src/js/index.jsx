import React from 'react';
import { render } from 'react-dom';
import Tree from './components/tree';
import { createFileTree, createRootElement } from './lib';
import { defaultExtensionOptions, OptionKeys } from '../common/options';

const { document, MutationObserver, parseInt } = window;

let observer;
const observe = () => {
	observer && observer.disconnect();
	const pjaxContainer = document.querySelector("[data-pjax-container]");
	observer = new MutationObserver(start);
	observer.observe(pjaxContainer, { childList: true });
};

const injectStyles = (settings) => {
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

const renderTree = (settings) => {
	const fileCount = parseInt((document.getElementById("files_tab_counter") || { innerText: 0 }).innerText, 10);
	const rootElement = createRootElement();
	const enabled = Boolean(rootElement && fileCount > 0);
	document.body.classList.toggle("enable_better_github_pr", enabled);
	if (!enabled) {
		return;
	}

	const { tree, count } = createFileTree();
	render(<Tree root={ tree }/>, rootElement);
	if (fileCount !== count) {
		setTimeout(renderTree.bind(this, rootElement), 100);
	}
};

const start = () => {
	observe();
	renderTree();
};

let settings;
chrome.storage.sync.get(defaultExtensionOptions, (extSettings) => {
	settings = extSettings;
});

window.addEventListener('DOMContentLoaded', (e) => {
	let contentBody = document.body.querySelector('.application-main');
	contentBody.style.visibility = 'hidden';

	require('./style.css');

	while (!settings) { }

	injectStyles(settings);
	contentBody.style.visibility = '';

	observe();
	start();
});

