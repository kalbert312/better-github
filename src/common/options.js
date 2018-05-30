// @flow

export type ExtSettings = {
	[key: string]: mixed,
};

export const OptionKeys = {
	api: {
		tokens: "K",
	},
	common: {
		pageWidth: "A",
	},
	diff: {
		filesChanged: {
			autoLoadLargeDiffs: "B",
			fileTreeEnabled: "C",
			fileTreeWidth: "D",
			fileTreeFileColorAdded: "E",
			fileTreeFileColorDeleted: "F",
			fileTreeFileColorModified: "G",
			fileTreeFileColorMoved: "H",
			fileTreeFileColorRenamed: "I",
			singleFileDiffing: "J",
		},
	},
};

export const defaultExtensionOptions: ExtSettings = Object.freeze({
	[OptionKeys.api.tokens]: [],
	[OptionKeys.common.pageWidth]: null,
	[OptionKeys.diff.filesChanged.fileTreeEnabled]: true,
	[OptionKeys.diff.filesChanged.fileTreeWidth]: "240px",
	[OptionKeys.diff.filesChanged.singleFileDiffing]: false,
	[OptionKeys.diff.filesChanged.autoLoadLargeDiffs]: false,
	[OptionKeys.diff.filesChanged.fileTreeFileColorAdded]: "#27AE60",
	[OptionKeys.diff.filesChanged.fileTreeFileColorDeleted]: "#C0392B",
	[OptionKeys.diff.filesChanged.fileTreeFileColorModified]: "#2980B9",
	[OptionKeys.diff.filesChanged.fileTreeFileColorMoved]: "#8E44AD",
	[OptionKeys.diff.filesChanged.fileTreeFileColorRenamed]: "#F39C12",
});
