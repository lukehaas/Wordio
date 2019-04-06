var DragMixin = {
	started:false,
	touch:false,
	targ:false,
	tmpX:0,
	tmpY:0,
	tmpID:false,
	tmpVal:false,
	x:0,
	y:0,
	x2:0,
	y2:0,
	targX:0,
	targY:0,
	ended:false,
	axis:false,
	dFromPlace:0,
	swapee:false,
	currentPlaceX:0,
	currentPlaceY:0,
	currentID:false,
	swapped:false,
	dragStart: function(e) {
		//e.preventDefault();
		if(globals.canMove===false) {
			return false;
		}
		this.handleDragEnd();

		this.ended = false;
		this.swapped = false;

		this.targ = $(e.target);

		if(this.targ.hasClass('tile')) {
			this.currentID = parseInt(this.targ.attr('id'));

			this.started = true;
			this.targ.addClass('top').removeAttr('id').removeClass('mover');

			//this.targX = this.currentPlaceX = parseInt(this.targ.css('left'));
			//this.targY = this.currentPlaceY = parseInt(this.targ.css('top'));

			this.targX = this.currentPlaceX = (this.currentID-(Math.floor(this.currentID/5)*5))*globals.tileSettings.tileSize;
			this.targY = this.currentPlaceY = Math.floor(this.currentID/5)*globals.tileSettings.tileSize;

			// was using hasOwnProperty here
			if(e.originalEvent.touches) {
				this.x = e.originalEvent.touches[0].pageX;
				this.y = e.originalEvent.touches[0].pageY;
				this.touch = true;
			} else {
				this.x = e.pageX;
				this.y = e.pageY;
			}

		} else {

			this.dragReset();
		}
	},
	dragMove: function(e) {

		if(globals.canMove===false || this.started===false) {
			return false;
		}
		e.preventDefault();
		if(this.axis===false) {

			if(Math.abs(this.pointers(e).y-this.y) > Math.abs(this.pointers(e).x-this.x) && Math.abs(this.pointers(e).y-this.y) > 10) {
				this.axis = "y";

			} else if(Math.abs(this.pointers(e).x-this.x) > Math.abs(this.pointers(e).y-this.y) && Math.abs(this.pointers(e).x-this.x) > 10) {
				this.axis = "x";
			}

		} else {

			if(this.axis=="x") {
				this.x2 = this.targX + (this.pointers(e).x-this.x);

				//set bounds
				if(this.x2>=0 && this.x2<=globals.tileSettings.tileSize*4) {
					//this is constantly changing
					this.targ.css('left',this.x2);

					this.dFromPlace = this.currentPlaceX - this.x2;

					//if its far enough to switch
					if(Math.abs(this.dFromPlace)>(globals.tileSettings.tileSize/2)) {
						globals.canMove = false;
						//left or right?
						if(this.dFromPlace<0) {
							this.tmpID = this.currentID+1;

							this.swapee = $("#"+this.tmpID);

							this.tmpX = this.currentPlaceX + globals.tileSettings.tileSize;

						} else {
							this.tmpID = this.currentID-1;

							this.swapee = $("#"+this.tmpID);

							this.tmpX = this.currentPlaceX - globals.tileSettings.tileSize;

						}
						//swap their values
						//this.tmpX = parseInt(this.swapee.css('left'));


						this.swapee.css('left',this.currentPlaceX).attr('id',this.currentID);


						this.swapValues();


						this.currentID = this.tmpID;

						this.currentPlaceX = this.tmpX;
					}
				} else {
					//this.handleDragEnd();
					this.dragEnd();
				}
			} else {
				this.y2 = this.targY + (this.pointers(e).y-this.y);

				if(this.y2>=0 && this.y2<=globals.tileSettings.tileSize*6) {
					this.targ.css('top',this.y2);

					this.dFromPlace = this.currentPlaceY - this.y2;

					//if its far enough to switch
					if(Math.abs(this.dFromPlace)>(globals.tileSettings.tileSize/2)) {
						globals.canMove = false;
						//left or right?
						if(this.dFromPlace<0) {
							this.tmpID = this.currentID+5;

							this.swapee = $("#"+this.tmpID);

							this.tmpY = this.currentPlaceY + globals.tileSettings.tileSize;

						} else {
							this.tmpID = this.currentID-5;

							this.swapee = $("#"+this.tmpID);

							this.tmpY = this.currentPlaceY - globals.tileSettings.tileSize;

						}
						//swap their values
						//this.tmpY = parseInt(this.swapee.css('top'));

						this.swapee.css('top',this.currentPlaceY).attr('id',this.currentID);


						this.swapValues();


						this.currentID = this.tmpID;

						this.currentPlaceY = this.tmpY;

					}
				} else {
					//this.handleDragEnd();
					this.dragEnd();
				}
			}
		}
	},
	pointers: function(e) {
		if(this.touch) {
			return {
				x:e.originalEvent.touches[0].pageX,
				y:e.originalEvent.touches[0].pageY
			};
		}
		return {
			x:e.pageX,
			y:e.pageY
		};
	},
	dragEnd: function() {
		this.handleDragEnd();
		if(this.swapped) {
			this.swapped = false;
			setTimeout(function() {
				util.playSound(0);
			},200);


			globals.move+=1;
		}
	},
	handleDragEnd:function() {
		if(this.targ) {
			globals.canMove = false;
			this.targ.removeClass('top').addClass('mover').attr('id',this.currentID).css({'left':this.currentPlaceX,'top':this.currentPlaceY});
			globals.playerFound = true;
			globals.currentChain = 0;
			this.hasWord(true);
		}

		this.ended = true;
		this.started = false;

		this.dragReset();
	},
	dragReset: function() {
		this.axis = this.targ = this.swapee = this.currentID = false;
		this.x = this.y = this.targX = this.targY = this.dFromPlace = this.currentPlaceX = this.currentPlaceY = 0;
	},
	swapValues: function() {

		this.tmpVal = globals.letter[this.currentID];

		globals.letter[this.currentID] = globals.letter[this.tmpID];

		globals.letter[this.tmpID] = this.tmpVal;

		if(globals.letter[this.currentID].get('type')=="r" && globals.letter[this.tmpID].get('type')!="r") {

			this.tmpVal = this.getNextLetter(globals.letter[this.tmpID].get('value'));

			globals.letter[this.currentID].set(this.tmpVal);


			$("#"+this.currentID).removeClass("random").attr("data-points","group" + globals.letterProperties[this.tmpVal.value].point).html(this.tmpVal.value);


		} else if (globals.letter[this.tmpID].get('type')=="r" && globals.letter[this.currentID].get('type')!="r") {

			this.tmpVal = this.getNextLetter(globals.letter[this.currentID].get('value'));

			globals.letter[this.tmpID].set(this.tmpVal);

			this.targ.removeClass("random").attr("data-points","group" + globals.letterProperties[this.tmpVal.value].point).html(this.tmpVal.value);

		}
		this.swapped = true;

		globals.canMove = true;

	},
	events: {
		'touchstart .tile':'dragStart',
		'touchmove .tile':'dragMove',
		'touchend .tile':'dragEnd',
		'mousedown .tile':'dragStart',
		'mousemove .tile':'dragMove',
		'mouseup .tile':'dragEnd'
	}
};
