export const BACKEND = process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : '';

export const getPreviewImage = async (remoteID, savedShapes) => {
	const img = new Image();
	const shapes = encodeURIComponent(JSON.stringify(savedShapes))
	img.src = `${BACKEND}/image/${remoteID}?shapes=${shapes}`;
	img.decoding = 'async';
	await img.decode()
	return img;
}

export const getFinalImageUrl = (remoteID, savedShapes, isAnimation = false) => {
	const shapes = encodeURIComponent(JSON.stringify(savedShapes))
	return `${BACKEND}/image/${remoteID}${isAnimation ? '.gif' : ''}?shapes=${shapes}&isAnimation=${isAnimation}`;
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