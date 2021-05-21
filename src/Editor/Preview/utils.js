
export const getPreviewImage = async (remoteID, savedShapes) => {
	const img = new Image();
	const shapes = encodeURIComponent(JSON.stringify(savedShapes))
	img.src = `http://localhost:3001/preview/${remoteID}?shapes=${shapes}`;
	img.decoding = 'async';
	await img.decode()
	return img;
  }

  
export const refreshImage = async (context, canvasRef, containerRef, image) => {
	if (!image) {
		return;
	}

	const isNewImageLandscape = image.width > image.height;

	if (isNewImageLandscape) {
		canvasRef.current.width = containerRef.current.clientWidth;
		canvasRef.current.height = (containerRef.current.clientWidth / image.width) * image.height
	} else {
		canvasRef.current.height = canvasRef.current.clientHeight;
		canvasRef.current.width = (containerRef.current.clientHeight / image.height) * image.width
	}

	context.drawImage(image, 0, 0, canvasRef.current.width, canvasRef.current.height);
};

export const refreshShapes = (context, savedShapes) => {
	savedShapes.map(({ left, top, width, height}, i) => {
		context.strokeStyle = 'transparent'
		context.strokeRect(left, top, width, height);
		return true;
	})
};