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
		var bottomPanel = this.templates.bottomPanel;
		var pauseMenu = this.templates.pauseMenu;


		this.$el.html(_.template(topBar,{}));

		this.$el.append(_.template(tmpl,{}));

		this.$el.append(_.template(bottomPanel,{}));

		this.$el.append(_.template(pauseMenu,{}));

		if(globals.purchasedTileChooser) {
			var tileChooseBtn = this.templates.chooseRandomTileBtn;

			var tileSelection = this.templates.tileSelection;

			this.$el.find(".bottom-panel").append(_.template(tileChooseBtn,{"remaining":globals.tileChoicesRemaining}));
			this.$el.append(_.template(tileSelection,{}));
		}


		globals.currentScore = new App.Models.Stats();
		globals.currentScore.bind('change', this.updateScore);
		this.updateScore();

		$(".grid-message").css({"font-size":(globals.tileSettings.tileSize*0.15)+"px"});
		$(".grid-message-points").css({"font-size":(globals.tileSettings.tileSize*0.3)+"px","width":globals.tileSettings.tileSize*0.5,"height":globals.tileSettings.tileSize*0.5,"line-height":(globals.tileSettings.tileSize*0.4)+"px"});

		util.playFirstSound();
	},
	renderHowToPlay:function() {
		globals.htpStage = 1;
		this.renderLevel1(false);


		globals.canMove = false;
		globals.paused = true;

		var howToPlayOverlays = this.templates.howToPlay;
		this.$el.append(_.template(howToPlayOverlays,{}));

		$(".bottom-panel").hide();


		$(".how-to-play.icon").css({"font-size":(globals.tileSettings.tileSize*0.6)+"px"});


		$(".how-to-play.north-west").css({"left":$(".grid").offset().left+globals.tileSettings.tileSize*0.8});
		$(".how-to-play.north-east").css({"left":$(".grid").offset().left+globals.tileSettings.tileSize*4});

		$(".htp-time,.htp-score").css({"width":globals.tileSettings.tileSize*3,"font-size":(globals.tileSettings.tileSize*0.3)+"px"});

		$(".htp-time").css({"left":$(".grid").offset().left+globals.tileSettings.tileSize*0.2});
		$(".htp-score").css({"right":$(".grid").offset().left+globals.tileSettings.tileSize*0.2});

		$(".htp-play-btn,.htp-next-btn").css({"left":$(".grid").offset().left,"top":globals.tileSettings.tileSize*3.5,"width":$(".grid").width()});


		$(".htp-instruction1,.htp-instruction2,.htp-tile-switch").css({"right":$(".grid").offset().left+globals.tileSettings.tileSize*0.2,"left":$(".grid").offset().left+globals.tileSettings.tileSize*0.2,"font-size":(globals.tileSettings.tileSize*0.3)+"px"});
		//$(".htp-instruction1").css("top",globals.tileSettings.tileSize*0.3);
		//$(".htp-instruction2").css("top",globals.tileSettings.tileSize*0.3);

		$(".htp-tile-switch").css({"top":globals.tileSettings.tileSize*5.2,"height":globals.tileSettings.tileSize*1.6});

		$(".htp-tile-switch").find("div").css({"width":globals.tileSettings.tileSize,"height":globals.tileSettings.tileSize,"font-size":(globals.tileSettings.tileSize*0.48)+"px","line-height":globals.tileSettings.tileSize+"px"});


		setTimeout(function() {
			$(".north-west,.htp-time,.htp-next-btn").css("opacity","1");
		},500);

	},
	howToPlayNext:function(e) {
		e.preventDefault();

		if(globals.htpStage===1) {
			$(".north-west,.htp-time").css("opacity","0");

			setTimeout(function() {
				$(".north-east,.htp-score").css("opacity","1");

			},200);

		} else if(globals.htpStage===2) {
			$(".north-east,.htp-score").css("opacity","0");


			setTimeout(function() {

				//$(".htp-next-btn").css("top",globals.tileSettings.tileSize*4);

				$(".htp-instruction1").css("opacity","1");

			},200);


		} else if(globals.htpStage===3) {
			$(".htp-instruction1,.htp-next-btn").css("opacity","0");

			setTimeout(function() {
				$(".htp-next-btn").remove();
				$(".htp-tile-switch").find("div").addClass("ready");
				$(".htp-play-btn,.htp-instruction2,.htp-tile-switch").css("opacity","1");
			},200);

		}

		globals.htpStage += 1;
	},
	stopHowToPlayAndPlay:function(e) {
		$(".how-to-play").css("opacity","0");

		setTimeout(function() {
			$(".how-to-play").remove();
			$(".bottom-panel").show();
		},500);

		this.resumeGame(e);
	},
	renderLevel1:function(start) {
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
		if(start) {
			setTimeout(function(self) {
				self.updateTime();
			},1500,this);
		}

	},
	renderLevel2:function(start) {


		this.renderLevel1(false);

		var inGameMenu = this.templates.inGameMenu;

		this.$el.append(_.template(inGameMenu,{ className: globals.web ? 'hidden' : '' }));
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
		$(".current-score").removeClass("increase-points");
		if(globals.currentScore.get("currentScore")>0) {
			setTimeout(function() {
				$(".current-score").addClass("increase-points").text(globals.currentScore.get("currentScore"));
			},0);
		} else {
			$(".current-score").text("0");
		}
		if($(".current-score").hasClass("large-score")===false) {
			if(globals.currentScore.get("currentScore")>999 && globals.currentScore.get("currentScore")<10000) {
				$(".current-score").addClass("large-score");
			} else if(globals.currentScore.get("currentScore")>9999) {
				$(".current-score").addClass("very-large-score");
			}
		}

		//$(".longest-word .points").text(globals.currentScore.get("words"));
		//$(".chain-word .points").text(globals.currentScore.get("longestChain"));
		//$(".crossover-word .points").text(globals.currentScore.get("crossovers"));
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
		$(".top-bar,.bottom-panel").css({"width":(globals.tileSettings.tileSize*globals.tileSettings.row)+"px"});
		$(".grid").css({"width":(globals.tileSettings.tileSize*globals.tileSettings.row)+"px","height":(globals.tileSettings.tileSize*globals.tileSettings.column)+"px"});
	},
	updateTime:function() {
		globals.timeLeft -= 1;

		$(".time").text(util.getTime());
		if(globals.timeLeft<11) {
			$(".time").addClass("final-seconds");
		}
		if(globals.timeLeft>0) {
			globals.mainTimer = setTimeout(function(self) {
				self.updateTime();
			},1000,this);
		} else {
			$(".time").removeClass("final-seconds");
			this.gameOver();
		}
	},
	gameOver:function() {
		globals.canMove = false;
		globals.paused = true;

		var gameOver = this.templates.gameOver;
		var scoreText = "Score";
		var score = globals.currentScore.get("currentScore");
		var scoreClass= "";

		//score = 58;

		if(score>globals.highScore) {
			scoreText = "New High Score!";
			scoreClass = "new-high-score";
			if(typeof(Storage) !== "undefined") {
				localStorage.setItem("highScore", score);
				localStorage.setItem("tileChooser", globals.tileChoicesRemaining);
			}
			var data = {
			    leaderboardId: "board1",
			    score: score
			};
			if(typeof(gamecenter) !== "undefined") {

				gamecenter.submitScore(function(){}, function(){}, data);
			} else if(typeof(googleplaygame) !== "undefined") {
				data.leaderboardId = "CgkIgdCh9vMbEAIQAA";

				googleplaygame.submitScore(data);
			}
			util.playSound(3);
		} else {
			util.playSound(2);
		}

		var achievement = {};
		if(typeof(gamecenter) !== "undefined") {
			achievement.percent = "100";

			if(globals.currentScore.get("words")>=100) {
				achievement.achievementId = "100words";

				gamecenter.reportAchievement(function() {}, function() {}, achievement);

			} else if(globals.currentScore.get("words")>=90) {
				achievement.achievementId = "90words";

				gamecenter.reportAchievement(function() {}, function() {}, achievement);

			} else if(globals.currentScore.get("words")>=80) {
				achievement.achievementId = "80words";

				gamecenter.reportAchievement(function() {}, function() {}, achievement);
			}


			if(globals.currentScore.get("sevenLetters")===true) {
				achievement.achievementId = "7letters";

				gamecenter.reportAchievement(function() {}, function() {}, achievement);
			}
			if(globals.currentScore.get("sixLetters")===true) {
				achievement.achievementId = "6letters";

				gamecenter.reportAchievement(function() {}, function() {}, achievement);
			}
			if(globals.currentScore.get("fiveLetters")===true) {
				achievement.achievementId = "5letters";

				gamecenter.reportAchievement(function() {}, function() {}, achievement);
			}

		} else if(typeof(googleplaygame) !== "undefined") {


			if(globals.currentScore.get("words")>=100) {

				googleplaygame.unlockAchievement({achievementId:"CgkIgdCh9vMbEAIQBw"});

			} else if(globals.currentScore.get("words")>=90) {

				googleplaygame.unlockAchievement({achievementId:"CgkIgdCh9vMbEAIQBg"});

			} else if(globals.currentScore.get("words")>=80) {
				googleplaygame.unlockAchievement({achievementId:"CgkIgdCh9vMbEAIQBQ"});

			}


			if(globals.currentScore.get("sevenLetters")===true) {
				googleplaygame.unlockAchievement({achievementId:"CgkIgdCh9vMbEAIQBA"});
			}
			if(globals.currentScore.get("sixLetters")===true) {
				googleplaygame.unlockAchievement({achievementId:"CgkIgdCh9vMbEAIQAw"});
			}
			if(globals.currentScore.get("fiveLetters")===true) {
				googleplaygame.unlockAchievement({achievementId:"CgkIgdCh9vMbEAIQAg"});
			}

		}



		this.$el.append(_.template(gameOver,{scoreClass:scoreClass,
			scoreText:scoreText,
			score:score,
			words:globals.currentScore.get("words"),
			longestChain:globals.currentScore.get("longestChain"),
			crossovers:globals.currentScore.get("crossovers")
		}));

		$(".game-overlay,.game-over").show();
		setTimeout(function() {
			$(".game-overlay,.game-over").addClass("visible");
			if(score>globals.highScore) {
				util.sparkle($(".new-high-score small,.new-high-score strong"));
			}

		},10);

	},
	menuGame:function(e) {
		e.preventDefault();

		globals.canMove = false;
		globals.paused = true;

		$(".game-overlay,.in-game-menu").show();

		setTimeout(function() {
			$(".game-overlay,.in-game-menu").addClass("visible");
		},10);

		$(".grid").addClass("paused");

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
			$(".game-overlay,.pause-menu,.in-game-menu").removeClass("visible");
			$(".grid").removeClass("paused");
			globals.canMove = true;
			this.hasWord(true);
			setTimeout(function(self) {
				$(".game-overlay,.pause-menu,.in-game-menu").hide();
				if($('.endless-mode').length<1) {
					self.updateTime();
				}
			},300,this);
		}
	},
	quitGame:function(e) {
		e.preventDefault();
		$(".game-overlay,.pause-menu").removeClass("visible");

		$(".app").addClass("hide");
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
		//console.log(letter);
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
			//console.log(fromDic,wordPos,vertical);
			//possibley move this to model

			$(".grid").addClass("shift");
			//console.log(foundWords);
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
		self = this,points = 0,wordLength = 0,bonus = [];


		if(fwl>1) {
			//if words are joined - find cross over number
			crossOver = foundWords[1].pos+(Math.ceil((foundWords[0].pos-foundWords[1].pos)/5)*5);


			if(foundWords[1].pos>(foundWords[0].pos+(foundWords[0].len-1)) || crossOver<0 || crossOver>(((foundWords[1].len-1)*5)+foundWords[1].pos) || (foundWords[0].pos+(foundWords[0].len-1))<crossOver) {
				crossOver = false;
				fwl = 1;
			}
		}
		points = foundWords[0].points;

		$(".top-bar").find(".found-word").removeClass("smaller show-word");

		if(fwl>1) {
			points += foundWords[1].points;
			//$(".top-bar").find(".found-word").html("<a href=\"" + globals.wordLookup + foundWords[0].word + "\">" + foundWords[0].word + "</a> & <a href=\"" + globals.wordLookup + foundWords[0].word + "\">" + foundWords[1].word + "</a>");
			if((foundWords[0].word.length + foundWords[1].word.length) > 10) {
				$(".top-bar").find(".found-word").addClass("smaller");
			}
			$(".top-bar").find(".found-word").html(foundWords[0].word + " <span>&</span> " + foundWords[1].word);
			wordLength = Math.max(foundWords[0].word.length,foundWords[1].word.length);
			globals.currentScore.set({crossovers:globals.currentScore.get("crossovers")+1});

			globals.currentScore.set("words",globals.currentScore.get("words")+2);

		} else {
			//$(".top-bar").find(".found-word").html("<a href=\"" + globals.wordLookup + foundWords[0].word + "\">" + foundWords[0].word + "</a>");
			$(".top-bar").find(".found-word").text(foundWords[0].word);
			wordLength = foundWords[0].word.length;
			globals.currentScore.set("words",globals.currentScore.get("words")+1);
		}
		setTimeout(function() {
			$(".top-bar").find(".found-word").addClass("show-word");
		},10);

		var pointMessageTop = $(".grid").offset().top+(Math.floor(foundWords[0].pos/5)*globals.tileSettings.tileSize)+globals.tileSettings.tileSize*0.5;
		$(".grid-message-points").css({"top":pointMessageTop,"left":$(".grid").offset().left+((foundWords[0].pos-(Math.floor(foundWords[0].pos/5)*5))*globals.tileSettings.tileSize)}).text(points);

		var minusOneTop = $(".grid").offset().top+(Math.floor((foundWords[0].pos-5)/5)*globals.tileSettings.tileSize)+globals.tileSettings.tileSize*0.5;
		var plusOneTop = $(".grid").offset().top+(Math.floor((foundWords[0].pos+5)/5)*globals.tileSettings.tileSize)+globals.tileSettings.tileSize*0.5;

		var belowWord;

		var bySide;
		var standardLeft = $(".grid").offset().left+((foundWords[0].pos-(Math.floor(foundWords[0].pos/5)*5))*globals.tileSettings.tileSize);

		if(foundWords[0].vertical===true) {
			if((foundWords[0].pos+(foundWords[0].word.length*5))%7===0) {
				belowWord = $(".grid").offset().top+(Math.floor((foundWords[0].pos+(foundWords[0].word.length*4))/5)*globals.tileSettings.tileSize)+globals.tileSettings.tileSize*0.5;
			} else {
				belowWord = $(".grid").offset().top+(Math.floor((foundWords[0].pos+(foundWords[0].word.length*5))/5)*globals.tileSettings.tileSize)+globals.tileSettings.tileSize*0.5;
			}


			if((foundWords[0].pos+1)%5===0 || (foundWords[0].pos+2)%5===0) {
				//to left
				bySide = $(".grid").offset().left+(((foundWords[0].pos-2)-(Math.floor(foundWords[0].pos/5)*5))*globals.tileSettings.tileSize);

				standardLeft = $(".grid").offset().left+(((foundWords[0].pos-1)-(Math.floor(foundWords[0].pos/5)*5))*globals.tileSettings.tileSize);

			} else {
				//to right
				bySide = $(".grid").offset().left+(((foundWords[0].pos+1)-(Math.floor(foundWords[0].pos/5)*5))*globals.tileSettings.tileSize);
			}

		} else {


			if((foundWords[0].pos+foundWords[0].word.length)%5===0) {
				bySide = $(".grid").offset().left+((((foundWords[0].pos+foundWords[0].word.length)-5)-(Math.floor(foundWords[0].pos/5)*5))*globals.tileSettings.tileSize);
			} else {
				bySide = $(".grid").offset().left+(((foundWords[0].pos+2)-(Math.floor(foundWords[0].pos/5)*5))*globals.tileSettings.tileSize);
			}

			if(foundWords[0].pos>29) {
				plusOneTop = $(".grid").offset().top+(Math.floor((foundWords[0].pos+2)/5)*globals.tileSettings.tileSize)+globals.tileSettings.tileSize*0.5;
				belowWord = $(".grid").offset().top+(Math.floor((foundWords[0].pos+5)/5)*globals.tileSettings.tileSize);

			} else {
				belowWord = $(".grid").offset().top+(Math.floor((foundWords[0].pos+5)/5)*globals.tileSettings.tileSize)+globals.tileSettings.tileSize*0.5;
			}

		}



		if(wordLength>4) {
			$(".grid-message-letter-bonus").css({"top":plusOneTop,"left":bySide});
			$(".grid-message-letter-bonus").find(".text").html("<span>" + wordLength + "</span><small>Letter<br/>Word</small>");
			$(".grid-message-letter-bonus").find(".bonus").text("+" + (wordLength*2));

			points += (wordLength*2);

			if(wordLength===5) {
				globals.currentScore.set("fiveLetters",true);
			} else if(wordLength===6) {
				globals.currentScore.set("sixLetters",true);
			} else if(wordLength===7) {
				globals.currentScore.set("sevenLetters",true);
			}
		}
		//if(globals.moves>6) {
			//might bring this back oneday
			//$(".grid-message-move-penalty").css({"top":pointMessageTop,"left":$(".grid").offset().left+((foundWords[0].pos-(Math.floor(foundWords[0].pos/5)*5))*globals.tileSettings.tileSize)}).text(globals.moves + " Move Penalty");
		//}

		if(fwl>1) {
			$(".grid-message-pair").css({"top":minusOneTop,"left":$(".grid").offset().left+((foundWords[0].pos-(Math.floor(foundWords[0].pos/5)*5))*globals.tileSettings.tileSize)}).find(".bonus").text("+10");
			points += 10;
		}

		globals.currentChain+=1;
		if(false===globals.playerFound) {

			if(globals.currentChain>globals.currentScore.get("longestChain")) {
				globals.currentScore.set("longestChain",globals.currentChain);
			}
			$(".grid-message-chain").css({"top":belowWord,"left":standardLeft});
			$(".grid-message-chain").find(".text").html("<span>" + globals.currentChain + "</span><small>word<br/>chain</small>");
			$(".grid-message-chain").find(".bonus").text("+" + (globals.currentChain*5));

			points += (globals.currentChain*5);

		}

		globals.currentScore.set({currentScore:globals.currentScore.get("currentScore")+points});

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

			if(wordLength>4) {
				$(".grid-message-letter-bonus").removeClass("hidden");

				bonus.push(".grid-message-letter-bonus");
			}
			//gone for now
			//if(globals.moves>6) {
				//$(".grid-message-move-penalty").removeClass("hidden");
				//globals.moves = 0;
			//}

			if(fwl>1) {
				$(".grid-message-pair").removeClass("hidden");

				bonus.push(".grid-message-pair");
			}

			if(false===globals.playerFound) {
				$(".grid-message-chain").removeClass("hidden");

				bonus.push(".grid-message-chain");
			}
			globals.playerFound = false;

			if(bonus.length) {
				util.sparkle($(bonus.join()));
			}
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
			$(".grid-message").addClass("hidden");
			$(".grid-overlay").removeClass("visible");
			util.removeSparkle();
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
						//console.log("new tiles " + word);
						while(word.length>2) {
							if(self.checkForWord(word).length) {
								//keep the loop going if theres a word
								checkForWord = true;
								//console.log("there was a word in the new tiles");
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
							//console.log("J2 " + j);
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

		if(globals.tileChoicesRemaining>0) {
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

		globals.tileChoicesRemaining -= 1;

		$(".choose-tile").find(".choices-remaining").text(globals.tileChoicesRemaining);

		localStorage.setItem("tileChooser", globals.tileChoicesRemaining);

		//new word check
		this.hasWord(true);
	},
	shareOnFacebook:function(e) {
		e.preventDefault();
		var shareText = 'I just scored ' + globals.currentScore.get("currentScore") + ' on Wordio';
		window.plugins.socialsharing.shareViaFacebookWithPasteMessageHint(shareText, null /* img */, "http://lukehaas.me/games/wordio", 'Paste it in', function() {}, function(errormsg){alert(errormsg);});
	},
	shareOnTwitter:function(e) {
		e.preventDefault();
		var shareText = 'I just scored ' + globals.currentScore.get("currentScore") + ' on Wordio';
		window.plugins.socialsharing.shareViaTwitter(shareText, null /* img */, 'http://lukehaas.me/games/wordio');
	},
	additionalEvents: function() {

		this.events[globals.press+' .choose-tile'] = 'showTileSelection';
		this.events[globals.press+' .tile-selection div'] = 'chooseTile';
		this.events[globals.press+' .pause-btn'] = 'pauseGame';

		this.events[globals.press+' .in-game-menu-btn'] = 'menuGame';
		this.events[globals.press+' .resume-btn'] = 'resumeGame';

		this.events[globals.press+' .quit-btn'] = 'quitGame';


		this.events[globals.press+' .htp-play-btn a'] = 'stopHowToPlayAndPlay';

		this.events[globals.press+' .htp-next-btn a'] = 'howToPlayNext';

		this.events[globals.press+' .facebook'] = 'shareOnFacebook';

		this.events[globals.press+' .twitter'] = 'shareOnTwitter';


	},
	templates: {
		grid:'\
		<div class="grid">\
		<div class="grid-overlay"></div>\
		</div>\
		<div class="grid-message grid-message-letter-bonus hidden"><div class="text"></div><div class="bonus"></div></div>\
		<div class="grid-message grid-message-pair hidden"><div class="text">Pair!</div><div class="bonus"></div></div>\
		<div class="grid-message grid-message-chain hidden"><div class="text"></div><div class="bonus"></div></div>\
		<div class="grid-message grid-message-move-penalty hidden"><div class="text"></div><div class="bonus"></div></div>\
		<div class="grid-message grid-message-points hidden"><div class="bonus"></div></div>\
		',
		pauseMenu:'\
		<div class="pause-menu"><div><h3>Paused</h3>\
		<ul>\
			<li><a href="#" class="resume-btn btn">Resume</a></li>\
			<li><a href="javascript:location.reload();" class="btn">Restart</a></li>\
			<li><a href="#" class="quit-btn btn">Quit</a></li>\
		</ul>\
		</div></div>\
		',
		inGameMenu:'\
		<div class="in-game-menu"><div><h3>Menu</h3>\
		<ul>\
			<li><a href="#" class="resume-btn btn">Resume</a></li>\
			<li><a href="javascript:location.reload();" class="btn">Restart</a></li>\
			<li class="<%= className %>"><a href="#" class="quit-btn btn">Quit</a></li>\
		</ul>\
		</div></div>\
		',
		gameOver:'\
		<div class="game-over"><div class="inner-container">\
		<div class="score <%= scoreClass %>"><p><small><%= scoreText %></small></p><p class="final-score"><strong><%= score %></strong></p></div>\
		<ul class="stats">\
		<li><span>Words: </span><strong><%= words %></strong></li>\
		<li><span>Longest chain: </span><strong><%= longestChain %></strong></li>\
		<li><span>Pairs: </span><strong><%= crossovers %></strong></li>\
		</ul>\
		<ul class="buttons">\
		<li><a href="javascript:location.reload();" class="btn">New Game</a></li>\
		<li><a href="#" class="quit-btn btn">Menu</a></li>\
		</ul>\
		<ul class="social">\
		<li><a href="#" class="facebook icon icon-facebook"><small>Share on Facebook</small></a></li>\
		<li><a href="#" class="twitter icon icon-twitter"><small>Share on Twitter</small></a></li>\
		</ul>\
		</div></div>\
		',
		tile:'\
		<div data-points="<%= pointsGroup %>" class="tile <%= className %>"><%= letter %></div>\
		',
		topBar:'\
		<div class="top-bar"><div class="time"></div><div class="found-word"></div><div class="current-score"></div></div>\
		',
		bottomPanelOld:'\
		<div class="bottom-panel">\
		<a href="#" class="pause-btn">Pause</a>\
		<div class="bonuses">\
			<div class="bonus-item longest-word">\
				<span class="points">0</span>\
				<div class="char-word">\
					<span class="char char1">W</span>\
					<span class="char char2">o</span>\
					<span class="char char3">r</span>\
					<span class="char char4">d</span>\
					<span class="char char5">s</span>\
				</div>\
			</div>\
			<div class="bonus-item chain-word">\
				<span class="points">0</span>\
				<div class="char-word">\
					<span class="char char1">C</span>\
					<span class="char char2">h</span>\
					<span class="char char3">a</span>\
					<span class="char char4">i</span>\
					<span class="char char5">n</span>\
				</div>\
			</div>\
			<div class="bonus-item crossover-word">\
				<span class="points">0</span>\
				<div class="char-word">\
					<span class="char char1">P</span>\
					<span class="char char2">a</span>\
					<span class="char char3">i</span>\
					<span class="char char4">r</span>\
					<span class="char char5">s</span>\
				</div>\
			</div>\
		</div>\
		</div>\
		',
		bottomPanel:'\
		<div class="bottom-panel">\
		<a href="#" class="pause-btn">Pause</a>\
		<a href="#" class="in-game-menu-btn">Menu</a>\
		</div>\
		',
		chooseRandomTileBtn:'\
		<a href="#" class="choose-tile">?<div class="choices-remaining"><%= remaining %></div></a>\
		',
		tileSelection:'\
		<div class="tile-selection"><div>A</div><div>B</div><div>C</div><div>D</div><div>E</div><div>F</div><div>G</div><div>H</div><div>I</div><div>J</div><div>K</div><div>L</div><div>M</div><div>N</div><div>O</div><div>P</div><div>Q</div><div>R</div><div>S</div><div>T</div><div>U</div><div>V</div><div>W</div><div>X</div><div>Y</div><div>Z</div></div>\
		',
		howToPlay:'\
		<div class="how-to-play icon icon-arrow-up2 north-west"></div>\
		<div class="how-to-play icon icon-arrow-up2 north-east"></div>\
		<div class="how-to-play htp-time">A game lasts 150 seconds.</div>\
		<div class="how-to-play htp-score">Your score is recorded here.</div>\
		<div class="how-to-play htp-next-btn"><a href="#" class="btn">Next</a></div>\
		<div class="how-to-play htp-play-btn"><a href="#" class="btn">Play</a></div>\
		<div class="how-to-play htp-instruction1">Drag tiles around the grid to form words and score points.</div>\
		<div class="how-to-play htp-instruction2">Switch mystery tiles with letter tiles to get the next letter in the alphabet.</div>\
		<div class="how-to-play htp-tile-switch"><div class="letter1">A</div><div class="letter2">B</div><div class="mystery"></div></div>\
		'
	}
}));

//App.Views.LetterGridView.mixin(DragMixin);
