// @flow

import type { ExtSettings } from "../../common/options";
import { OptionKeys } from "../../common/options";
import type { ApiResponseData } from "../index";

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
	const isFileA = a.type === "file";
	const isFileB = a.type === "file";
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
export type FileStatus = $Values<typeof FileStatuses>;

export type FileNode = {
	type: "file" | "directory",
	nodeLabel: string,
	list: Array<FileNode>,
	href?: string,
	hasComments?: boolean,
	diffElement?: HTMLElement,
	diffElements?: Array<HTMLElement>,
	fileStatus?: FileStatus,
};

type FileData = {
	path: string,
	parts: Array<String>,
	name: string,
	fileStatus: FileStatus,
	hasComments: ?boolean,
};

export const createFileTree = (extSettings: ExtSettings, apiResponseData: ApiResponseData) => {
	const files: Array<FileData> = apiResponseData.files.map((fileData) => {
		const path = fileData.filename;
		const parts = path.split("/");

		let fileStatus: FileStatus;
		switch (fileData.status) {
			case "added":
				fileStatus = FileStatuses.ADDED;
				break;
			case "modified":
				fileStatus = FileStatuses.MODIFIED;
				break;
			case "renamed":
				fileStatus = fileData.previous_filename === FileStatuses.RENAMED;

				const previousPath = fileData.previous_filename;
				const previousPathIndex = previousPath.lastIndexOf("/");
				const pathIndex = path.lastIndexOf("/");
				if (previousPathIndex !== pathIndex || (previousPathIndex === pathIndex && previousPathIndex !== -1 && previousPath.substring(0, previousPathIndex) !== path.substring(0, pathIndex))) {
					fileStatus = FileStatuses.MOVED;
				}
				break;
			case "removed":
				fileStatus = FileStatuses.DELETED;
				break;
		}

		return {
			path,
			parts,
			name: parts[parts.length - 1],
			fileStatus,
		};
	});

	apiResponseData.comments.forEach((commentData) => {
		const file = files.find((file) => file.path === commentData.path);
		if (file) {
			file.hasComments = true;
		}
	});

	const rootNode: FileNode = {
		nodeLabel: "/",
		list: [],
		diffElements: []
	};

	files.forEach((file) => {
		const { path, parts, fileStatus, hasComments } = file;

		let nodeCursor = rootNode;
		parts.forEach((part, index) => {
			let node: FileNode = nodeCursor.list.find(node => node.nodeLabel === part);

			if (!node) {
				const isFile = index === parts.length - 1;
				let anchorName, diffElement;
				if (isFile) {
					anchorName = getAnchorNameForPath(path);
					diffElement = getDiffPanelElForAnchorName(anchorName);
					rootNode.diffElements.push(diffElement);
				}

				node = {
					type: isFile ? "file" : "directory",
					nodeLabel: part,
					list: [],
					href: anchorName ? `#${anchorName}` : null,
					diffElement,
					hasComments,
					fileStatus,
				};
				nodeCursor.list.push(node);
			}

			nodeCursor.list = nodeCursor.list.sort(sorter);
			nodeCursor = node;
		});
	});

	return {
		tree: rootNode,
		count: files.length,
	};
};

export const getAnchorNameForPath = (path: string): ?string => {
	let el = document.querySelector(`[data-path="${path}"]`);
	return el != null ? el.getAttribute("data-anchor") : null;
};

export const getDiffPanelElForAnchorName = (anchorName: string): ?HTMLElement => {
	const anchorEl = document.querySelector(`a[name="${anchorName}"]`);
	return anchorEl != null ? anchorEl.nextElementSibling : null;
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
