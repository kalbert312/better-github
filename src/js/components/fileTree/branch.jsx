// @flow

import React from "react";
import TreeView from "react-treeview";
import File from "./file";
import type { FileNode } from "../../bridge/github-elements";

const Branch = (branchNode: FileNode) => {
	const { nodeLabel, list, href, hasComments, diffElement, visibleElement, onClick, fileStatus } = branchNode;

	if (href) {
		const isVisible = (diffElement === visibleElement);
		return <File name={ nodeLabel } href={ href } hasComments={ hasComments } isVisible={ isVisible } onClick={ onClick } fileStatus={ fileStatus }/>;
	}

	return (
		<TreeView nodeLabel={ nodeLabel } defaultCollapsed={ false }>
			{ list.map(node => (
				<span key={ node.nodeLabel }>
                    <Branch { ...node } visibleElement={ visibleElement }/>
                </span>
			)) }
		</TreeView>
	);

	// changes
};

export default Branch;
