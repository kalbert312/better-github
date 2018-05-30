// @flow

import React from "react";
import TreeView from "react-treeview";
import File from "./file";

const Branch = (props) => {
	const { nodeLabel, list, type, href, hasComments, diffElement, visibleElement, fileStatus } = props;

	if (type === "file") {
		console.log(`diff: ${diffElement}, visible: ${visibleElement}`);
		const isVisible = (diffElement === visibleElement);
		return <File name={ nodeLabel } href={ href } hasComments={ hasComments } isVisible={ isVisible } fileStatus={ fileStatus }/>;
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
};

export default Branch;
