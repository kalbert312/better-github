// @flow

import type { ExtSettings } from "../../common/options";
import { OptionKeys } from "../../common/options";

export const createOrGetPRFilesChangedTreeContainerEl = (): ?HTMLElement => {
	const injectionElement = document.querySelector(".pr-toolbar");
	if (!injectionElement) {
		return;
	}
	const rootId = "__better_github_pr";
	let element = document.querySelector("." + rootId);
	if (!element) {
		element = document.createElement("div");
		element.className = rootId;
		injectionElement.appendChild(element);
	}
	return element;
};

export const getPartialDiscussionHeaderEl = (): ?HTMLElement => {
	return document.querySelector("#partial-discussion-header");
};

const sorter = (a, b): number => {
	const isFileA = Boolean(a.href);
	const isFileB = Boolean(b.href);
	if (isFileA === isFileB) {
		return (b.nodeLabel > a.nodeLabel) ? -1 : ((a.nodeLabel > b.nodeLabel) ? 1 : 0);
	} else if (isFileA && !isFileB) {
		return 1;
	} else {
		return -1;
	}
};

const hasCommentsForFileIndex = (fileIndex): number => {
	const diffTable = document.getElementById(`diff-${fileIndex}`);
	if (!diffTable) {
		return 0;
	}

	return diffTable.querySelectorAll(".inline-comments").length;
};

export const loadLargeDiffForDiffPanel = (buttonContainerEl) => {
	const loadDiffButton = buttonContainerEl.querySelector('button.load-diff-button');
	if (loadDiffButton) {
		loadDiffButton.click();
	}
};

export const switchDiffPanelToHash = (extSettings: ExtSettings) => {
	if (!document.querySelector("#better-github-pr-tree")) {
		return; // not relevant
	}

	let excludedDiffPanelEl;

	let hash = document.location.hash;
	if (hash && hash !== '') {
		let anchorName = hash.substring(0, 38); // #diff-<32 char hash> ...if there is a line number/function jump in it, there will be extra appended
		const anchorEl = document.querySelector(`a[href="${anchorName}"]`);
		if (anchorEl) {
			excludedDiffPanelEl = anchorEl.closest('.file');
			if (!excludedDiffPanelEl) { // check data tags
				anchorName = anchorName.substring(1); // strip #
				const dataAnchorEl = document.querySelector(`[data-anchor="${anchorName}"]`);
				if (dataAnchorEl) {
					excludedDiffPanelEl = dataAnchorEl.closest('.file');
				}
			}
		}
	}

	Array.prototype.slice.call(document.querySelectorAll(".file"))
		.filter((el) => el !== excludedDiffPanelEl)
		.forEach((el) => setDiffPanelHidden(el, true, extSettings));

	if (excludedDiffPanelEl) {
		setDiffPanelHidden(excludedDiffPanelEl, false, extSettings);
	}
};

export const setDiffPanelHidden = (diffElement: HTMLElement, hidden: boolean, extSettings: ExtSettings) => {
	diffElement.classList.toggle('better-diff-hidden', hidden);
	if (!hidden && extSettings[OptionKeys.diff.filesChanged.autoLoadLargeDiffs]) {
		loadLargeDiffForDiffPanel(diffElement);
	}
};

export const FileStatuses = Object.freeze({
	ADDED: 'Added',
	DELETED: 'Deleted',
	MODIFIED: 'Modified',
	MOVED: 'Moved',
	RENAMED: 'Renamed',
});
export type FileStatus = $Values<typeof FileStatus>;

export const getFileStatus = (diffEl: HTMLElement, title: string): FileStatus => {
	if (title.includes(" → ")) {
		const titleParts = title.split(" → ");
		const leftParts = titleParts[0].split("/");
		const rightParts = titleParts[1].split("/");
		if (leftParts.length !== rightParts.length) {
			return FileStatuses.MOVED;
		}
		for (let i = 0; i < leftParts.length - 1; i++) {
			if (leftParts[i] !== rightParts[i]) {
				return FileStatuses.MOVED;
			}
		}
		return FileStatuses.RENAMED;
	}

	const diffStatEl = diffEl.querySelector(".diffstat");
	if (!diffStatEl) {
		return null;
	}

	const addedCount = diffStatEl.querySelectorAll(".block-diff-added").length;
	const deletedCount = diffStatEl.querySelectorAll(".block-diff-deleted").length;
	const neutralCount = diffStatEl.querySelectorAll(".block-diff-neutral").length;
	const hasContext = !!diffEl.querySelector('.blob-code-context') || !!diffEl.querySelector('.diff-expander'); // TODO: may fail on non-loaded diffs... maybe make API call for large diffs?

	let fileStatus = FileStatuses.MODIFIED;
	if (addedCount || deletedCount || !hasContext) {
		if (addedCount && !deletedCount && !hasContext) {
			fileStatus = FileStatuses.ADDED;
		} else if (deletedCount && !addedCount && !hasContext) {
			fileStatus = FileStatuses.DELETED;
		}
	}

	return fileStatus;
};

export type FileNode = {
	nodeLabel: string,
	list: Array<FileNode>,
	href: ?string,
	hasComments?: boolean,
	diffElement?: HTMLElement,
	diffElements?: Array<HTMLElement>,
	fileStatus?: FileStatus,
};

const collapseInnerDirectories = (node, parent) => {
	if (node.list) {
		if (node.list.length === 1 && parent && !node.list[0].href) {
			node.list[0].nodeLabel = `${node.nodeLabel}/${node.list[0].nodeLabel}`;
			const idx = parent.list.indexOf(node);
			parent.list[idx] = node.list[0];
			collapseInnerDirectories(parent.list[idx], parent);
		} else {
			node.list.forEach(childNode => collapseInnerDirectories(childNode, node));
		}
	}
};

export const createFileTree = (extSettings: ExtSettings) => {
	const fileInfo = [...document.querySelectorAll(".file-info > a")];
	const files = fileInfo.map(({ title, href }) => {
		const fullTitle = title;
		const titleParts = title.split(" → ");
		title = titleParts.length > 1 ? titleParts[1] : titleParts[0];
		return { fullTitle, title, href, parts: title.split("/") };
	});
	const tree: FileNode = {
		nodeLabel: "/",
		list: [],
		diffElements: []
	};

	files.forEach(({ fullTitle, title, parts, href }, fileIndex) => {
		let location = tree;
		parts.forEach((part, index) => {
			let node: FileNode = location.list.find(node => node.nodeLabel === part);
			if (!node) { // file node
				const hasComments = (hasCommentsForFileIndex(fileIndex) > 0);
				const diffElement = document.getElementById(`diff-${fileIndex}`);
				tree.diffElements.push(diffElement);
				node = {
					nodeLabel: part,
					list: [],
					href: (index === parts.length - 1) ? href : null,
					hasComments,
					diffElement,
					fileStatus: getFileStatus(diffElement, fullTitle),
				};
				location.list.push(node);
			}
			location.list = location.list.sort(sorter);
			location = node;
		});
	});

	if (extSettings[OptionKeys.diff.filesChanged.collapseInnerDirectories]) {
		collapseInnerDirectories(tree, null);
	}

	return {
		tree,
		count: fileInfo.length
	};
};

export const isElementVisible = (el: HTMLElement): boolean => {
	if (!el || el.classList.contains('better-diff-hidden')) {
		return false;
	}

	const GITHUB_HEADER_HEIGHT = 60;

	const rect = el.getBoundingClientRect();

	const windowHeight = (window.innerHeight || document.documentElement.clientHeight);
	const windowWidth = (window.innerWidth || document.documentElement.clientWidth);

	const vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) >= GITHUB_HEADER_HEIGHT);
	const horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);

	return (vertInView && horInView);
};
