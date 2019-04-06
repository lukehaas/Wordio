var util = {
	sparkleTimer:null,
	sparkleImg:[],
	queueHandler:function() {
		var queue = arguments[0],
			qi = arguments[1];
		setTimeout(function() {
			$.when(queue[qi].action.apply(this,queue[qi].args)).then(function() {
				if(qi<queue.length-1) {
					qi++;
					util.queueHandler(queue,qi);
				}
			});
		},queue[qi].time);
	},
	removeSparkle:function() {
		clearTimeout(util.sparkleTimer);
		//$(".sparkle").remove();
		$(".sparkle").hide();
	},
	sparkle:function(elem) {
		$(".sparkle").show();
		var i = 0,
			z = 0,
			img = [],
			decider,
			x1 = [],
			x2 = [],
			y1 = [],
			y2 = [];
			/*
			x1 = elem.offset().left-17,//17 is roughly half the size of the svg
			x2 = x1+elem.outerWidth(),
			y1 = elem.offset().top-17,
			y2 = y1+elem.height();*/

		for(;z<elem.length;z++) {
			x1[z] = $(elem[z]).offset().left-17;//17 is roughly half the size of the svg
			x2[z] = x1[z]+$(elem[z]).outerWidth();
			y1[z] = $(elem[z]).offset().top-17;
			y2[z] = y1[z]+$(elem[z]).height();
		}
		z = 0;

		(function addSparkle(undefined) {
			
			if(util.sparkleImg[i]===undefined) {

				//img[i] = document.createElement("IMG");
				util.sparkleImg[i] = new Image();
				
				util.sparkleImg[i].width = 35;
				util.sparkleImg[i].height = 35;

				util.sparkleImg[i].id = "sparkle"+i;
				util.sparkleImg[i].src = "img/sparkle.svg?t=" + new Date().getTime();

				util.sparkleImg[i].onload = function() {
					
					//document.body.appendChild(this);
					$(".app").append(this);
				};
				
			} else {
				util.sparkleImg[i].style.display = "none";
				util.sparkleImg[i].src = "img/sparkle.svg?t=" + new Date().getTime();
				util.sparkleImg[i].onload = function() {

					this.style.display = "block";
				};
			}
			
			util.sparkleImg[i].style.left = ((Math.random() * (x2[z]-x1[z])) + x1[z]) + "px";
			util.sparkleImg[i].style.top = ((Math.random() * (y2[z]-y1[z])) + y1[z]) + "px";

			decider = parseInt((Math.random() * 4)+1);

			if(decider==2) {
				util.sparkleImg[i].className = "sparkle small-sparkle1";
			} else if(decider==3) {
				util.sparkleImg[i].className = "sparkle small-sparkle2";
			} else {
				util.sparkleImg[i].className = "sparkle";
			}
			

			i+=1;

			if(i>5) {

				i = 0;
			}

			z+=1;

			if(z>elem.length-1) {
				z = 0;
			}


			util.sparkleTimer = setTimeout(addSparkle,400);
		}());

	},
	getTime:function() {
		return parseInt(globals.timeLeft/60) + ":" + (globals.timeLeft%60 < 10 ? "0"+globals.timeLeft%60 : globals.timeLeft%60);
	},
	sounds:[{name:"click",buffer:null},{name:"found-word",buffer:null},{name:"game-over",buffer:null},{name:"new-high-score",buffer:null}],
	soundsLoaded:0,
	loadSounds:function() {
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		util.soundContext = new AudioContext();
		
		
		util.requestSound(0);

	},
	requestSound:function(i) {
		var request = new XMLHttpRequest();
		request.open('GET', "sound/" + util.sounds[i].name + ".mp3", true);
		request.responseType = 'arraybuffer';

		// Decode asynchronously
		request.onload = function() {
			util.soundContext.decodeAudioData(request.response, function(buffer) {
				util.soundsLoaded+=1;
				util.sounds[i].buffer = buffer;

				if(i<util.sounds.length-1) {
					i+=1;
					util.requestSound(i);

				}
				
			});
		};

		request.send();

	},
	playSound:function(i) {
		if(globals.audio && util.soundsLoaded===util.sounds.length) {

			var source = util.soundContext.createBufferSource(); // creates a sound source
			var gainNode = util.soundContext.createGain();
			source.connect(gainNode);
			source.buffer = util.sounds[i].buffer;                    // tell the source which sound to play
			
			//source.connect(util.soundContext.destination);       // connect the source to the context's destination (the speakers)
			

			gainNode.connect(util.soundContext.destination);
			source.start(0);
		}
	},
	playFirstSound:function() {
		

		if(globals.audio && util.soundsLoaded===util.sounds.length) {
			var source = util.soundContext.createBufferSource(); // creates a sound source
			var gainNode = util.soundContext.createGain();
			source.connect(gainNode);
			gainNode.gain.value = 0;
			source.buffer = util.sounds[0].buffer;                    // tell the source which sound to play
			
			gainNode.connect(util.soundContext.destination); 
			
			source.start(0);
		}
	},
	setCSSPrefix:function() {
		var styles = window.getComputedStyle(document.documentElement, ''),
			pre = (Array.prototype.slice.call(styles).join('') .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o']))[1];
		globals.cssPrefix = "-" + pre + "-";
	}
};