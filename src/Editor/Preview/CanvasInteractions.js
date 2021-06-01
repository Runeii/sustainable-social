let canvas = null;
let context = null;
let currentShapeRef = { top: 0, left: 0, width: 0, height: 0};
let image = null;

export const getCanvasCoords = function (clientX, clientY) {
	var rect = canvas.getBoundingClientRect();

	return {
		x: clientX - rect.left,
		y: clientY - rect.top
	};
};

export const onMouseUp = (addShape) => {
	context = null;

	const { width, height, left, top } = currentShapeRef;
	if (width === 0 || height === 0) {
		return;
	}

	const topLeftX = left + Math.min(width, 0);
	const topLeftY = top + Math.min(height, 0);
	const safeWidth = Math.abs(width);
	const safeHeight = Math.abs(height);

	addShape({
		width: (safeWidth / canvas.width) * 100,
		height: (safeHeight / canvas.height) * 100,
		left: (topLeftX / canvas.width) * 100,
		top: (topLeftY / canvas.height) * 100,
	});
}

export const onMouseDown = (event, img, addShape) => {
	canvas = event.target;
	image = img;
	context = canvas.getContext('2d');
	const coords = getCanvasCoords(event.clientX, event.clientY);
	currentShapeRef = { left: coords.x, top: coords.y, width: 0, height: 0 };

	window.addEventListener('mouseup', () => onMouseUp(addShape), { once: true });
};

export const onMouseMove = event => {
	if (!context) {
		return;
	}

	context.clearRect(0, 0, canvas.width, canvas.height);
	context.drawImage(image, 0, 0, canvas.width, canvas.height);

	const { left: startX, top: startY } = currentShapeRef;
	const coords = getCanvasCoords(event.clientX, event.clientY);
	const width = coords.x - startX;
	const height = coords.y - startY;

	context.strokeStyle = 'blue'
	context.strokeRect(startX, startY, width, height);
	currentShapeRef = { left: startX, top: startY, width, height }
};
