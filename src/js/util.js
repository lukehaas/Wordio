var util = {
	sparkleTimer:null,
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
		$(".sparkle").remove();
	},
	sparkle:function(elem) {
		var i = 0,
				x1 = elem.offset().left-17,//17 is roughly half the size of the svg
				x2 = x1+elem.width(),
				y1 = elem.offset().top-17,
				y2 = y1+elem.height(),
				img = [],
				decider;

		(function addSparkle(undefined) {
			
			if(img[i]===undefined) {

				//img[i] = document.createElement("IMG");
				img[i] = new Image();
				
				img[i].width = 35;
				img[i].height = 35;

				img[i].id = "sparkle"+i;
				img[i].src = "img/sparkle.svg?t=" + new Date().getTime();

				img[i].onload = function() {
					
					//document.body.appendChild(this);
					$(".app").append(this);
				};
				
			} else {
				img[i].style.display = "none";
				img[i].src = "img/sparkle.svg?t=" + new Date().getTime();
				img[i].onload = function() {
					this.style.display = "block";
				};
			}
			
			img[i].style.left = ((Math.random() * (x2-x1)) + x1) + "px";
			img[i].style.top = ((Math.random() * (y2-y1)) + y1) + "px";

			decider = parseInt((Math.random() * 4)+1);

			if(decider==2) {
				img[i].className = "sparkle small-sparkle1";
			} else if(decider==3) {
				img[i].className = "sparkle small-sparkle2";
			} else {
				img[i].className = "sparkle";
			}
			

			i+=1;

			if(i>5) {

				i = 0;
			}


			util.sparkleTimer = setTimeout(addSparkle,1800);
		}());

	},
	getTime:function() {
		return parseInt(globals.timeLeft/60) + ":" + (globals.timeLeft%60 < 10 ? "0"+globals.timeLeft%60 : globals.timeLeft%60);
	},
	sounds:[{name:"click",buffer:null},{name:"found-word",buffer:null}],
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
				
				util.sounds[i].buffer = buffer;

				if(i<util.sounds.length) {
					i+=1;
					util.requestSound(i);
				}
				
			});
		};
		request.send();

	},
	playSound:function(i) {
		var source = util.soundContext.createBufferSource(); // creates a sound source
		source.buffer = util.sounds[i].buffer;                    // tell the source which sound to play
		source.connect(util.soundContext.destination);       // connect the source to the context's destination (the speakers)
		source.start(0);
	},
	setCSSPrefix:function() {
		var styles = window.getComputedStyle(document.documentElement, ''),
			pre = (Array.prototype.slice.call(styles).join('') .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o']))[1];
		globals.cssPrefix = "-" + pre + "-";
	}
};