export const BACKEND = process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : '';

export const getPreviewImage = async (remoteID, savedShapes, options) => {
	const img = new Image();
	img.src = getFinalImageUrl(remoteID, savedShapes, options, false);
	img.decoding = 'async';
	await img.decode()
	return img;
}

export const getFinalImageUrl = (remoteID, savedShapes, options, isAnimation = false) => {
	const shapes = encodeURIComponent(JSON.stringify(savedShapes))
	const { stepCount, stepWidth } = options;
	return `${BACKEND}/image/${remoteID}${isAnimation ? '.gif' : ''}?shapes=${shapes}&stepCount=${stepCount}&stepWidth=${stepWidth / 100}&isAnimation=${isAnimation}`;
}

export const refreshImage = async (context, canvasRef, containerRef, image) => {
	if (!image) {
		return;
	}
	canvasRef.current.width = canvasRef.current.clientWidth
	canvasRef.current.height = canvasRef.current.clientHeight
	context.drawImage(image, 0, 0, canvasRef.current.clientWidth, canvasRef.current.clientHeight);
};

export const refreshShapes = (context, savedShapes) => {
	savedShapes.map(({ left, top, width, height}, i) => {
		context.strokeStyle = 'transparent'
		context.strokeRect(left, top, width, height);
		return true;
	})
};