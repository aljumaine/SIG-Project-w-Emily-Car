let imgElement = document.getElementById('imageSrc');
console.log(imgElement)
let src = cv.imread(imgElement);

let dst = new cv.Mat();
let dsize = new cv.Size(300, 300);
// You can try more different parameters
cv.resize(src, dst, dsize, 0, 0, cv.INTER_AREA);
cv.imshow('canvasOutput', dst);
src.delete();
dst.delete();