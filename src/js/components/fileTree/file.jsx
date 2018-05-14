// @flow

import React from 'react';
import fileIcons from 'file-icons-js';
import type { FileNode } from '../../lib';

const highlightColor = "#ebebeb";
const transparentColor = "transparent";

const File = (fileNode: FileNode) => {
	const { name, href, hasComments, isVisible, onClick } = fileNode;
	const className = fileIcons.getClassWithColor(name);
	return (
		<div className='github-pr-file' style={ { background: isVisible ? highlightColor : transparentColor } }>
			<span className={ `icon ${className}` }/>
			<a href={ href } className='link-gray-dark' onClick={ onClick }>{ name }</a> { hasComments ? " 💬" : "" }
		</div>
	);
};

export default File;
