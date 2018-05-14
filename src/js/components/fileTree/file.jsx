// @flow

import React from 'react';
import fileIcons from 'file-icons-js';

const highlightColor = "#ebebeb";
const transparentColor = "transparent";

const File = ({ name, href, hasComments, isVisible, onClick, fileStatus }) => {
	const className = fileIcons.getClassWithColor(name);

	return (
		<div className='github-pr-file' style={ { background: isVisible ? highlightColor : transparentColor } } data-file-status={fileStatus}>
			<span className={ `icon ${className}` }/>
			<a href={ href } onClick={ onClick }>{ name }</a> { hasComments ? " 💬" : "" }
		</div>
	);
};

export default File;
