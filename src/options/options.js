import { defaultExtensionOptions, OptionKeys } from '../common/options';

const saveOptions = () => {
	const options = {};
	options[OptionKeys.common.pageWidth] = document.getElementById("common-page-width").value;
	options[OptionKeys.pr.filesChanged.fileTreeWidth] = document.getElementById("pr-files-tree-width").value;
	options[OptionKeys.pr.filesChanged.singleFileDiffing] = !!document.getElementById("pr-files-single-diff").checked;
	options[OptionKeys.pr.filesChanged.autoLoadLargeDiffs] = !!document.getElementById("pr-files-auto-load-large-diff").checked;

	chrome.storage.sync.set(options, () => {
		const statusEl = document.getElementById("status");
		statusEl.textContent = "Options saved.";
		setTimeout(() => {
			statusEl.textContent = "";
		}, 2000);
	});
};

const restoreOptions = () => {
	chrome.storage.sync.get(defaultExtensionOptions, (settings) => {
		document.getElementById("common-page-width").value = settings[OptionKeys.common.pageWidth];
		document.getElementById("pr-files-tree-width").value = settings[OptionKeys.pr.filesChanged.fileTreeWidth];
		document.getElementById("pr-files-single-diff").checked = settings[OptionKeys.pr.filesChanged.singleFileDiffing];
		document.getElementById("pr-files-auto-load-large-diff").checked = settings[OptionKeys.pr.filesChanged.autoLoadLargeDiffs];
	});
};

document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("save").addEventListener("click", saveOptions);
