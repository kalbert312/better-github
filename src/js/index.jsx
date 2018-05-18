// @flow

import { observe } from "./bridge/observation";
import React from "react";
import { render } from "react-dom";
import Tree from "./components/fileTree/tree";
import { createFileTree, createOrGetPRFilesChangedTreeContainerEl, FileStatuses, getPartialDiscussionHeaderEl, switchDiffPanelToHash } from "./bridge/github-elements";
import type { ExtSettings } from "../common/options";
import { OptionKeys } from "../common/options";

const { document } = window;

__webpack_public_path__ = window.chrome.extension.getURL(""); // allows proper loading of static assets

let settings;

const ajaxLoaderSelector = ".diff-progressive-loader";

const pjaxContainerSelector = "[data-pjax-container]";
let pjaxContainerObserver;
const observePjaxContainer = () => {
	pjaxContainerObserver && pjaxContainerObserver.disconnect();
	pjaxContainerObserver = observe(pjaxContainerSelector, () => onPjaxContainerMutated(settings));
	return pjaxContainerObserver;
};

const onPjaxContainerMutated = (settings: ExtSettings) => {
	observePjaxContainer();

	maybeRenderPRTree(settings);
	maybeRenderToBottomLink(settings);
};

const injectStyles = (extSettings: ExtSettings) => {
	let cssToInject = {};

	if (extSettings[OptionKeys.common.pageWidth]) {
		cssToInject[".container"] = {
			"width": extSettings[OptionKeys.common.pageWidth],
		};
	}
	if (extSettings[OptionKeys.diff.filesChanged.fileTreeWidth]) {
		cssToInject[".enable_better_github_pr .__better_github_pr"] = {
			"width": extSettings[OptionKeys.diff.filesChanged.fileTreeWidth],
		};

		cssToInject[".enable_better_github_pr .diff-view, .enable_better_github_pr .commit.full-commit.prh-commit"] = {
			"margin-left": `calc(${extSettings[OptionKeys.diff.filesChanged.fileTreeWidth]} + 10px)`,
		};
	}

	Object.values(FileStatuses).forEach((fileStatus) => {
		let configKey;
		switch (fileStatus) {
			case FileStatuses.ADDED:
				configKey = OptionKeys.diff.filesChanged.fileTreeFileColorAdded;
				break;
			case FileStatuses.DELETED:
				configKey = OptionKeys.diff.filesChanged.fileTreeFileColorDeleted;
				break;
			case FileStatuses.MODIFIED:
			default:
				configKey = OptionKeys.diff.filesChanged.fileTreeFileColorModified;
				break;
			case FileStatuses.MOVED:
				configKey = OptionKeys.diff.filesChanged.fileTreeFileColorMoved;
				break;
			case FileStatuses.RENAMED:
				configKey = OptionKeys.diff.filesChanged.fileTreeFileColorRenamed;
				break;
		}

		cssToInject[`.enable_better_github_pr .github-pr-file[data-file-status="${fileStatus}"] a`] = {
			"color": `${extSettings[configKey]}`,
		};
	});

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

const maybeRenderPRTree = (extSettings: ExtSettings) => {
	if (!extSettings[OptionKeys.diff.filesChanged.fileTreeEnabled]) {
		return;
	}

	const rootElement = createOrGetPRFilesChangedTreeContainerEl();
	const enabled = !!rootElement;
	document.body.classList.toggle("enable_better_github_pr", enabled);
	if (!enabled) {
		return;
	}

	const { tree } = createFileTree(settings);
	render(<Tree root={ tree } extSettings={ settings }/>, rootElement);

	const singleFileDiffing = extSettings[OptionKeys.diff.filesChanged.singleFileDiffing];
	if (singleFileDiffing) {
		switchDiffPanelToHash(extSettings);
	}

	if (document.querySelector(ajaxLoaderSelector)) {
		setTimeout(maybeRenderPRTree.bind(this, settings), 100);
	}
};

const maybeRenderToBottomLink = (extSettings: ExtSettings) => {
	const containerEl = getPartialDiscussionHeaderEl();
	if (!containerEl || containerEl.querySelector("#better-github-to-bottom")) {
		return;
	}

	const onClick = () => {
		const footer = document.querySelector(".footer");
		if (footer) {
			footer.scrollIntoView();
		}
	};

	const targetEl = document.createElement("div");
	containerEl.appendChild(targetEl);
	render(<span id="better-github-to-bottom" className="btn-link" onClick={ onClick }>Jump to Bottom</span>, targetEl);
};

const init = () => {
	let containers = Array.prototype.slice.call(document.body.querySelectorAll(".container"));
	if (containers && containers.length) {
		containers.forEach((c) => c.style.visibility = "hidden");
	}

	require("./style.css");

	chrome.runtime.sendMessage({ type: "getSettings" }, (response) => {
		let error;
		if (!response || response.error) {
			error = `Better GitHub | ${response.error}`;
		}
		settings = response.settings;
		if (!error) {
			injectStyles(settings);
		}
		setTimeout(() => {
			if (containers && containers.length) {
				containers.forEach((c) => c.style.visibility = "");
			}
		}, 50);
		if (error) {
			console.error(error);
			return;
		}

		if (settings[OptionKeys.diff.filesChanged.singleFileDiffing]) {
			window.addEventListener("popstate", (e) => {
				switchDiffPanelToHash(settings);
			});
		}

		onPjaxContainerMutated(settings);
	});
};

window.addEventListener("DOMContentLoaded", (e) => {
	init();
});


