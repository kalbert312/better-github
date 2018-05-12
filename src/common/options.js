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

export const defaultExtensionOptions = Object.freeze({
	[OptionKeys.common.pageWidth]: null,
	[OptionKeys.pr.filesChanged.fileTreeWidth]: '240px',
	[OptionKeys.pr.filesChanged.singleFileDiffing]: false,
	[OptionKeys.pr.filesChanged.autoLoadLargeDiffs]: false,
});
