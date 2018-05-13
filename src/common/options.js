// @flow

export type ExtSettings = {
	[key: string]: mixed,
};

export const OptionKeys = {
	common: {
		pageWidth: 'common_pageWidth',
	},
	pr: {
		filesChanged: {
			fileTreeWidth: 'pr_filesChanged_fileTreeWidth',
			singleFileDiffing: 'pr_filesChanged_singleFileDiffing',
			autoLoadLargeDiffs: 'pr_filesChanged_autoLoadLargeDiffs',
		},
	},
};

export const defaultExtensionOptions: ExtSettings = Object.freeze({
	[OptionKeys.common.pageWidth]: null,
	[OptionKeys.pr.filesChanged.fileTreeWidth]: '240px',
	[OptionKeys.pr.filesChanged.singleFileDiffing]: false,
	[OptionKeys.pr.filesChanged.autoLoadLargeDiffs]: false,
});
