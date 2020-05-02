// var canvas = document.createElement('canvas'),
	// ctx,
	// img = document.createElement('img');
// img.onload = function() {
    // createImageBitmap(img).then(imageBitmap => {
		// canvas.width = img.width; canvas.height = img.height;
		// ctx = canvas.getContext('2d');
		// ctx.drawImage(imageBitmap, 0, 0);
	// });
// };
// img.src = "./847.png";

function getPaths() {
	var canvas = document.createElement('canvas'),
		img = document.getElementById('img');
	
	canvas.width = img.width; canvas.height = img.height;
	ctx = canvas.getContext('2d');
	ctx.drawImage(img, 0, 0);

	document.getElementById('res').appendChild(canvas);
	canvas.onclick = ev => {
		console.log('canvas', ev);
		var x = ev.layerX,
			y = ev.layerY;
		var imgData = ctx.getImageData(x, y, 1, 1);
		red = imgData.data[0];
		green = imgData.data[1];
		blue = imgData.data[2];
		alpha = imgData.data[3];
		console.log(x, y, red + " " + green + " " + blue + " " + alpha);  

	};
	let res = MSQR(ctx, {path2D: true, maxShapes: 100});
	console.log('getPaths', res);
	res.paths.forEach((it, i) => {
		ctx.stroke(it);
		var arr = res.holes[i];
		arr.forEach(pt => {
			ctx.stroke(pt);
		});
	});
}

/*

   <script>
				
   		  function contur(){
	   		  var canvas = document.createElement('canvas');
	   		  var but1 = document.getElementById("but1");
	   		  document.body.insertBefore(canvas, but1);
					var ctx = canvas.getContext('2d');
					var image = document.getElementById('img1');
	   		  var canvas = document.createElement('canvas');
	   		  canvas.width = image.width; canvas.height = image.height;
	   		  var but1 = document.getElementById("but1");
	   		  document.body.insertBefore(canvas, but1);
					var context = canvas.getContext('2d');
					
					context.drawImage(image, 0, 0, canvas.width, canvas.height);
					
					ar = context.getImageData(0, 0, canvas.width, canvas.height).data;
	        ap = new Set();
	        for(i=0;i<ar.length;i+=4){
	        	if (ap.hasOwnProperty([ar[i],ar[i+1],ar[i+2],ar[i+3]])) {ap[[ar[i],ar[i+1],ar[i+2],ar[i+3]]]++;}
	        	else {ap[[ar[i],ar[i+1],ar[i+2],ar[i+3]]]=1;}
	        };
	        console.log(ap);
	        // 0,0,0,0: 1756083
					// 255,255,0,255: 52618
	        context.fillStyle = "#FF0000";
					//outlinePoints = MarchingSquaresOld.getBlobOutlinePoints(canvas);
	        //for(var i=0; i<outlinePoints.length; i+=2){
		      //context.fillRect(outlinePoints[i], outlinePoints[i+1], 1, 1);
	        let pathPoints = MSQR(context, {path2D: false, maxShapes: 10});
	        for(var i=0; i<pathPoints.length; i++){
	        	p = pathPoints[i];
		      	context.beginPath();
						context.moveTo(p[0].x,p[0].y);
		        for(var j=1; j<p.length; j+=2){
							context.lineTo(p[j].x,p[j].y);
		        }
						context.stroke();
	      	}
        };
*/
