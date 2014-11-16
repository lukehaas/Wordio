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
		}
		for(i = 0;i < (globals.tileSettings.row*globals.tileSettings.column);i++) {
			grid.add(globals.letter[i]);
		}
		this.positionTiles();
	},
	assignLetters: function(i) {
		
		this.rand = Math.floor((Math.random()*10)+1);

		if(this.rand>=7 && this.rand<10) {

			globals.letter[i].set({type:'v',value:this.getVowel()});
		} else if(this.rand<7) {

			globals.letter[i].set({type:'c',value:this.getConsonant()});
		} else {

			globals.letter[i].set({type:'r',value:""});
		}

	},
	positionTiles:function() {
		var top = 0;
		var left = 0;
		var z = 0;

		$(".tile").each(function(i) {
			$(this).attr('id',i).addClass("mover").css({"font-size":(globals.tileSettings.tileSize*0.45)+"px","line-height":globals.tileSettings.tileSize+"px","width":globals.tileSettings.tileSize+"px","height":globals.tileSettings.tileSize+"px","top":top+"px","left":left+"px"});
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
	getConsonant:function() {
		return globals.consonants[Math.floor(Math.random()*21)];
	},
	appendLetter:function(letter) {
		var tmpl = this.templates.tile;
		var className;
		if(letter.get("type")=="r") {
			className = "random";
		}
		this.$el.find(".grid").append(_.template(tmpl,{letter:letter.get("value"),className:className}));
	},
	updateLetter:function(letter) {
		console.log(letter);
	},
	hasWord:function(canHandleFound) {
		globals.canMove = false;
		var i = 0;
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
		canCompleteLine = true;
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


		if(fromDic.length>0 && canHandleFound===true) {
			console.log(fromDic,wordPos,vertical);
			//possibley move this to model
			$(".top-bar").html(fromDic);
			$(".grid").addClass("shift");
			this.handleFound(wordPos,fromDic.length,vertical);
		}

		globals.canMove = true;
		return false;

	},
	checkForWord:function(word) {
		var letter = word.charAt(0);
		var c = dictionary[letter].length;
		var i = 0;
		var longestWord = "";
		for(;i<c;i++) {
			//console.log(dictionary[letter][i]);
			if(word.indexOf(dictionary[letter][i])===0) {

				if(dictionary[letter][i].length > longestWord.length) {
					longestWord = dictionary[letter][i];
				}
			}
		}
		return longestWord;
	},
	handleFound:function(pos,len,vertical) {
		
		var i = pos;
		var k = pos;
		var j = 0;
		var row = 5;
		var rowCount = Math.floor(pos/5);
		var mRowCount = rowCount*5;
		var l = len;
		len+=i;
		
		for(;i<len;i++) {	
			if(vertical===true) {
				$("#"+k).removeClass("mover").addClass("tmp-bg");

				k+=5;	
			} else {
				$("#"+i).removeClass("mover").addClass("tmp-bg");
				
			}
		}
		setTimeout(function() {
			for(i = k = pos;i<len;i++) {
				if(vertical===true) {
					$("#"+k).addClass("shrink");

					k+=5;
				} else {
					$("#"+i).addClass("shrink");

				}
			}

			setTimeout(function() {
				for(i = k = pos;i<len;i++) {
					if(vertical===true) {
						j = k-(rowCount*5);

						$("#"+k).css("top",((l*globals.tileSettings.tileSize)*-1)).removeClass("random shrink tmp-bg");
						
						$("#"+k).attr("id",j+"tmp");

						l--;
						k+=5;
					} else {
						$("#"+i).css("top",-globals.tileSettings.tileSize).removeClass("random shrink tmp-bg");

						$("#"+i).attr("id",(i-mRowCount)+"tmp");
					}
				}
				//the time to shrink
			},500);
			//the time to go red
		},500);



		//part 2
		if(rowCount>0) {
			var dRow = row;
			var tmp = [];
			setTimeout(function() {
				k = pos;
				l = len-pos;
				//shift tiles down
				while(rowCount) {
					if(vertical===true) {
						k-=5;
						dRow = (l*5)+k;
						
						$("#"+k).css("top",(Math.floor(dRow/5))*globals.tileSettings.tileSize).attr("id",dRow);

						tmp[k] = globals.letter[dRow];

						globals.letter[dRow] = globals.letter[k];

						globals.letter[k] = tmp[k];
					} else {
						i = pos;
						k = pos - dRow;
						for(;i<len;i++) {
							console.log(k);
							$("#"+k).css("top",((Math.floor(k/5)+1)*globals.tileSettings.tileSize)).attr("id",k+5);
							//if first sweep - store in temp
							//if last assign temp to 0 row
							if(dRow==row) {
								//this is the first sweep
								tmp[i] = globals.letter[k+5];
							}
							globals.letter[k+5] = globals.letter[k];

							if(rowCount===1) {
								globals.letter[k] = tmp[i];
							}
							k++;
						}
						dRow += row;
					}


					rowCount--;
				}
				//the time to go red and shrink - plus small delay
			},1100);
		}

		//part 3
		//set tmp IDs back to regular values
		setTimeout(function(self) {
			i = pos;
			for(;i<len;i++) {

				if(vertical===true) {
					
					self.assignLetters(j);
					$("#"+j+"tmp").html(globals.letter[j].get("value"));
					if(globals.letter[j].get("type")=="r") {
						$("#"+j+"tmp").addClass("random");
					}
					$("#" + j + "tmp").addClass("mover").css("top",Math.floor(j/5)*globals.tileSettings.tileSize).attr("id",j);
					

					j-=5;
				} else {

					//asign new letters
					self.assignLetters((i-mRowCount));
					$("#"+(i-mRowCount)+"tmp").html(globals.letter[(i-mRowCount)].get("value"));

					if(globals.letter[(i-mRowCount)].get("type")=="r") {
						$("#"+(i-mRowCount)+"tmp").addClass("random");
					}

					$("#"+(i-mRowCount)+"tmp").addClass("mover").css("top","0px").attr("id",(i-mRowCount));
				}
			}
			console.log(globals.letter);
		
			setTimeout(function() {
				globals.canMove = true;
				$(".grid").removeClass("shift");
				self.hasWord(true);
			},400);

			//the time to go red and shrink plus small delay plus time to shift higher tiles down
		},1500,this);
		
	},
	templates: {
		grid:'\
		<div class="grid"></div><a href="javascript:location.reload();">Refresh</a>\
		',
		tile:'\
		<div class="tile <%= className %>"><%= letter %></div>\
		',
		topBar:'\
		<div class="top-bar"><div class="found-word"></div></div>\
		'
	}
}));

//App.Views.LetterGridView.mixin(DragMixin);