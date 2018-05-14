// @flow

export type ExtSettings = {
	[key: string]: mixed,
};

export const OptionKeys = {
	common: {
		pageWidth: "common_pageWidth",
	},
	pr: {
		filesChanged: {
			autoLoadLargeDiffs: "pr_filesChanged_autoLoadLargeDiffs",
			fileTreeWidth: "pr_filesChanged_fileTreeWidth",
			fileTreeFileColorAdded: "pr_filesChanged_fileColor_added",
			fileTreeFileColorDeleted: "pr_filesChanged_fileColor_deleted",
			fileTreeFileColorModified: "pr_filesChanged_fileColor_modified",
			fileTreeFileColorMoved: "pr_filesChanged_fileColor_moved",
			fileTreeFileColorRenamed: "pr_filesChanged_fileColor_renamed",
			singleFileDiffing: "pr_filesChanged_singleFileDiffing",
		},
	},
};

export const defaultExtensionOptions: ExtSettings = Object.freeze({
	[OptionKeys.common.pageWidth]: null,
	[OptionKeys.pr.filesChanged.fileTreeWidth]: "240px",
	[OptionKeys.pr.filesChanged.singleFileDiffing]: false,
	[OptionKeys.pr.filesChanged.autoLoadLargeDiffs]: false,
	[OptionKeys.pr.filesChanged.fileTreeFileColorAdded]: "#27ae60",
	[OptionKeys.pr.filesChanged.fileTreeFileColorDeleted]: "#c0392b",
	[OptionKeys.pr.filesChanged.fileTreeFileColorModified]: "#2980b9",
	[OptionKeys.pr.filesChanged.fileTreeFileColorMoved]: "#8e44ad",
	[OptionKeys.pr.filesChanged.fileTreeFileColorRenamed]: "#d35400",
});
