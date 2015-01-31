App.Views.LetterGridView = Backbone.View.extend(_.extend({},DragMixin,{
	el: $('.app'),
	initialize: function(){
		//this gives us access to (this) within the appendLetter method
		_.bindAll(this, 'appendLetter');

		_.bindAll(this, 'hasWord');

		_.bindAll(this, 'getNextLetter');

		this.additionalEvents();
	},
	setup:function() {
		var tmpl = this.templates.grid;
		var topBar = this.templates.topBar;
		var pauseMenu = this.templates.pauseMenu;

		this.$el.html(_.template(topBar,{}));

		this.$el.append(_.template(tmpl,{}));

		this.$el.append(_.template(pauseMenu,{}));

		if(1===1) {
			var tileChooseBtn = this.templates.chooseRandomTileBtn;

			var tileSelection = this.templates.tileSelection;
			
			this.$el.append(_.template(tileChooseBtn,{}));
			this.$el.append(_.template(tileSelection,{}));
		}
		

		globals.currentScore = new App.Models.Stats();
		globals.currentScore.bind('change', this.updateScore);
		this.updateScore();

		$(".grid-message-points").css({"font-size":(globals.tileSettings.tileSize*0.3)+"px","width":globals.tileSettings.tileSize*0.5,"height":globals.tileSettings.tileSize*0.5,"line-height":(globals.tileSettings.tileSize*0.4)+"px"});

	},
	renderIntro:function() {
		this.setup();
		var grid = new App.Collections.Grid();
		grid.bind('add', this.appendLetter);

		var i,
			introTiles = [
		"C","A","?","H","P",
		"M","?","Q","H","T",
		"A","X","I","E","A",
		"Q","K","A","O","?",
		"?","Z","E","L","H",
		"?","?","I","L","G",
		"E","J","G","L","?"];
		for(i = 0;i < (globals.tileSettings.row*globals.tileSettings.column);i++) {
			globals.letter[i] = new App.Models.Letter();
			
			if(introTiles[i]=="?") {
				globals.letter[i].set({type:'r',value:""});
			} else {
				globals.letter[i].set({type:'c',value:introTiles[i]});
			}
			grid.add(globals.letter[i]);
		}
		this.positionTiles();
		$("#8,#13,#18,#23,#28").addClass("tmp-bg");

		$(".grid-overlay").addClass("visible").show();
		
	},
	renderLevel1:function() {
		this.setup();
		var grid = new App.Collections.Grid();
		grid.bind('add', this.appendLetter);
		var i;

		for(i = 0;i < (globals.tileSettings.row*globals.tileSettings.column);i++) {
			globals.letter[i] = new App.Models.Letter();
			this.assignLetters(i);
		}
		//check for words and regenerate grid if needed
		while(this.hasWord(false)) {
			console.log("word check");
			for(i = 0;i < (globals.tileSettings.row*globals.tileSettings.column);i++) {
				this.assignLetters(i);
			}
			if(globals.debug===1) {
				break;
			}
		}
		for(i = 0;i < (globals.tileSettings.row*globals.tileSettings.column);i++) {
			grid.add(globals.letter[i]);
		}
		this.positionTiles();
		$(".time").text(util.getTime());
		setTimeout(function() {
			$(".tile").css({"transform":"rotate3d(0,1,0,0deg)"});
		},10);
		setTimeout(function(self) {
			self.updateTime();
		},1500,this);
	},
	assignLetters: function(i) {
		if(globals.debug===1) {
			if(globals.debugTiles[i]=="?") {
				globals.letter[i].set({type:'r',value:""});
			} else {
				globals.letter[i].set({type:'c',value:globals.debugTiles[i]});
			}

		}  else if(globals.debug===2 && $(".tile").length > 0) {
			if(globals.debugCounter<globals.debugDropIn.length) {
				globals.letter[i].set({type:'c',value:globals.debugDropIn[globals.debugCounter++]});
			} else {
				globals.letter[i].set({type:'c',value:"X"});
			}

		} else {
			
			this.rand = Math.floor((Math.random()*100)+1);

			if(this.rand>=60 && this.rand<=90) {

				globals.letter[i].set({type:'v',value:this.getVowel()});
			} else if(this.rand<60) {
				if(this.rand<6) {
					globals.letter[i].set({type:'c',value:this.getConsonant(2)});
				} else {
					globals.letter[i].set({type:'c',value:this.getConsonant(1)});
				}

			} else {

				globals.letter[i].set({type:'r',value:""});
			}
		}
	},
	updateScore:function() {
		$(".current-score").text(globals.currentScore.get("currentScore"));
	},
	positionTiles:function() {
		var top = 0;
		var left = 0;
		var z = 0;

		var transform = [];
		transform[0] = {"-webkit-transform":"translate("+(globals.tileSettings.tileSize)+"px,"+(globals.tileSettings.tileSize*2)+"px) rotate3d(1,0,0,90deg) rotate3d(0,0,1,45deg)","transform-origin":"right bottom"};

		transform[1] = {"-webkit-transform":"translate(0,"+(globals.tileSettings.tileSize*2)+"px) rotate3d(1,0,0,90deg) rotate3d(0,0,1,45deg)","transform-origin":"right bottom"};

		transform[2] = {"-webkit-transform":"translate(0,"+(globals.tileSettings.tileSize*2)+"px) rotate3d(1,0,0,90deg)","transform-origin":"center bottom"};

		transform[3] = {"-webkit-transform":"translate(0,"+(globals.tileSettings.tileSize*2)+"px) rotate3d(0,1,0,90deg) rotate3d(0,0,1,45deg)","transform-origin":"left bottom"};

		transform[4] = {"-webkit-transform":"translate(-"+(globals.tileSettings.tileSize)+"px,"+(globals.tileSettings.tileSize*2)+"px) rotate3d(0,1,0,90deg) rotate3d(0,0,1,45deg)","transform-origin":"left bottom"};

		transform[5] = {"-webkit-transform":"translate("+(globals.tileSettings.tileSize)+"px,"+(globals.tileSettings.tileSize)+"px) rotate3d(1,0,0,90deg) rotate3d(0,0,1,45deg)","transform-origin":"right bottom"};

		transform[6] = {"-webkit-transform":"translate(0,"+(globals.tileSettings.tileSize)+"px) rotate3d(1,0,0,90deg) rotate3d(0,0,1,45deg)","transform-origin":"right bottom"};

		transform[7] = {"-webkit-transform":"translate(0,"+(globals.tileSettings.tileSize)+"px) rotate3d(1,0,0,90deg)","transform-origin":"center bottom"};

		transform[8] = {"-webkit-transform":"translate(0,"+(globals.tileSettings.tileSize)+"px) rotate3d(0,1,0,90deg) rotate3d(0,0,1,45deg)","transform-origin":"left bottom"};

		transform[9] = {"-webkit-transform":"translate(-"+(globals.tileSettings.tileSize)+"px,"+(globals.tileSettings.tileSize)+"px) rotate3d(0,1,0,90deg) rotate3d(0,0,1,45deg)","transform-origin":"left bottom"};

		transform[10] = {"-webkit-transform":"translate("+(globals.tileSettings.tileSize)+"px,0) rotate3d(1,0,0,90deg) rotate3d(0,0,1,45deg)","transform-origin":"right bottom"};
		transform[11] = {"-webkit-transform":"rotate3d(1,0,0,90deg) rotate3d(0,0,1,45deg)","transform-origin":"right bottom"};
		transform[12] = {"-webkit-transform":"rotate3d(1,0,0,90deg)","transform-origin":"center bottom"};
		transform[13] = {"-webkit-transform":"rotate3d(0,1,0,90deg) rotate3d(0,0,1,45deg)","transform-origin":"left bottom"};
		transform[14] = {"-webkit-transform":"translate(-"+(globals.tileSettings.tileSize)+"px,0) rotate3d(0,1,0,90deg) rotate3d(0,0,1,45deg)","transform-origin":"left bottom"};

		transform[15] = {"-webkit-transform":"translate("+(globals.tileSettings.tileSize)+"px,0) rotate3d(0,1,0,90deg)","transform-origin":"right center"};
		transform[16] = {"-webkit-transform":"rotate3d(0,1,0,90deg)","transform-origin":"right center"};
		
		transform[17] = {"-webkit-transform":"rotate3d(0,0,0,0)"};
		transform[18] = {"-webkit-transform":"rotate3d(0,1,0,90deg)","transform-origin":"left center"};
		transform[19] = {"-webkit-transform":"translate(-"+(globals.tileSettings.tileSize)+"px,0) rotate3d(0,1,0,90deg)","transform-origin":"left center"};

		transform[20] = {"-webkit-transform":"translate("+(globals.tileSettings.tileSize)+"px,0) rotate3d(0,1,0,90deg) rotate3d(0,0,1,45deg)","transform-origin":"right top"};

		transform[21] = {"-webkit-transform":"rotate3d(0,1,0,90deg) rotate3d(0,0,1,45deg)","transform-origin":"right top"};
		transform[22] = {"-webkit-transform":"rotate3d(1,0,0,90deg)","transform-origin":"center top"};
		transform[23] = {"-webkit-transform":"rotate3d(1,0,0,90deg) rotate3d(0,0,1,45deg)","transform-origin":"left top"};

		transform[24] = {"-webkit-transform":"translate(-"+(globals.tileSettings.tileSize)+"px,0) rotate3d(1,0,0,90deg) rotate3d(0,0,1,45deg)","transform-origin":"left top"};

		transform[25] = {"-webkit-transform":"translate("+(globals.tileSettings.tileSize)+"px,-"+(globals.tileSettings.tileSize)+"px) rotate3d(0,1,0,90deg) rotate3d(0,0,1,45deg)","transform-origin":"right top"};

		transform[26] = {"-webkit-transform":"translate(0,-"+(globals.tileSettings.tileSize)+"px) rotate3d(0,1,0,90deg) rotate3d(0,0,1,45deg)","transform-origin":"right top"};

		transform[27] = {"-webkit-transform":"translate(0,-"+(globals.tileSettings.tileSize)+"px) rotate3d(1,0,0,90deg)","transform-origin":"center top"};

		transform[28] = {"-webkit-transform":"translate(0,-"+(globals.tileSettings.tileSize)+"px) rotate3d(1,0,0,90deg) rotate3d(0,0,1,45deg)","transform-origin":"left top"};

		transform[29] = {"-webkit-transform":"translate(-"+(globals.tileSettings.tileSize)+"px,-"+(globals.tileSettings.tileSize)+"px) rotate3d(1,0,0,90deg) rotate3d(0,0,1,45deg)","transform-origin":"left top"};
		transform[30] = {"-webkit-transform":"translate("+(globals.tileSettings.tileSize)+"px,-"+(globals.tileSettings.tileSize*2)+"px) rotate3d(0,1,0,90deg) rotate3d(0,0,1,45deg)","transform-origin":"right top"};

		transform[31] = {"-webkit-transform":"translate(0,-"+(globals.tileSettings.tileSize*2)+"px) rotate3d(0,1,0,90deg) rotate3d(0,0,1,45deg)","transform-origin":"right top"};

		transform[32] = {"-webkit-transform":"translate(0,-"+(globals.tileSettings.tileSize*2)+"px) rotate3d(1,0,0,90deg)","transform-origin":"center top"};

		transform[33] = {"-webkit-transform":"translate(0,-"+(globals.tileSettings.tileSize*2)+"px) rotate3d(1,0,0,90deg) rotate3d(0,0,1,45deg)","transform-origin":"left top"};
		transform[34] = {"-webkit-transform":"translate(-"+(globals.tileSettings.tileSize)+"px,-"+(globals.tileSettings.tileSize*2)+"px) rotate3d(1,0,0,90deg) rotate3d(0,0,1,45deg)","transform-origin":"left top"};
		

		$(".tile").each(function(i) {
		
			$(this).attr('id',i).addClass("mover").css({"font-size":(globals.tileSettings.tileSize*0.48)+"px","line-height":globals.tileSettings.tileSize+"px","width":globals.tileSettings.tileSize+"px","height":globals.tileSettings.tileSize+"px","top":top+"px","left":left+"px"});
			$(this).css(transform[i]);

			z++;

			//left += globals.tileSettings.tileSize;
			left += globals.tileSettings.tileSize;
			if(z===globals.tileSettings.row) {
				left = 0;
				top += globals.tileSettings.tileSize;
				z = 0;
			}
		});
		$(".top-bar").css({"width":(globals.tileSettings.tileSize*globals.tileSettings.row)+"px"});
		$(".grid").css({"width":(globals.tileSettings.tileSize*globals.tileSettings.row)+"px","height":(globals.tileSettings.tileSize*globals.tileSettings.column)+"px"});
	},
	updateTime:function() {
		globals.timeLeft -= 1;
		
		$(".time").text(util.getTime());
		if(globals.timeLeft>0) {
			globals.mainTimer = setTimeout(function(self) {
				self.updateTime();
			},1000,this);
		} else {
			this.gameOver();
		}
	},
	gameOver:function() {
		globals.canMove = false;
		globals.paused = true;

		var gameOver = this.templates.gameOver;

		this.$el.append(_.template(gameOver,{score:globals.currentScore.get("currentScore")}));

		$(".game-overlay,.game-over").show();
		setTimeout(function() {
			$(".game-overlay,.game-over").addClass("visible");


		},10);

	},
	pauseGame:function(e) {
		e.preventDefault();

		clearTimeout(globals.mainTimer);
		globals.canMove = false;
		globals.paused = true;

		$(".game-overlay,.pause-menu").show();

		setTimeout(function() {
			$(".game-overlay,.pause-menu").addClass("visible");
		},10);

		$(".grid").addClass("paused");

	},
	resumeGame:function(e) {
		e.preventDefault();
		if(globals.timeLeft>0) {
			globals.paused = false;
			$(".game-overlay,.pause-menu").removeClass("visible");
			$(".grid").removeClass("paused");
			globals.canMove = true;
			this.hasWord(true);
			setTimeout(function(self) {
				$(".game-overlay,.pause-menu").hide();
				self.updateTime();
				
			},300,this);
			
		}
	},
	quitGame:function(e) {
		e.preventDefault();
		$(".game-overlay,.pause-menu").removeClass("visible");


		location.hash = "#index";

		location.reload();
	},
	getNextLetter:function(letter) {
		var pos = globals.alphabet.indexOf(letter);
		if(pos<globals.alphabet.length-1) {
			pos++;
		} else {
			pos = 0;
		}
		return {"value":globals.alphabet[pos],"type":globals.letterProperties[globals.alphabet[pos]].type};
	},
	getVowel:function() {
		return globals.vowels[Math.floor(Math.random()*5)];
	},
	getConsonant:function(carrot) {

		return globals.consonants[carrot][Math.floor(Math.random()*globals.consonants[carrot].length)];
	},
	appendLetter:function(letter) {
		var tmpl = this.templates.tile;
		var className = "",
			pointsGroup = 0;
		if(letter.get("type")=="r") {
			className = "random";
		} else {
			pointsGroup = "group" + globals.letterProperties[letter.get("value")].point;
		}
		this.$el.find(".grid").append(_.template(tmpl,{letter:letter.get("value"),className:className,pointsGroup:pointsGroup}));
	},
	updateLetter:function(letter) {
		console.log(letter);
	},
	hasWord:function(canHandleFound) {
		globals.canMove = false;
		/*var i = 0;
		var z = 0;
		var j = 0;
		var p = 0;
		var k = 0;
		var word = "";
		var fromDic = "";
		var tmp = "";
		var canCompleteLine = true;
		var vertical = false;
		var wordPos = 0;
		var hasFound = false;


		var foundWords = [];
		var f = 0;*/
		var i = 0,
			z = 0,
			j = 0,
			p = 0,
			k = 0,
			wordPos = 0,
			f = 0,
			word = "",
			fromDic = "",
			tmp = "",
			canCompleteLine = true,
			vertical = false,
			hasFound = false,
			points = 0,
			foundWords = [];

		//horizontal search
		//7 is number of rows
		for(;i<35;i++) {
			z++;
			
			if(globals.letter[i].get('type')=="r") {
				if(z<4) {
					//j++;
					j += word.length+1;
					//console.log("tt" + j);
					word = "";
					
				} else {
					canCompleteLine = false;
				}
			} else if(canCompleteLine===true) {
				word += globals.letter[i].get('value');
				//console.log(globals.letter[i].get('value'));
			}
			
			if((i+1)%5===0) {
				
				canCompleteLine = true;
				z = p = 0;

				//fromDic = "";

				while(word.length>2) {
					tmp = this.checkForWord(word);

					if(tmp.length>fromDic.length) {
						fromDic = tmp;
						j+=p;
						wordPos = j;

						foundWords[f] = {
							word:fromDic,
							pos:wordPos,
							len:fromDic.length,
							vertical:false
						};
						hasFound = true;
					}
					p++;
					word = word.substring(1);
				}
				if(fromDic.length>0) {
					//console.log(fromDic,j);
					if(canHandleFound===false) {

						globals.canMove = true;
						return true;
					}
					//break;
				}
				//console.log(fromDic);
				word = "";
				j = i+1;
			}

		}
		//vertical search
		k = z = j = p = 0;
		word = "";
		fromDic = "";
		canCompleteLine = true;
		if(hasFound) {
			f++;
		}
		for(i=0;i<35;i++) {
			z++;
			if(globals.letter[k].get('type')=="r") {
				if(z<4) {
					//too short, right it off, but can have a word after it
					j += (word.length*5)+5;
					word = "";
				} else if(z==4) {
					//can have a word before it and after it
					//console.log("b in middle " + word);
					if(word.length===3) {
						tmp = this.checkForWord(word);
						if(tmp.length>fromDic.length) {
							fromDic = tmp;
							vertical = true;
							wordPos = k-15;

							foundWords[f] = {
								word:fromDic,
								pos:k-15,
								len:fromDic.length,
								vertical:true
							};
							hasFound = true;

						}
					}
					word = "";
					j = 20;

				} else {
					//can have a word before it, but not after it
					canCompleteLine = false;
				}
			} else if(canCompleteLine===true) {
				word += globals.letter[k].get('value');
			}
			if(k>=30) {
				k -= 30;
				j = k+j;
				canCompleteLine = true;
				p = 0;
				while(word.length>2) {
					tmp = this.checkForWord(word);
					if(tmp.length>fromDic.length) {
						fromDic = tmp;
						j+=p;
						wordPos = j;
						vertical = true;

						foundWords[f] = {
							word:fromDic,
							pos:j,
							len:fromDic.length,
							vertical:true
						};
						hasFound = true;
					}
					p+=5;
					word = word.substring(1);
				}
				if(canHandleFound===false) {
					if(fromDic.length>0) {
						
						globals.canMove = true;
						return true;
					}
				}
				word = "";
				z = j = 0;
				k++;
				
			} else {
				k += 5;
			}
		}


		if(hasFound===true && canHandleFound===true) {

			globals.found = true;

			
			for(i = 0;i < foundWords.length;i++) {
				points = 0;
				for(k = 0;k<foundWords[i].word.length;k++) {
					
					points += globals.letterProperties[foundWords[i].word.charAt(k)].point;
				}
				foundWords[i].points = points;
			}
			console.log(fromDic,wordPos,vertical);
			//possibley move this to model
			
			$(".grid").addClass("shift");
			console.log(foundWords);
			//this.handleFound(wordPos,fromDic.length,vertical);

			$(".grid-overlay").show();
			setTimeout(function(self) {
				$(".grid-overlay").addClass("visible");
				self.handleFound(foundWords);
			},10,this);

			
		} else {
			globals.canMove = true;

			if(globals.found===true) {
				
				//setTimeout(function() {
					$(".grid-overlay").hide();
				//},300);
			}
			globals.found = false;
		}
		
		return false;

	},
	checkForWord:function(word) {
		
		var letter = word.charAt(0),
			c,
			i = 0,
			longestWord = "";

		if(letter!="?") {
			c = dictionary[letter].length;

			for(;i<c;i++) {
				//console.log(dictionary[letter][i]);
				if(word.indexOf(dictionary[letter][i])===0) {

					if(dictionary[letter][i].length > longestWord.length) {
						longestWord = dictionary[letter][i];
					}
				}
			}
		}
		return longestWord;
	},
	
	handleFound:function(foundWords) {
	//handleFound:function(pos,len,vertical) {
		/*
		var i = pos;
		var k = pos;
		var j = 0;
		var row = 5;
		var rowCount = Math.floor(pos/5);
		var mRowCount = rowCount*5;
		var l = len;
		len+=i;
*/
//foundWords[1] is vertical
		util.playSound(1);
		globals.canMove = false;
		var p = 0,fwl = foundWords.length,
		i,k,len,j,row = 5,rowCount = [0,0],
		mRowCount,l,crossOver = false,
		word = "",checkForWord = true,qi = 4,
		self = this,points = 0;

		if(fwl>1) {
			//if words are joined - find cross over number
			crossOver = foundWords[1].pos+(Math.ceil((foundWords[0].pos-foundWords[1].pos)/5)*5);
			

			if(foundWords[1].pos>(foundWords[0].pos+(foundWords[0].len-1)) || crossOver<0 || crossOver>(((foundWords[1].len-1)*5)+foundWords[1].pos) || (foundWords[0].pos+(foundWords[0].len-1))<crossOver) {
				crossOver = false;
				fwl = 1;
			}
		}
		points = foundWords[0].points;
		$(".top-bar").find(".found-word").removeClass("smaller");
		if(fwl>1) {
			points += foundWords[1].points;
			//$(".top-bar").find(".found-word").html("<a href=\"" + globals.wordLookup + foundWords[0].word + "\">" + foundWords[0].word + "</a> & <a href=\"" + globals.wordLookup + foundWords[0].word + "\">" + foundWords[1].word + "</a>");
			if((foundWords[0].word.length + foundWords[1].word.length) > 10) {
				$(".top-bar").find(".found-word").addClass("smaller");	
			}
			$(".top-bar").find(".found-word").text(foundWords[0].word + " & " + foundWords[1].word);
		} else {
			//$(".top-bar").find(".found-word").html("<a href=\"" + globals.wordLookup + foundWords[0].word + "\">" + foundWords[0].word + "</a>");
			$(".top-bar").find(".found-word").text(foundWords[0].word);
		}
		globals.currentScore.set({currentScore:globals.currentScore.get("currentScore")+points});

		var pointMessageTop = $(".grid").offset().top+(Math.floor(foundWords[0].pos/5)*globals.tileSettings.tileSize)+globals.tileSettings.tileSize*0.5;
		$(".grid-message-points").css({"top":pointMessageTop,"left":$(".grid").offset().left+((foundWords[0].pos-(Math.floor(foundWords[0].pos/5)*5))*globals.tileSettings.tileSize)}).text(points);

		
		
		for(;p<fwl;p++) {
			i = k = foundWords[p].pos;
			len = foundWords[p].len+i;
			rowCount[p] = Math.floor(i/5);
			
			for(;i<len;i++) {	
				if(foundWords[p].vertical===true) {
					$("#"+k).removeClass("mover").addClass("tmp-bg");

					k+=5;
				} else {
					$("#"+i).removeClass("mover").addClass("tmp-bg");
					
				}
			}
		}


		var queue = [{action:function() {
			var deferred = $.Deferred();
			$(".grid-message-points").removeClass("hidden");
			$(".grid-message-points").css("top",pointMessageTop-(globals.tileSettings.tileSize));
			deferred.resolve();

			return deferred.promise();
		},time:10,args:[]},
		{action:function() {
			var deferred = $.Deferred();
			$(".grid-message-points").addClass("hidden");
			deferred.resolve();

			return deferred.promise();
		},time:500,args:[]},
		{
			action:function() {
			var deferred = $.Deferred();
			
			$(".grid-overlay").removeClass("visible");
			for(p = 0;p<fwl;p++) {
				i = k = foundWords[p].pos;
				len = foundWords[p].len+i;

				for(;i<len;i++) {
					if(foundWords[p].vertical===true) {
						$("#"+k).addClass("shrink");

						k+=5;
					} else {
						$("#"+i).addClass("shrink");

					}
				}
			}

			deferred.resolve();

			return deferred.promise();
		//show the highlited word for this time plus previous times - times add up to 850
		},time:340,args:[p,fwl,k,len,i,foundWords]},
		{
			action:function() {
				var deferred = $.Deferred();

				for(p = 0;p<fwl;p++) {
					i = k = foundWords[p].pos;
					len = foundWords[p].len+i;

					mRowCount = rowCount[p]*5;
					l = foundWords[p].len;

					for(;i<len;i++) {
						if(foundWords[p].vertical===true) {

							$("#"+k).css("top",((l*globals.tileSettings.tileSize)*-1)).removeClass("random shrink tmp-bg");
							
							$("#"+k).attr("id",(k-mRowCount)+"tmp");


							l--;
							k+=5;
						} else {
							if(i!==crossOver) {
								$("#"+i).css("top",-globals.tileSettings.tileSize).removeClass("random shrink tmp-bg");

								$("#"+i).attr("id",(i-mRowCount)+"tmp");
							}
							

						}
					}
				}
				deferred.resolve();
				return deferred.promise();
			},
			//time after shrink
			time:500,args:[p,fwl,k,len,i,foundWords,mRowCount,rowCount,l,crossOver]
		}];

		//if rowCount OR rowCount2 are greater than 0

		//part 2
		if(rowCount[0] > 0 || rowCount[1] > 0) {
			queue[qi++] = {
			action:function() {
				var deferred = $.Deferred();

				for(p = 0;p<fwl;p++) {

					if(rowCount[p]>0) {
						var dRow = row,tmp = [],rowZ = rowCount[p];
						i = foundWords[p].pos;
						k = i;
						l = foundWords[p].len;
						len = foundWords[p].len+i;

						//shift tiles down
						while(rowZ) {
							if(foundWords[p].vertical===true) {
								k-=5;
								dRow = (l*5)+k;
								
								$("#"+k).css("top",(Math.floor(dRow/5))*globals.tileSettings.tileSize).attr("id",dRow);

								tmp[k] = globals.letter[dRow];

								globals.letter[dRow] = globals.letter[k];

								globals.letter[k] = tmp[k];
							} else {
								
								i = foundWords[p].pos;
								k = i - dRow;
								for(;i<len;i++) {
									//if theres a cross over - all tiles above the cross over should be handled by the vertical sweep?	
									if(i!==crossOver) {
										$("#"+k).css("top",((Math.floor(k/5)+1)*globals.tileSettings.tileSize)).attr("id",k+5);
										//if first sweep - store in temp
										//if last assign temp to 0 row
										if(dRow==row) {
											//this is the first sweep
											tmp[i] = globals.letter[k+5];
										}
										globals.letter[k+5] = globals.letter[k];

										if(rowZ===1) {
											globals.letter[k] = tmp[i];
										}
									}
									k++;
								}
								dRow += row;
							}
							rowZ--;
						}
						//the time to go red and shrink - plus small delay
					}
				}
				
				deferred.resolve();
				return deferred.promise();
			},
			//time after shrink - continued
			time:150,args:[p,fwl,rowCount,row,foundWords,len,i,k,l,crossOver]};
		}
		queue[qi++] = {
			action:function() {
				var deferred = $.Deferred();
				
				for(p = 0;p<fwl;p++) {

					while(checkForWord) {

						i = k = foundWords[p].pos;
						len = foundWords[p].len+i;

						mRowCount = rowCount[p]*5;
						word = "";

						for(;i<len;i++) {

							if(foundWords[p].vertical===true) {
								
								j = k-mRowCount;

								self.assignLetters(j);
								if(globals.letter[j].get("type")=="r") {
									word += "?";
								} else {
									word += globals.letter[j].get("value");
								}

								k+=5;
								
							} else {
								//console.log(i + "gg " + (i-mRowCount));
								if(i!==crossOver) {
									//asign new letters
									self.assignLetters((i-mRowCount));
									if(globals.letter[(i-mRowCount)].get("type")=="r") {
										word += "?";
									} else {
										word += globals.letter[(i-mRowCount)].get("value");
									}
									
								}
							}
						}
						checkForWord = false;
						//check word in dic
						//checkForWord = false if no word
						console.log("new tiles " + word);
						while(word.length>2) {
							if(self.checkForWord(word).length) {
								//keep the loop going if theres a word
								checkForWord = true;
								console.log("there was a word in the new tiles");
								word = "";
							} else {
								word = word.substring(1);
							}
							
						}

					}
					checkForWord = true;
					i = k = foundWords[p].pos;
					len = foundWords[p].len+i;

					mRowCount = rowCount[p]*5;
					for(;i<len;i++) {
						if(foundWords[p].vertical===true) {
								
							j = k-mRowCount;
							console.log("J2 " + j);
							$("#"+j+"tmp").html(globals.letter[j].get("value"));

							if(globals.letter[j].get("type")=="r") {
								$("#"+j+"tmp").attr("data-points","0").addClass("random");
							} else {
								$("#" + j + "tmp").attr("data-points","group" + globals.letterProperties[globals.letter[j].get("value")].point);
							}
							$("#" + j + "tmp").addClass("mover").css("top",Math.floor(j/5)*globals.tileSettings.tileSize).attr("id",j);

							k+=5;
						} else {
							if(i!==crossOver) {

								$("#"+(i-mRowCount)+"tmp").html(globals.letter[(i-mRowCount)].get("value"));

								if(globals.letter[(i-mRowCount)].get("type")=="r") {
									$("#"+(i-mRowCount)+"tmp").attr("data-points","0").addClass("random");
								} else {
									$("#"+(i-mRowCount)+"tmp").attr("data-points","group" + globals.letterProperties[globals.letter[(i-mRowCount)].get("value")].point);
								}

								$("#"+(i-mRowCount)+"tmp").addClass("mover").css("top","0px").attr("id",(i-mRowCount));

							}
						}
					}

				}
				deferred.resolve();
				return deferred.promise();
			},
			time:50,args:[self,p,fwl,checkForWord,i,k,len,foundWords,mRowCount,rowCount,word,j,crossOver]
		};
		

		queue[qi++] = {
			action:function() {
				var deferred = $.Deferred();

				$(".grid").removeClass("shift");
				if(globals.debug!==1 && globals.debug!==2) {
					if(globals.paused===false) {
						self.hasWord(true);
					}

				}
				deferred.resolve();
				return deferred.promise();
			},
			time:800,args:[self]
		};

		util.queueHandler(queue,0);

	},
	showTileSelection: function(e) {
		e.preventDefault();
		
		if(false===globals.tileSlectionEnabled) {
			globals.tileSlectionEnabled = true;

			globals.canMove = false;

			$(".random").addClass("selectable-tile").off("click touchstart").on("click touchstart",function() {
				$(".tile-selection").css({"width":(globals.tileSettings.tileSize*4),"font-size":(globals.tileSettings.tileSize*0.25)+"px"}).show();
				globals.chosenBlank = $(this);

			});

			$(".grid-overlay").addClass("visible").show();
		} else {
			this.hideTileSelection();
		}

	},
	hideTileSelection: function() {
		globals.canMove = true;

		$(".random").removeClass("selectable-tile").off("click touchstart");

		$(".grid-overlay").removeClass("visible").hide();

		globals.tileSlectionEnabled = false;
	},
	chooseTile: function(e) {
		
		var letter = $(e.currentTarget).text();

		var pos = globals.alphabet.indexOf(letter);
		

		var newLetter = {"value":globals.alphabet[pos],"type":globals.letterProperties[globals.alphabet[pos]].type};
		
		globals.chosenBlank.removeClass("random selectable-tile").off("click touchstart").attr("data-points","group"+globals.letterProperties[newLetter.value].point).text(letter);

		globals.letter[globals.chosenBlank.attr("id")].set(newLetter);

		$(".tile-selection").hide();

		this.hideTileSelection();

		//new word check
		this.hasWord(true);
	},
	additionalEvents: function() {

		this.events['click .choose-tile'] = 'showTileSelection';
		this.events['click .tile-selection div'] = 'chooseTile';
		this.events['click .pause-btn'] = 'pauseGame';
		this.events['click .resume-btn'] = 'resumeGame';

		this.events['click .quit-btn'] = 'quitGame';
	},
	templates: {
		grid:'\
		<div class="grid"><div class="grid-overlay"></div></div><div class="grid-message grid-message-points hidden"></div><a href="#" class="pause-btn">Pause</a>\
		',
		pauseMenu:'\
		<div class="pause-menu"><div><h3>Paused</h3><ul><li><a href="#" class="resume-btn">Resume</a></li><li><a href="javascript:location.reload();">Restart</a></li><li><a href="#" class="quit-btn">Quit</a></li></ul></div></div>\
		',
		gameOver:'\
		<div class="game-over"><div class="inner-container"><div class="score"><%= score %></div><ul><li><a href="#" class="quit-btn">Menu</a></li><li><a href="javascript:location.reload();">New game</a></li></ul></div></div>\
		',
		tile:'\
		<div data-points="<%= pointsGroup %>" class="tile <%= className %>"><%= letter %></div>\
		',
		topBar:'\
		<div class="top-bar"><div class="time"></div><div class="found-word"></div><div class="current-score"></div></div>\
		',
		chooseRandomTileBtn:'\
		<a href="#" class="choose-tile">?</a>\
		',
		tileSelection:'\
		<div class="tile-selection"><div>A</div><div>B</div><div>C</div><div>D</div><div>E</div><div>F</div><div>G</div><div>H</div><div>I</div><div>J</div><div>K</div><div>L</div><div>M</div><div>N</div><div>O</div><div>P</div><div>Q</div><div>R</div><div>S</div><div>T</div><div>U</div><div>V</div><div>W</div><div>X</div><div>Y</div><div>Z</div></div>\
		'
	}
}));

//App.Views.LetterGridView.mixin(DragMixin);