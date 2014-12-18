App.Views.LetterGridView = Backbone.View.extend(_.extend({},DragMixin,{
	el: $('.app'),
	initialize: function(){
		//this gives us access to (this) within the appendLetter method
		_.bindAll(this, 'appendLetter');

		_.bindAll(this, 'hasWord');

		_.bindAll(this, 'getNextLetter');
	},
	renderLevel1:function() {
		var tmpl = this.templates.grid;
		var topBar = this.templates.topBar;

		this.$el.html(_.template(topBar,{}));

		this.$el.append(_.template(tmpl,{}));

		var grid = new App.Collections.Grid();
		grid.bind('add', this.appendLetter);
		//grid.bind('change',this.updateLetter);

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
	positionTiles:function() {
		var top = 0;
		var left = 0;
		var z = 0;

		$(".tile").each(function(i) {
			$(this).attr('id',i).addClass("mover").css({"font-size":(globals.tileSettings.tileSize*0.48)+"px","line-height":globals.tileSettings.tileSize+"px","width":globals.tileSettings.tileSize+"px","height":globals.tileSettings.tileSize+"px","top":top+"px","left":left+"px"});
			z++;

			//left += globals.tileSettings.tileSize;
			left += globals.tileSettings.tileSize;
			if(z==globals.tileSettings.row) {
				left = 0;
				top += globals.tileSettings.tileSize;
				z = 0;
			}
		});
		$(".grid").css({"width":(globals.tileSettings.tileSize*globals.tileSettings.row)+"px","height":(globals.tileSettings.tileSize*globals.tileSettings.column)+"px"});
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
			console.log(fromDic,wordPos,vertical);
			//possibley move this to model
			
			$(".grid").addClass("shift");
			console.log(foundWords);
			//this.handleFound(wordPos,fromDic.length,vertical);
			this.handleFound(foundWords);
		} else {
			globals.canMove = true;
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
		globals.canMove = false;
		var p = 0,fwl = foundWords.length,
		i,k,len,j,row = 5,rowCount = [0,0],
		mRowCount,l,crossOver = false,
		time1 = 1010,word = "",checkForWord = true;

		if(fwl>1) {
			//if words are joined - find cross over number
			crossOver = foundWords[1].pos+(Math.ceil((foundWords[0].pos-foundWords[1].pos)/5)*5);
			

			if(foundWords[1].pos>(foundWords[0].pos+(foundWords[0].len-1)) || crossOver<0 || crossOver>(((foundWords[1].len-1)*5)+foundWords[1].pos) || (foundWords[0].pos+(foundWords[0].len-1))<crossOver) {
				crossOver = false;
				fwl = 1;
			}
		}
		console.log(crossOver);
		if(fwl>1) {
			$(".top-bar").html(foundWords[0].word + " & " + foundWords[1].word);
		} else {
			$(".top-bar").html(foundWords[0].word);
		}
		console.log("cross over: " + crossOver);

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
		
		setTimeout(function() {
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
			

			
			//the time to go red
		},500);




			setTimeout(function() {
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
				//the time to shrink
			},1000);




//if rowCount OR rowCount2 are greater than 0

		//part 2
		if(rowCount[0] > 0 || rowCount[1] > 0) {
			time1 = 1500;
			setTimeout(function() {
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
				//look at this 1010 originally
			},1010);
		}


		//part 3
		//set tmp IDs back to regular values
		setTimeout(function(self) {
			for(p = 0;p<fwl;p++) {

				while(checkForWord) {

					i = k = foundWords[p].pos;
					len = foundWords[p].len+i;

					mRowCount = rowCount[p]*5;
					word = "";

					for(;i<len;i++) {

						if(foundWords[p].vertical===true) {
							
							j = k-mRowCount;

							console.log("J1 " + j);

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
			//console.log(globals.letter);
		


			//the time to go red and shrink plus small delay plus time to shift higher tiles down
		},time1,this);


		setTimeout(function(self) {
			//globals.canMove = true;
			$(".grid").removeClass("shift");
			if(globals.debug!==1 && globals.debug!==2) {
				self.hasWord(true);
			}

		},time1+400,this);
	},
	templates: {
		grid:'\
		<div class="grid"></div><a href="javascript:location.reload();">Refresh</a>\
		',
		tile:'\
		<div data-points="<%= pointsGroup %>" class="tile <%= className %>"><%= letter %></div>\
		',
		topBar:'\
		<div class="top-bar"><div class="found-word"></div></div>\
		'
	}
}));

//App.Views.LetterGridView.mixin(DragMixin);