
var RandomGen = new RNG();

var intro_template = [
  "..................................",
  "..................................",
  "..................................",
  "......Puzzle Script Terminal......",
  "..............v 1.7+..............",
  "..................................",
  "..................................",
  "..................................",
  ".........insert cartridge.........",
  "................................. ",
  "................................  ",
  "...............................   ",
  "..............................    "
];

var messagecontainer_template = [
  "..................................",
  "..................................",
  "..................................",
  "..................................",
  "..................................",
  "..................................",
  "..................................",
  "..................................",
  "..................................",
  "..................................",
  "..........X to continue...........",
  "..................................",
  ".................................."
];

var messagecontainer_template_mouse = [
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"........Click to continue.........",
	"..................................",
	".................................."
];

var titletemplate_firstgo = [
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..........#.start game.#..........",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	".................................."];

var titletemplate_firstgo_selected = [
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"###########.start game.###########",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	".................................."];
	
var titletemplate_empty = [
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	"..................................",
	".................................."];

var title_options = [[
	".............continue.............",
	"...........#.continue.#...........",
	"############.continue.############"
], [
	"...........level select...........",
	".........#.level select.#.........",
	"##########.level select.##########"
], [
	".............settings.............",
	"...........#.settings.#...........",
	"############.settings.############"
], [
	".............new game.............",
	"...........#.new game.#...........",
	"############.new game.############"
]];

var titleImage=[];
var titleWidth=titletemplate_empty[0].length;
var titleHeight=titletemplate_empty.length;
var textMode=true;
var titleScreen=true;
var titleMode=0;//1 means title screen with options, 2 means level select
var titleSelection=0;
var titleSelectOptions=2;
var titleSelected=false;

function showContinueOptionOnTitleScreen(){
	return (curlevel>0||curlevelTarget!==null)&&(curlevel in state.levels);
}

function unloadGame() {
	state=introstate;
	level = new Level(0, 5, 5, 2, null, null);
	level.objects = new Int32Array(0);
	generateTitleScreen();
	canvasResize();
	redraw();
	titleSelected=true;
}

function isContinueOptionSelected() {
	if(state.metadata["continue_is_level_select"] !== undefined) {
		return false;
	}

	return titleSelection == 0; // continue option is always 1st
}

function isNewGameOptionSelected() {
	return titleSelection == titleSelectOptions-1; // new game option is always on bottom
}

function isLevelSelectOptionSelected() {
	if(state.metadata["level_select"] === undefined) {
		return false;
	}
	
	if(state.metadata["continue_is_level_select"] !== undefined) {
		return titleSelection == 0; // continue option is always 1st
	}

	return titleSelection == 1; // level select option is always 2nd if it exists
}

function generateTitleScreen()
{
  tryLoadCustomFont();

	titleMode=showContinueOptionOnTitleScreen()?1:0;

	if (state.levels.length===0) {
		titleImage=intro_template;
		return;
  }

	var title = "PuzzleScript Game";
	if (state.metadata.title!==undefined) {
		title=state.metadata.title;
	}

	if (titleMode===0) {
        titleSelectOptions = 1;
		if (titleSelected) {
			titleImage = deepClone(titletemplate_firstgo_selected);		
		} else {
			titleImage = deepClone(titletemplate_firstgo);					
		}
	} else {

		var availableOptions = [0];
		
		titleSelectOptions = 2;

		if(state.metadata["level_select"] !== undefined && state.metadata["continue_is_level_select"] === undefined) {
			titleSelectOptions++;
			
			availableOptions.push(1);
		}

		if(state.metadata["settings"] !== undefined) {
			titleSelectOptions++;
			
			availableOptions.push(2);
		}

		availableOptions.push(3);

		titleImage = deepClone(titletemplate_empty);

		for(var i = 0; i < titleSelectOptions; i++) {
			var version = 0;
			if(titleSelection == i) {
				if(titleSelected) {
					version = 2;
				} else {
					version = 1;
				}
			}

			var j = 0;
			if(titleSelectOptions == 2 && i == 1) {
				j = 1;
			}

			titleImage[5 + i + j] = deepClone(title_options[availableOptions[i]][version]);
		}
	}

	var noAction = 'noaction' in state.metadata;	
	var noUndo = 'noundo' in state.metadata;
	var noRestart = 'norestart' in state.metadata;

	titleImage[10] = ".arrow keys to move...............";

	if (noAction) {
		titleImage[11]=".X to select......................";
	} else {
		titleImage[11]=" X to action......................"
	}

	if (noUndo && noRestart) {
		titleImage[12]="..................................";
	} else if (noUndo) {
		titleImage[12]=".R to restart.....................";
	} else if (noRestart) {
		titleImage[12]=".Z to undo........................";
	} else {
		titleImage[12]=".Z to undo, R to restart..........";
	}

	if ("mouse_left" in state.metadata || "mouse_drag" in state.metadata || "mouse_up" in state.metadata) {
		titleImage[10]="..................................";
		titleImage[11]=".MOUSE to interact................";
		titleImage[12]=".MMB to undo, R to restart........";
	}
	for (var i=0;i<titleImage.length;i++)
	{
		titleImage[i]=titleImage[i].replace(/\./g, ' ');
	}

	var width = titleImage[0].length;
	var titlelines=wordwrap(title,titleImage[0].length);
	if (state.metadata.author!==undefined){
		if ( titlelines.length>3){
			titlelines.splice(3);
			logWarning("Game title is too long to fit on screen, truncating to three lines.",undefined,true);
		}
	} else {
		if ( titlelines.length>5){
			titlelines.splice(5);
			logWarning("Game title is too long to fit on screen, truncating to five lines.",undefined,true);
		}

	}
	for (var i=0;i<titlelines.length;i++) {
		var titleline=titlelines[i];
		var titleLength=titleline.length;
		var lmargin = ((width-titleLength)/2)|0;
		var rmargin = width-titleLength-lmargin;
		var row = titleImage[1+i];
		titleImage[1+i]=row.slice(0,lmargin)+titleline+row.slice(lmargin+titleline.length);
	}
	if (state.metadata.author!==undefined) {
		var attribution="by "+state.metadata.author;
		var attributionsplit = wordwrap(attribution,titleImage[0].length);
		if (attributionsplit[0].length<titleImage[0].length){
			attributionsplit[0]=" "+attributionsplit[0];
		}
		if (attributionsplit.length>3){
			attributionsplit.splice(3);
			logWarning("Author list too long to fit on screen, truncating to three lines.",undefined,true);
		}
		for (var i=0;i<attributionsplit.length;i++) {
			var line = attributionsplit[i]+" ";
			if (line.length>width){
				line=line.slice(0,width);
			}
			var row = titleImage[3+i];
			titleImage[3+i]=row.slice(0,width-line.length)+line;
		}
	}

}

var levelSelectScrollPos = 0;

function gotoLevelSelectScreen() {
	if(state.metadata["level_select"] === undefined){
		goToTitleScreen();
		return;
	}
	levelSelectScrollPos = 0;
	titleSelected = false;
	timer = 0;
	quittingTitleScreen = false;
	quittingMessageScreen = false;
	messageselected = false;
	titleMode = 2;
	titleScreen = true;
	textMode = true;
    againing = false;
	messagetext = "";

	if (titleSelection == false) {
		for(var i = 0; i < state.sections.length; i++) {
			if(state.sections[i].firstLevel > curlevel) {
				titleSelection = Math.max(0,i-1);
				break;
			}
		}
  }
  
  state.metadata = deepClone(state.default_metadata);
  twiddleMetadataExtras();

	generateLevelSelectScreen();
	redraw();
}

function generateLevelSelectScreen() {
	/*
	"...........select level...........",
	"..................................",
	"[✓].#.Testy section maxxx long.#.O",
	".................................|",
	"[ ]...Unselected section.........|",
	".................................|",
	"[ ]...Another section............|",
	".................................|",
	"[ ]...Another section............|",
	".................................|",
	"[ ]...Another section............|",
	".................................|",
	"[ ]...Another section............|"
  */

	titleImage = [
		"ESC: Back             Level Select",
		"                                  "
	];

	amountOfLevelsOnScreen = 9;

	titleSelectOptions = state.sections.length;

	if(titleSelection < levelSelectScrollPos) { //Up
		levelSelectScrollPos = titleSelection;
	} else if(titleSelection >= levelSelectScrollPos + amountOfLevelsOnScreen) { //Down
		levelSelectScrollPos = titleSelection - amountOfLevelsOnScreen + 1;
	}

	var posOnScreen = titleSelection - levelSelectScrollPos;
	if (posOnScreen == 0) {
		levelSelectScrollPos = Math.max(0, levelSelectScrollPos - 1);
		//console.log("On first position");
	}

	if (posOnScreen == amountOfLevelsOnScreen-1) {
		levelSelectScrollPos = Math.min(state.sections.length-amountOfLevelsOnScreen, levelSelectScrollPos + 1);
		//console.log("On last position");
	}

	if (levelSelectScrollPos != 0) {
		titleImage.push("            [ PREV ]              ");
	} else {
		titleImage.push("                                  ");
	}

	var unlockedUntil = -1;
	if(state.metadata["level_select_lock"] !== undefined) {
		// find last solved section:
		var unsolvedSections = 0;
		for(var i = 0; i < state.sections.length; i++) {
			if(solvedSections.indexOf(state.sections[i].name) >= 0) {
				unlockedUntil = i;
			} else {
				unsolvedSections++;
			}
		}

		if(state.metadata.level_select_unlocked_ahead === undefined) {
			unlockedUntil += 1;
		} else {
			unlockedUntil += Number(state.metadata.level_select_unlocked_ahead);
		}	
	}
	//console.log(unlockedUntil);

	for(var i = levelSelectScrollPos; i < levelSelectScrollPos + amountOfLevelsOnScreen; i++) {
		if(i < 0 || i >= state.sections.length) {
			break;
		}

		var section = state.sections[i];
		var solved = (solvedSections.indexOf(section.name) >= 0);
		var selected = (i == titleSelection);
		var locked = (unlockedUntil >= 0 && i > unlockedUntil);

		var name = section.name.substring(0, 24);
		
		if(locked) {
			if(selected && titleSelected) {
				titleSelected = false;
				quittingTitleScreen = false;
			}

			var l = name.length;
			name = "";
			for(var j = 0; j < l; j++) {
				name += "*";
			}
		}
		
		var solved_symbol = "✓";
		if(state.metadata.level_select_solve_symbol !== undefined) {
			solved_symbol = state.metadata.level_select_solve_symbol;
		}
		var line = (solved ? solved_symbol : " ") + " ";
		
		line += (selected ? "#" : " ") + " " + name;
		for(var j = name.length; j < 25; j++) {
			if(selected && titleSelected && j != name.length) {
				line += "#";
			} else {
				line += " ";
			}
		}
		line += (selected ? "#" : " ") + "  ";

		titleImage.push(line);
	}

	if (levelSelectScrollPos != titleSelectOptions - amountOfLevelsOnScreen && titleSelectOptions - amountOfLevelsOnScreen > 0) {
		titleImage.push("            [ NEXT ]              ")
	} else {
		titleImage.push("                                  ");
	}

	for(var i = titleImage.length; i < 13; i++) {
		titleImage.push("                                  ");
	}
}

function gotoLevel(sectionIndex) {
  if (solving) {
    return;
  }

  if (sectionIndex < 0) {return;} //Invalid index

  console.log(sectionIndex);

	againing = false;
	messagetext = "";

	curlevel = state.sections[sectionIndex].firstLevel;

	loadLevelFromStateOrTarget();

	updateLocalStorage();
	resetFlickDat();
	canvasResize();	
	clearInputHistory();
}

var introstate = {
  title: "EMPTY GAME",
  attribution: "increpare",
    objectCount: 2,
    metadata:[],
    levels:[],
    bgcolor:"#000000",
    fgcolor:"#FFFFFF"
};

var state = introstate;

function deepClone(item) {
    if (!item) { return item; } // null, undefined values check

    var types = [ Number, String, Boolean ], 
        result;

    // normalizing primitives if someone did new String('aaa'), or new Number('444');
    types.forEach(function(type) {
        if (item instanceof type) {
            result = type( item );
        }
    });

    if (typeof result == "undefined") {
        if (Object.prototype.toString.call( item ) === "[object Array]") {
            result = [];
            item.forEach(function(child, index, array) { 
                result[index] = deepClone( child );
            });
        } else if (typeof item == "object") {
            // testing that this is DOM
            if (item.nodeType && typeof item.cloneNode == "function") {
                var result = item.cloneNode( true );    
            } else if (!item.prototype) { // check that this is a literal
                if (item instanceof Date) {
                    result = new Date(item);
                } else {
                    // it is an object literal
                    result = {};
                    for (var i in item) {
                        result[i] = deepClone( item[i] );
                    }
                }
            } else {
                // depending what you would like here,
                // just keep the reference, or create new object
/*                if (false && item.constructor) {
                    // would not advice to do that, reason? Read below
                    result = new item.constructor();
                } else */{
                    result = item;
                }
            }
        } else {
            result = item;
        }
    }

    return result;
}

function wordwrap( str, width ) {
 
    width = width || 75;
    var cut = true;
 
    if (!str) { return str; }
 
    var regex = '.{1,' +width+ '}(\\s|$)' + (cut ? '|.{' +width+ '}|.+$' : '|\\S+?(\\s|$)');
 
    return str.match( RegExp(regex, 'g') );
 
}

var splitMessage=[];

function drawMessageScreen() {
	tryLoadCustomFont();

	titleMode=0;
	textMode=true;
	if ("mouse_left" in state.metadata || "mouse_drag" in state.metadata || "mouse_up" in state.metadata)
		titleImage = deepClone(messagecontainer_template_mouse);
	else
		titleImage = deepClone(messagecontainer_template);

	for (var i=0;i<titleImage.length;i++)
	{
		titleImage[i]=titleImage[i].replace(/\./g, ' ');
	}

	var emptyLineStr = titleImage[9];
	var xToContinueStr = titleImage[10];

	titleImage[10]=emptyLineStr;

	var width = titleImage[0].length;

	var message;
	if (messagetext==="") {
		var leveldat = state.levels[curlevel];
		message = leveldat.message.trim();
	} else {
		message = messagetext;
	}
	
	splitMessage = wordwrap(message,titleImage[0].length);


	var offset = 5-((splitMessage.length/2)|0);
	if (offset<0){
		offset=0;
	}

	var count = Math.min(splitMessage.length,12);
	for (var i=0;i<count;i++) {
		var m = splitMessage[i];
		var row = offset+i;	
		var messageLength=m.length;
		var lmargin = ((width-messageLength)/2)|0;
		var rmargin = width-messageLength-lmargin;
		var rowtext = titleImage[row];
		titleImage[row]=rowtext.slice(0,lmargin)+m+rowtext.slice(lmargin+m.length);		
	}

	var endPos = 10;
	if (count>=10) {
		if (count<12){
			endPos = count + 1;
		} else {
			endPos = 12;
		}
        }
  if (quittingMessageScreen) {
    titleImage[endPos]=emptyLineStr;
  } else {
    titleImage[endPos]=xToContinueStr;
  }
  
  canvasResize();
}

var loadedLevelSeed=0;

function loadLevelFromLevelDat(state,leveldat,randomseed,clearinputhistory) {	
	if (randomseed==null) {
		randomseed = (Math.random() + Date.now()).toString();
	}
	loadedLevelSeed = randomseed;
	RandomGen = new RNG(loadedLevelSeed);
	forceRegenImages=true;
	ignoreNotJustPressedAction=true;
	titleScreen=false;
	titleMode=showContinueOptionOnTitleScreen()?1:0;
	titleSelection=showContinueOptionOnTitleScreen()?1:0;
  titleSelected=false;
  state.metadata = deepClone(state.default_metadata);
    againing=false;
    if (leveldat===undefined) {
    	consolePrint("Trying to access a level that doesn't exist.",true);
		goToTitleScreen();
    	return;
    }
    if (leveldat.message !== undefined) {
      // This "level" is actually a message.
      ignoreNotJustPressedAction=true;
      tryPlayShowMessageSound();
      drawMessageScreen();
      canvasResize();
      clearInputHistory();
    } else if (leveldat.target !== undefined) {
      // This "level" is actually a goto.
      //tryPlayGotoSound();
      setSectionSolved(state.levels[Number(curlevel)].section)
      gotoLevel(leveldat.target);
    } else {
      titleMode=0;
      textMode=false;
    level = leveldat.clone();
    RebuildLevelArrays();
        if (state!==undefined) {
	        if (state.metadata.flickscreen!==undefined){
	            oldflickscreendat=[
	            	0,
	            	0,
	            	Math.min(state.metadata.flickscreen[0],level.width),
	            	Math.min(state.metadata.flickscreen[1],level.height)
	            ];
	        } else if (state.metadata.zoomscreen!==undefined){
	            oldflickscreendat=[
	            	0,
	            	0,
	            	Math.min(state.metadata.zoomscreen[0],level.width),
	            	Math.min(state.metadata.zoomscreen[1],level.height)
	            ];
	        } else if (state.metadata.smoothscreen!==undefined){
	            oldflickscreendat=[
	            	0,
	            	0,
	            	Math.min(state.metadata.smoothscreen.screenSize.width,level.width),
	            	Math.min(state.metadata.smoothscreen.screenSize.height,level.height)
	            ];
	        }
        }

      initSmoothCamera();
      twiddleMetadataExtras();

	    backups=[]
	    restartTarget=backupLevel();
		keybuffer=[];

	    if ('run_rules_on_level_start' in state.metadata) {
			runrulesonlevelstart_phase=true;
			processInput(-1,true);
			runrulesonlevelstart_phase=false;
	    }
	}

	if (clearinputhistory===true){
		clearInputHistory();
	}
}

function loadLevelFromStateTarget(state,levelindex,target,randomseed) { 
    var leveldat = target;    
  curlevel=levelindex;
  curlevelTarget=target;
    if (leveldat.message===undefined) {
      if (levelindex=== 0){ 
      tryPlayStartLevelSound();
    } else {
      tryPlayStartLevelSound();     
    }
    }
    loadLevelFromLevelDat(state,state.levels[levelindex],randomseed);
    restoreLevel(target, true);
    restartTarget=target;
}

function loadLevelFromState(state,levelindex,randomseed) {  
    var leveldat = state.levels[levelindex];    
  curlevel=levelindex;
  curlevelTarget=null;
    if (leveldat!==undefined && leveldat.message===undefined) {
      if (levelindex=== 0){ 
      tryPlayStartLevelSound();
    } else {
      tryPlayStartLevelSound();     
    }
    }
    loadLevelFromLevelDat(state,leveldat,randomseed);
}

var sprites = [
{
    color: '#423563',
    dat: [
        [1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 1, 1, 1, 1]
    ]
},
{
    color: '#252342',
    dat: [
        [0, 0, 1, 0, 0],
        [1, 1, 1, 1, 1],
        [0, 0, 1, 0, 0],
        [0, 1, 1, 1, 0],
        [0, 1, 0, 1, 0]
    ]
}
];

loadedCustomFont = false;

function tryLoadCustomFont() {
	if(state == null || state.metadata == null || state.metadata.custom_font == undefined || loadedCustomFont) {
		return;
	}

	var custom_font = new FontFace('PuzzleCustomFont', 'url('+state.metadata.custom_font+')');
	custom_font.load().then(function(loaded_face) {
		document.fonts.add(loaded_face);
		loadedCustomFont = true;
		canvasResize();
		redraw();
	}).catch(function(error) {alert("Unable to load font!");});
}

tryLoadCustomFont();

generateTitleScreen();
if (titleMode>0){
	titleSelection=0;
}

canvasResize();

function tryPlaySimpleSound(soundname) {
  if (state.sfx_Events[soundname]!==undefined) {
    var seed = state.sfx_Events[soundname];
    playSound(seed);
  }
}
function tryPlayTitleSound() {
  tryPlaySimpleSound("titlescreen");
}

function tryPlayStartGameSound() {
  tryPlaySimpleSound("startgame");
}

function tryPlayEndGameSound() {
  tryPlaySimpleSound("endgame");
}

function tryPlayCancelSound() {
  tryPlaySimpleSound("cancel");
}

function tryPlayStartLevelSound() {
  tryPlaySimpleSound("startlevel");
}

function tryPlayEndLevelSound() {
  tryPlaySimpleSound("endlevel");
}

function tryPlayUndoSound(){
  tryPlaySimpleSound("undo");
}

function tryPlayRestartSound(){
  tryPlaySimpleSound("restart");
}

function tryPlayShowMessageSound(){
  tryPlaySimpleSound("showmessage");
}

function tryPlayCloseMessageSound(){
  tryPlaySimpleSound("closemessage");
}

var backups=[];
var restartTarget;

function backupLevel() {
	var ret = {
		dat : new Int32Array(level.objects),
		width : level.width,
		height : level.height,
		oldflickscreendat: oldflickscreendat.concat([]),
    cameraPositionTarget: Object.assign({}, cameraPositionTarget)
	};
	if (state.metadata.runtime_metadata_twiddling !== undefined) {
      var metadata = deepClone(state.metadata)
      delete metadata.custom_font;
      ret.metadata = metadata;
    }
	return ret;
}

function level4Serialization() {
	var ret = {
		dat : Array.from(level.objects),
		width : level.width,
		height : level.height,
		oldflickscreendat: oldflickscreendat.concat([]),
    cameraPositionTarget: Object.assign({}, cameraPositionTarget)
	};
	return ret;
}


function tryDeactivateYoutube(){
  var youtubeFrame = document.getElementById("youtubeFrame");
  if (youtubeFrame){
    document.body.removeChild(youtubeFrame);
  }
}

function tryActivateYoutube(){
  var youtubeFrame = document.getElementById("youtubeFrame");
  if (youtubeFrame){
    return;
  }
  if (canYoutube) {
    if ('youtube' in state.metadata) {
      var youtubeid=state.metadata['youtube'];
      var url = "https://www.youtube.com/embed/"+youtubeid+"?autoplay=1&loop=1&playlist="+youtubeid;
      ifrm = document.createElement("IFRAME");
      ifrm.setAttribute("src",url);
      ifrm.setAttribute("id","youtubeFrame");
      ifrm.style.visibility="hidden";
      ifrm.style.width="500px";
      ifrm.style.height="500px";
      ifrm.style.position="absolute";
      ifrm.style.top="-1000px";
      ifrm.style.left="-1000px";
      document.body.appendChild(ifrm);
    }
  }
}

function setGameState(_state, command, randomseed) {
  oldflickscreendat=[];
  timer=0;
  autotick=0;
  winning=false;
  againing=false;
    messageselected=false;
    STRIDE_MOV=_state.STRIDE_MOV;
    STRIDE_OBJ=_state.STRIDE_OBJ;
    
    sfxCreateMask=new BitVec(STRIDE_OBJ);
    sfxDestroyMask=new BitVec(STRIDE_OBJ);

  if (command===undefined) {
    command=["restart"];
  }
  if ((state.levels.length===0 || _state.levels.length===0) && command.length>0 && command[0]==="rebuild")  {
    command=["restart"];
  }
  if (randomseed===undefined) {
    randomseed=null;
  }
  RandomGen = new RNG(randomseed);

  state = _state;

    if (command[0]!=="rebuild"){
      backups=[];
    }
    //set sprites
    sprites = [];
    for (var n in state.objects) {
        if (state.objects.hasOwnProperty(n)) {
            var object = state.objects[n];
            var sprite = {
                colors: object.colors,
                dat: object.spritematrix
            };
            sprites[object.id] = sprite;
        }
    }
    if (state.metadata.realtime_interval!==undefined) {
      autotick=0;
      autotickinterval=state.metadata.realtime_interval*1000;
    } else {
      autotick=0;
      autotickinterval=0;
    }

    if (state.metadata.key_repeat_interval!==undefined) {
    repeatinterval=state.metadata.key_repeat_interval*1000;
    } else {
      repeatinterval=150;
    }

    if (state.metadata.again_interval!==undefined) {
    againinterval=state.metadata.again_interval*1000;
    } else {
      againinterval=150;
    }
    if (throttle_movement && autotickinterval===0) {
      logWarning("throttle_movement is designed for use in conjunction with realtime_interval. Using it in other situations makes games gross and unresponsive, broadly speaking.  Please don't.");
    }
    norepeat_action = state.metadata.norepeat_action!==undefined;
    
    switch(command[0]){
    	case "restart":
    	{
    		if (restarting==true){
    			logWarning('A "restart" command is being triggered in the "run_rules_on_level_start" section of level creation, which would cause an infinite loop if it was actually triggered, but it\'s being ignored, so it\'s not.');
    			break;
    		}
		    winning=false;
		    timer=0;
		    titleScreen=true;
		    tryPlayTitleSound();
		    textMode=true;
		    titleSelection=0;
		    titleSelected=false;
		    quittingMessageScreen=false;
		    quittingTitleScreen=false;
		    messageselected=false;
		    titleMode = 0;
		    if (showContinueOptionOnTitleScreen()) {
		    	titleMode=1;
		    }

			if (state.metadata.skip_title_screen!==undefined) {
				consolePrint("skip_title_screen enabled, proceeding to do exactly as it says on the tin.")
				if(state.metadata["continue_is_level_select"] !== undefined) {
					gotoLevelSelectScreen();
				}
				else if(titleMode <= 1) {
					nextLevel();
				} else if(titleMode == 2) {
					gotoLevel(titleSelection);
				}
			} else {
				generateTitleScreen();
			}

		    break;
		}
		case "rebuild":
		{
			//do nothing
			break;
		}
		case "loadFirstNonMessageLevel":{
			for (var i=0;i<state.levels.length;i++){
				if (state.levels[i].hasOwnProperty("message")){
					continue;
				}
				var targetLevel = i;
				curlevel=targetLevel;
				curlevelTarget=null;
			    winning=false;
			    timer=0;
			    titleScreen=false;
			    textMode=false;
			    //titleSelection=showContinueOptionOnTitleScreen()?1:0;
			    titleSelected=false;
			    quittingMessageScreen=false;
			    quittingTitleScreen=false;
			    messageselected=false;
			    titleMode = 0;
				loadLevelFromState(state,targetLevel,randomseed);
				break;
			}
			break;	
		}
		case "loadLevel":
		{
			var targetLevel = command[1];
			curlevel=targetLevel;
			curlevelTarget=null;
		    winning=false;
		    timer=0;
		    titleScreen=false;
		    textMode=false;
		    //titleSelection=showContinueOptionOnTitleScreen()?1:0;
		    titleSelected=false;
		    quittingMessageScreen=false;
		    quittingTitleScreen=false;
		    messageselected=false;
		    titleMode = 0;
			loadLevelFromState(state,targetLevel,randomseed);
			break;
		}
		case "levelline":
		{
			var targetLine = command[1];
			for (var i=state.levels.length-1;i>=0;i--) {
				var level= state.levels[i];
				if(level.lineNumber<=targetLine+1) {
					curlevel=i;
					curlevelTarget=null;
				    winning=false;
				    timer=0;
				    titleScreen=false;
				    textMode=false;
				    //titleSelection=showContinueOptionOnTitleScreen()?1:0;
				    titleSelected=false;
				    quittingMessageScreen=false;
				    quittingTitleScreen=false;
				    messageselected=false;
				    titleMode = 0;
					loadLevelFromState(state,i);
					break;
				}
			}
			break;
		}
	}

	if(command[0] !== "rebuild") {
		clearInputHistory();
	}
	canvasResize();

	if (state.sounds.length==0&&state.metadata.youtube==null){
		killAudioButton();
	} else {
		showAudioButton();
	}
}

function RebuildLevelArrays() {
  level.movements = new Int32Array(level.n_tiles * STRIDE_MOV);

    level.rigidMovementAppliedMask = [];
    level.rigidGroupIndexMask = [];
	level.rowCellContents = [];
	level.rowCellContents_Movements = [];
	level.colCellContents = [];
	level.colCellContents_Movements = [];
	level.mapCellContents = new BitVec(STRIDE_OBJ);
	level.mapCellContents_Movements = new BitVec(STRIDE_MOV);

	_movementVecs = [new BitVec(STRIDE_MOV),new BitVec(STRIDE_MOV),new BitVec(STRIDE_MOV)];

	_o1 = new BitVec(STRIDE_OBJ);
	_o2 = new BitVec(STRIDE_OBJ);
	_o2_5 = new BitVec(STRIDE_OBJ);
	_o3 = new BitVec(STRIDE_OBJ);
	_o4 = new BitVec(STRIDE_OBJ);
	_o5 = new BitVec(STRIDE_OBJ);
	_o6 = new BitVec(STRIDE_OBJ);
	_o7 = new BitVec(STRIDE_OBJ);
	_o8 = new BitVec(STRIDE_OBJ);
	_o9 = new BitVec(STRIDE_OBJ);
	_o10 = new BitVec(STRIDE_OBJ);
	_o11 = new BitVec(STRIDE_OBJ);
	_o12 = new BitVec(STRIDE_OBJ);
	_m1 = new BitVec(STRIDE_MOV);
	_m2 = new BitVec(STRIDE_MOV);
	_m3 = new BitVec(STRIDE_MOV);
	

    for (var i=0;i<level.height;i++) {
      level.rowCellContents[i]=new BitVec(STRIDE_OBJ);        
    }
    for (var i=0;i<level.width;i++) {
      level.colCellContents[i]=new BitVec(STRIDE_OBJ);        
    }

    for (var i=0;i<level.height;i++) {
    	level.rowCellContents_Movements[i]=new BitVec(STRIDE_MOV);	    	
    }
    for (var i=0;i<level.width;i++) {
    	level.colCellContents_Movements[i]=new BitVec(STRIDE_MOV);	    	
    }

    for (var i=0;i<level.n_tiles;i++)
    {
        level.rigidMovementAppliedMask[i]=new BitVec(STRIDE_MOV);
        level.rigidGroupIndexMask[i]=new BitVec(STRIDE_MOV);
    }
}

var messagetext="";
function restoreLevel(lev, snapCamera) {
	var diffing = lev.hasOwnProperty("diff");

	oldflickscreendat=lev.oldflickscreendat.concat([]);

	if (diffing){
		var index=0;
		while (index<lev.dat.length){
			var start_index = lev.dat[index];
			var copy_length = lev.dat[index+1];
			if (copy_length===0){
				break;//tail of buffer is all 0s
			}
			for (j=0;j<copy_length;j++){
				level.objects[start_index+j]=lev.dat[index+2+j];
			}
			index += 2 + copy_length;
		}
	} else {	
		level.objects = new Int32Array(lev.dat);
	}

	if (level.width !== lev.width || level.height !== lev.height) {
		level.width = lev.width;
		level.height = lev.height;
		level.n_tiles = lev.width * lev.height;
		RebuildLevelArrays();
		//regenerate all other stride-related stuff
	}
	else 
	{
	// layercount doesn't change

		for (var i=0;i<level.n_tiles;i++) {
			level.movements[i]=0;
			level.rigidMovementAppliedMask[i]=0;
			level.rigidGroupIndexMask[i]=0;
		}	

	    for (var i=0;i<level.height;i++) {
	    	var rcc = level.rowCellContents[i];
	    	rcc.setZero();
	    }
	    for (var i=0;i<level.width;i++) {
	    	var ccc = level.colCellContents[i];
	    	ccc.setZero();
	    }
	}

    if (lev.cameraPositionTarget) {
      cameraPositionTarget = Object.assign({}, lev.cameraPositionTarget);

      if (snapCamera) {
        cameraPosition = Object.assign({}, cameraPositionTarget)
      }
    }
    
    if (state.metadata.runtime_metadata_twiddling !== undefined) {
		if (lev.metadata === undefined) {
			lev.metadata = deepClone(state.default_metadata);
			consolePrint("RUNTIME METADATA TWIDDLING: Reloaded level state that did not have saved metadata. "+
			"Likely this state was recovered from a CHECKPOINT. Using the default metadata instead.", true);
		}
     state.metadata = deepClone(lev.metadata);
     twiddleMetadataExtras();
    }

    againing=false;
    level.commandQueue=[];
    level.commandQueueSourceRules=[];
}

var zoomscreen=false;
var flickscreen=false;
var smoothscreen=false;
var screenwidth=0;
var screenheight=0;

//compresses 'before' into diff
function consolidateDiff(before,after){
	if (before.width !== after.width || before.height!==after.height || before.dat.length!==after.dat.length){
		return before;
	}
	if (before.hasOwnProperty("diff")||after.hasOwnProperty("diff")){
		return before;
	}
	//only generate diffs if level size is bigger than this
	if (before.dat.length<1024){
		return before;
	}
	//diff structure: repeating ( start,length, [ data ] )
	var result = new Int32Array(128);
	var position=0;
	var chain=false;
	var chain_start_idx_in_diff=-1;
	var before_dat = before.dat;
	var after_dat = after.dat;
	for (var i=0;i<before_dat.length;i++){
		if (chain===false){
			if (before_dat[i]!==after_dat[i]){
				chain=true;
				chain_start_idx_in_diff = position;

				if (result.length<position+4){
					var doubled = new Int32Array(2*result.length);
					doubled.set(result);
					result = doubled;
				}

				result[position+0]=i;
				result[position+1]=1;
				result[position+2]=before_dat[i];
				position+=3;
			}
		} else {
			if (before_dat[i]!==after_dat[i]){
				
				if (position+1>=result.length){
					if (result.length<position+4){
						var doubled = new Int32Array(2*result.length);
						doubled.set(result);
						result = doubled;
					}	
				}
				result[chain_start_idx_in_diff+1]++;
				result[position]=before_dat[i];
				position++;
			} else {
				chain=false;
			}
		}
	}
	return {		
		diff : true,
		dat : result,
		width : before.width,
		height : before.height,
		oldflickscreendat: before.oldflickscreendat
	}
}

function addUndoState(state){
	backups.push(state);
	if(backups.length>2 && !backups[backups.length-1].hasOwnProperty("diff")){
		backups[backups.length-3]=consolidateDiff(backups[backups.length-3],backups[backups.length-2]);
	}
}

function DoRestart(force) {
	if (restarting===true){
		return;
	}
	if (force!==true && ('norestart' in state.metadata)) {
		return;
	}
	restarting=true;
	if (force!==true) {
		addUndoState(backupLevel());
	}

	if (verbose_logging) {
		consolePrint("--- restarting ---",true);
	}

	restoreLevel(restartTarget, true);
	tryPlayRestartSound();

	if ('run_rules_on_level_start' in state.metadata) {
    	processInput(-1,true);
  }
  
  twiddleMetadataExtras();
	
	level.commandQueue=[];
	level.commandQueueSourceRules=[];
	restarting=false;
}

function backupDiffers(){
	if (backups.length==0){
		return true;
	}
	var bak = backups[backups.length-1];

	if (bak.hasOwnProperty("diff")){
		return bak.dat.length!==0 && bak.dat[1]!==0;//if it's empty or if it's all 0s
	} else {
		for (var i=0;i<level.objects.length;i++) {
			if (level.objects[i]!==bak.dat[i]) {
				return true;
			}
		}
		return false;
	}
}

function DoUndo(force,ignoreDuplicates) {
  if ((!levelEditorOpened)&&('noundo' in state.metadata && force!==true)) {
    return;
  }
  if (verbose_logging) {
    consolePrint("--- undoing ---",true);
  }

  if (ignoreDuplicates){
    while (backupDiffers()==false){
      backups.pop();
    }
  }

  if (backups.length>0) {
    var torestore = backups[backups.length-1];
    restoreLevel(torestore);
    backups = backups.splice(0,backups.length-1);
    if (! force) {
      tryPlayUndoSound();
    }
  }
}

function getPlayerPositions() {
    var result=[];
    var playerMask = state.playerMask;
    for (i=0;i<level.n_tiles;i++) {
        level.getCellInto(i,_o11);
        if (playerMask.anyBitsInCommon(_o11)) {
            result.push(i);
        }
    }
    return result;
}

function getLayersOfMask(cellMask) {
    var layers=[];
    for (var i=0;i<state.objectCount;i++) {
        if (cellMask.get(i)) {
            var n = state.idDict[i];
            var o = state.objects[n];
            layers.push(o.layer)
        }
    }
    return layers;
}

function moveEntitiesAtIndex(positionIndex, entityMask, dirMask) {
    var cellMask = level.getCell(positionIndex);
    cellMask.iand(entityMask);
    var layers = getLayersOfMask(cellMask);

    var movementMask = level.getMovements(positionIndex);
    for (var i=0;i<layers.length;i++) {
      movementMask.ishiftor(dirMask, 5 * layers[i]);
    }
    level.setMovements(positionIndex, movementMask);

	var colIndex=(positionIndex/level.height)|0;
	var rowIndex=(positionIndex%level.height);
	level.colCellContents_Movements[colIndex].ior(movementMask);
	level.rowCellContents_Movements[rowIndex].ior(movementMask);
	level.mapCellContents_Movements.ior(movementMask);
}


function startMovement(dir) {
  var movedany=false;
    var playerPositions = getPlayerPositions();
    for (var i=0;i<playerPositions.length;i++) {
        var playerPosIndex = playerPositions[i];
        moveEntitiesAtIndex(playerPosIndex,state.playerMask,dir);
    }
    return playerPositions;
}

var dirMasksDelta = {
     1:[0,-1],//up
     2:[0,1],//'down'  : 
     4:[-1,0],//'left'  : 
     8:[1,0],//'right' : 
     15:[0,0],//'?' : 
     16:[0,0],//'action' : 
     3:[0,0]//'no'
};

var dirMaskName = {
     1:'up',
     2:'down'  ,
     4:'left'  , 
     8:'right',  
     15:'?' ,
     16:'action',
     3:'no'
};

var seedsToPlay_CanMove=[];
var seedsToPlay_CantMove=[];

function repositionEntitiesOnLayer(positionIndex,layer,dirMask) 
{
    var delta = dirMasksDelta[dirMask];

    var dx = delta[0];
    var dy = delta[1];
    var tx = ((positionIndex/level.height)|0);
    var ty = ((positionIndex%level.height));
    var maxx = level.width-1;
    var maxy = level.height-1;

    if ( (tx===0&&dx<0) || (tx===maxx&&dx>0) || (ty===0&&dy<0) || (ty===maxy&&dy>0)) {
      return false;
    }

    var targetIndex = (positionIndex+delta[1]+delta[0]*level.height);

    var layerMask = state.layerMasks[layer];
    var targetMask = level.getCellInto(targetIndex,_o7);
    var sourceMask = level.getCellInto(positionIndex,_o8);

    if (layerMask.anyBitsInCommon(targetMask) && (dirMask!=16)) {
        return false;
    }

  for (var i=0;i<state.sfx_MovementMasks.length;i++) {
    var o = state.sfx_MovementMasks[i];
    var objectMask = o.objectMask;
    if (objectMask.anyBitsInCommon(sourceMask)) {
      var movementMask = level.getMovements(positionIndex);
      var directionMask = o.directionMask;
      if (movementMask.anyBitsInCommon(directionMask) && seedsToPlay_CanMove.indexOf(o.seed)===-1) {
        seedsToPlay_CanMove.push(o.seed);
      }
    }
  }

    var movingEntities = sourceMask.clone();
    sourceMask.iclear(layerMask);
    movingEntities.iand(layerMask);
    targetMask.ior(movingEntities);

    level.setCell(positionIndex, sourceMask);
    level.setCell(targetIndex, targetMask);
	
    var colIndex=(targetIndex/level.height)|0;
	var rowIndex=(targetIndex%level.height);
	
    level.colCellContents[colIndex].ior(movingEntities);
    level.rowCellContents[rowIndex].ior(movingEntities);
    level.mapCellContents.ior(movingEntities);
	//corresponding movement stuff in setmovements
    return true;
}

function repositionEntitiesAtCell(positionIndex) {
    var movementMask = level.getMovements(positionIndex);
    if (movementMask.iszero())
        return false;

    var moved=false;
    for (var layer=0;layer<level.layerCount;layer++) {
        var layerMovement = movementMask.getshiftor(0x1f, 5*layer);
        if (layerMovement!==0) {
            var thismoved = repositionEntitiesOnLayer(positionIndex,layer,layerMovement);
            if (thismoved) {
                movementMask.ishiftclear(layerMovement, 5*layer);
                moved = true;
            }
        }
    }

    level.setMovements(positionIndex, movementMask);

    return moved;
}


function Level(lineNumber, width, height, layerCount, objects, section) {
	this.lineNumber = lineNumber;
	this.width = width;
	this.height = height;
	this.n_tiles = width * height;
	this.objects = objects;
	this.section = section;
	this.layerCount = layerCount;
	this.commandQueue = [];
	this.commandQueueSourceRules = [];
}

Level.prototype.delta_index = function(direction)
{
	const [dx, dy] = dirMasksDelta[direction]
	return dx*this.height + dy
}

Level.prototype.clone = function() {
	var clone = new Level(this.lineNumber, this.width, this.height, this.layerCount, null, this.section);
	clone.objects = new Int32Array(this.objects);
	return clone;
}

Level.prototype.getCell = function(index) {
  return new BitVec(this.objects.subarray(index * STRIDE_OBJ, index * STRIDE_OBJ + STRIDE_OBJ));
}

Level.prototype.getCellInto = function(index,targetarray) {
  for (var i=0;i<STRIDE_OBJ;i++) {
    targetarray.data[i]=this.objects[index*STRIDE_OBJ+i]; 
  }
  return targetarray;
}

Level.prototype.setCell = function(index, vec) {
  for (var i = 0; i < vec.data.length; ++i) {
    this.objects[index * STRIDE_OBJ + i] = vec.data[i];
  }
}

var _movementVecs;
var _movementVecIndex=0;
Level.prototype.getMovements = function(index) {
  var _movementsVec=_movementVecs[_movementVecIndex];
  _movementVecIndex=(_movementVecIndex+1)%_movementVecs.length;

  for (var i=0;i<STRIDE_MOV;i++) {
    _movementsVec.data[i]=this.movements[index*STRIDE_MOV+i]; 
  }
  return _movementsVec;
}

Level.prototype.getMovementsInto = function(index,targetarray) {
	var _movementsVec=targetarray;

	for (var i=0;i<STRIDE_MOV;i++) {
		_movementsVec.data[i]=this.movements[index*STRIDE_MOV+i];	
	}
	return _movementsVec;
}

Level.prototype.setMovements = function(index, vec) {
	for (var i = 0; i < vec.data.length; ++i) {
		this.movements[index * STRIDE_MOV + i] = vec.data[i];
	}

	var targetIndex = index*STRIDE_MOV + i;
		
	//corresponding object stuff in repositionEntitiesOnLayer
	var colIndex=(index/this.height)|0;
	var rowIndex=(index%this.height);
	level.colCellContents_Movements[colIndex].ior(vec);
	level.rowCellContents_Movements[rowIndex].ior(vec);
	level.mapCellContents_Movements.ior(vec);


}

var ellipsisPattern = ['ellipsis'];

function BitVec(init) {
  this.data = new Int32Array(init);
  return this;
}

BitVec.prototype.cloneInto = function(target) {
  for (var i=0;i<this.data.length;++i) {
    target.data[i]=this.data[i];
  }
  return target;
}
BitVec.prototype.clone = function() {
  return new BitVec(this.data);
}

BitVec.prototype.iand = function(other) {
  for (var i = 0; i < this.data.length; ++i) {
    this.data[i] &= other.data[i];
  }
}


BitVec.prototype.inot = function() {
	for (var i = 0; i < this.data.length; ++i) {
		this.data[i] = ~this.data[i];
	}
}

BitVec.prototype.ior = function(other) {
  for (var i = 0; i < this.data.length; ++i) {
    this.data[i] |= other.data[i];
  }
}

BitVec.prototype.iclear = function(other) {
  for (var i = 0; i < this.data.length; ++i) {
    this.data[i] &= ~other.data[i];
  }
}

BitVec.prototype.ibitset = function(ind) {
  this.data[ind>>5] |= 1 << (ind & 31);
}

BitVec.prototype.ibitclear = function(ind) {
  this.data[ind>>5] &= ~(1 << (ind & 31));
}

BitVec.prototype.get = function(ind) {
  return (this.data[ind>>5] & 1 << (ind & 31)) !== 0;
}

BitVec.prototype.getshiftor = function(mask, shift) {
  var toshift = shift & 31;
  var ret = this.data[shift>>5] >>> (toshift);
  if (toshift) {
    ret |= this.data[(shift>>5)+1] << (32 - toshift);
  }
  return ret & mask;
}

BitVec.prototype.ishiftor = function(mask, shift) {
  var toshift = shift&31;
  var low = mask << toshift;
  this.data[shift>>5] |= low;
  if (toshift) {
    var high = mask >> (32 - toshift);
    this.data[(shift>>5)+1] |= high;
  }
}

BitVec.prototype.ishiftclear = function(mask, shift) {
  var toshift = shift & 31;
  var low = mask << toshift;
  this.data[shift>>5] &= ~low;
  if (toshift){
    var high = mask >> (32 - (shift & 31));
    this.data[(shift>>5)+1] &= ~high;
  }
}

BitVec.prototype.equals = function(other) {
  if (this.data.length !== other.data.length)
    return false;
  for (var i = 0; i < this.data.length; ++i) {
    if (this.data[i] !== other.data[i])
      return false;
  }
  return true;
}

BitVec.prototype.setZero = function() {
  for (var i = 0; i < this.data.length; ++i) {
    this.data[i]=0;
  }
}

BitVec.prototype.iszero = function() {
  for (var i = 0; i < this.data.length; ++i) {
    if (this.data[i])
      return false;
  }
  return true;
}

BitVec.prototype.bitsSetInArray = function(arr) {
  for (var i = 0; i < this.data.length; ++i) {
    if ((this.data[i] & arr[i]) !== this.data[i]) {
      return false;
    }
  }
  return true;
}

BitVec.prototype.bitsClearInArray = function(arr) {
  for (var i = 0; i < this.data.length; ++i) {
    if (this.data[i] & arr[i]) {
      return false;
    }
  }
  return true;
}

BitVec.prototype.anyBitsInCommon = function(other) {
  return !this.bitsClearInArray(other.data);
}

function Rule(rule) {
	this.direction = rule[0]; 		/* direction rule scans in */
	this.patterns = rule[1];		/* lists of CellPatterns to match */
	this.hasReplacements = rule[2];
	this.lineNumber = rule[3];		/* rule source for debugging */
	this.isEllipsis = rule[4];		/* true if pattern has ellipsis */
	this.groupNumber = rule[5];		/* execution group number of rule */
	this.isRigid = rule[6];
	this.commands = rule[7];		/* cancel, restart, sfx, etc */
	this.isRandom = rule[8];
	this.cellRowMasks = rule[9];
  this.cellRowMasks_Movements = rule[10];
  this.isGlobal = rule[11];
	this.ruleMask = this.cellRowMasks.reduce( (acc, m) => { acc.ior(m); return acc }, new BitVec(STRIDE_OBJ) );

	/*I tried out doing a ruleMask_movements as well along the lines of the above,
	but it didn't help at all - I guess because almost every tick there are movements 
	somewhere on the board - move filtering works well at a row/col level, but is pretty 
	useless (or worse than useless) on a boardwide level*/

	this.cellRowMatches = [];
	for (var i=0;i<this.patterns.length;i++) {
		this.cellRowMatches.push(this.generateCellRowMatchesFunction(this.patterns[i],this.isEllipsis[i]));
	}
	/* TODO: eliminate isRigid, groupNumber, isRandom
	from this class by moving them up into a RuleGroup class */
}


Rule.prototype.generateCellRowMatchesFunction = function(cellRow,hasEllipsis)  {
	if (hasEllipsis==false) {
		var cr_l = cellRow.length;

		/*
		hard substitute in the first one - if I substitute in all of them, firefox chokes.
		*/
		var fn = "";
		var mul = STRIDE_OBJ === 1 ? '' : '*'+STRIDE_OBJ;	
		for (var i = 0; i < STRIDE_OBJ; ++i) {
			fn += 'var cellObjects' + i + ' = objects[i' + mul + (i ? '+'+i: '') + '];\n';
		}
		mul = STRIDE_MOV === 1 ? '' : '*'+STRIDE_MOV;
		for (var i = 0; i < STRIDE_MOV; ++i) {
			fn += 'var cellMovements' + i + ' = movements[i' + mul + (i ? '+'+i: '') + '];\n';
		}
		fn += "return "+cellRow[0].generateMatchString('0_');// cellRow[0].matches(i)";
		for (var cellIndex=1;cellIndex<cr_l;cellIndex++) {
			fn+="&&cellRow["+cellIndex+"].matches(i+"+cellIndex+"*d, objects, movements)";
		}
		fn+=";";

		if (fn in matchCache) {
			return matchCache[fn];
		}
		//console.log(fn.replace(/\s+/g, ' '));
		return matchCache[fn] = new Function("cellRow","i", 'd', 'objects', 'movements',fn);
	} else {
		var cr_l = cellRow.length;

		var fn = "var result = [];\n"
		fn += "if(cellRow[0].matches(i, objects, movements)";
		var cellIndex=1;
		for (;cellRow[cellIndex]!==ellipsisPattern;cellIndex++) {
			fn+="&&cellRow["+cellIndex+"].matches(i+"+cellIndex+"*d, objects, movements)";
		}
		cellIndex++;
		fn+=") {\n";
		fn+="\tfor (var k=kmin;k<kmax;k++) {\n"
		fn+="\t\tif(cellRow["+cellIndex+"].matches((i+d*(k+"+(cellIndex-1)+")), objects, movements)";
		cellIndex++;
		for (;cellIndex<cr_l;cellIndex++) {
			fn+="&&cellRow["+cellIndex+"].matches((i+d*(k+"+(cellIndex-1)+")), objects, movements)";			
		}
		fn+="){\n";
		fn+="\t\t\tresult.push([i,k]);\n";
		fn+="\t\t}\n"
		fn+="\t}\n";				
		fn+="}\n";		
		fn+="return result;"


		if (fn in matchCache) {
			return matchCache[fn];
		}
		//console.log(fn.replace(/\s+/g, ' '));
		return matchCache[fn] = new Function("cellRow","i","kmax","kmin", 'd', "objects", "movements",fn);
	}
//say cellRow has length 3, with a split in the middle
/*
function cellRowMatchesWildcardFunctionGenerate(direction,cellRow,i, maxk, mink) {
  var result = [];
  var matchfirsthalf = cellRow[0].matches(i);
  if (matchfirsthalf) {
    for (var k=mink;k<maxk;k++) {
      if (cellRow[2].matches((i+d*(k+0)))) {
        result.push([i,k]);
      }
    }
  }
  return result;
}
*/
  

}


Rule.prototype.toJSON = function() {
	/* match construction order for easy deserialization */
	return [
		this.direction, this.patterns, this.hasReplacements, this.lineNumber, this.isEllipsis,
		this.groupNumber, this.isRigid, this.commands, this.isRandom, this.cellRowMasks,
		this.cellRowMasks_Movements
	];
};

var STRIDE_OBJ = 1;
var STRIDE_MOV = 1;

function CellPattern(row) {
  this.objectsPresent = row[0];
  this.objectsMissing = row[1];
  this.anyObjectsPresent = row[2];
  this.movementsPresent = row[3];
  this.movementsMissing = row[4];
  this.matches = this.generateMatchFunction();
  this.replacement = row[5];
};

function CellReplacement(row) {
  this.objectsClear = row[0];
  this.objectsSet = row[1];
  this.movementsClear = row[2];
  this.movementsSet = row[3];
  this.movementsLayerMask = row[4];
  this.randomEntityMask = row[5];
  this.randomDirMask = row[6];
};


var matchCache = {};



CellPattern.prototype.generateMatchString = function() {
  var fn = "(true";
  for (var i = 0; i < Math.max(STRIDE_OBJ, STRIDE_MOV); ++i) {
    var co = 'cellObjects' + i;
    var cm = 'cellMovements' + i;
    var op = this.objectsPresent.data[i];
    var om = this.objectsMissing.data[i];
    var mp = this.movementsPresent.data[i];
    var mm = this.movementsMissing.data[i];
    if (op) {
      if (op&(op-1))
        fn += '\t\t&& ((' + co + '&' + op + ')===' + op + ')\n';
      else
        fn += '\t\t&& (' + co + '&' + op + ')\n';
    }
    if (om)
      fn += '\t\t&& !(' + co + '&' + om + ')\n';
    if (mp) {
      if (mp&(mp-1))
        fn += '\t\t&& ((' + cm + '&' + mp + ')===' + mp + ')\n';
      else
        fn += '\t\t&& (' + cm + '&' + mp + ')\n';
    }
    if (mm)
      fn += '\t\t&& !(' + cm + '&' + mm + ')\n';
  }
  for (var j = 0; j < this.anyObjectsPresent.length; j++) {
    fn += "\t\t&& (0";
    for (var i = 0; i < STRIDE_OBJ; ++i) {
      var aop = this.anyObjectsPresent[j].data[i];
      if (aop)
        fn += "|(cellObjects" + i + "&" + aop + ")";
    }
    fn += ")";
  }
  fn += '\t)';
  return fn;
}

CellPattern.prototype.generateMatchFunction = function() {
	var i;
	var fn = '';
	var mul = STRIDE_OBJ === 1 ? '' : '*'+STRIDE_OBJ;	
	for (var i = 0; i < STRIDE_OBJ; ++i) {
		fn += '\tvar cellObjects' + i + ' = objects[i' + mul + (i ? '+'+i: '') + '];\n';
	}
	mul = STRIDE_MOV === 1 ? '' : '*'+STRIDE_MOV;
	for (var i = 0; i < STRIDE_MOV; ++i) {
		fn += '\tvar cellMovements' + i + ' = movements[i' + mul + (i ? '+'+i: '') + '];\n';
	}
	fn += "return " + this.generateMatchString()+';';
	if (fn in matchCache) {
		return matchCache[fn];
	}
	//console.log(fn.replace(/\s+/g, ' '));
	return matchCache[fn] = new Function("i", "objects", "movements", fn);
}

CellPattern.prototype.toJSON = function() {
  return [
    this.movementMask, this.cellMask, this.nonExistenceMask,
    this.moveNonExistenceMask, this.moveStationaryMask, this.randomDirOrEntityMask,
    this.movementsToRemove
  ];
};

var _o1,_o2,_o2_5,_o3,_o4,_o5,_o6,_o7,_o8,_o9,_o10,_o11,_o12;
var _m1,_m2,_m3;

CellPattern.prototype.replace = function(rule, currentIndex) {
  var replace = this.replacement;

  if (replace === null) {
    return false;
  }

  var replace_RandomEntityMask = replace.randomEntityMask;
  var replace_RandomDirMask = replace.randomDirMask;

  var objectsSet = replace.objectsSet.cloneInto(_o1);
  var objectsClear = replace.objectsClear.cloneInto(_o2);

  var movementsSet = replace.movementsSet.cloneInto(_m1);
  var movementsClear = replace.movementsClear.cloneInto(_m2);
  movementsClear.ior(replace.movementsLayerMask);

  if (!replace_RandomEntityMask.iszero()) {
    var choices=[];
    for (var i=0;i<32*STRIDE_OBJ;i++) {
      if (replace_RandomEntityMask.get(i)) {
        choices.push(i);
      }
    }
    var rand = choices[Math.floor(RandomGen.uniform() * choices.length)];
    var n = state.idDict[rand];
    var o = state.objects[n];
    objectsSet.ibitset(rand);
    objectsClear.ior(state.layerMasks[o.layer]);
    movementsClear.ishiftor(0x1f, 5 * o.layer);
  }
  if (!replace_RandomDirMask.iszero()) {
    for (var layerIndex=0;layerIndex<level.layerCount;layerIndex++){
      if (replace_RandomDirMask.get(5*layerIndex)) {
        var randomDir = Math.floor(RandomGen.uniform()*4);
        movementsSet.ibitset(randomDir + 5 * layerIndex);
      }
    }
  }
  
  var curCellMask = level.getCellInto(currentIndex,_o2_5);
  var curMovementMask = level.getMovements(currentIndex);

  var oldCellMask = curCellMask.cloneInto(_o3);
  var oldMovementMask = curMovementMask.cloneInto(_m3);

  curCellMask.iclear(objectsClear);
  curCellMask.ior(objectsSet);

  curMovementMask.iclear(movementsClear);
  curMovementMask.ior(movementsSet);

  var rigidchange=false;
  var curRigidGroupIndexMask =0;
  var curRigidMovementAppliedMask =0;
  if (rule.isRigid) {
    var rigidGroupIndex = state.groupNumber_to_RigidGroupIndex[rule.groupNumber];
    rigidGroupIndex++;//don't forget to -- it when decoding :O
    var rigidMask = new BitVec(STRIDE_MOV);
    for (var layer = 0; layer < level.layerCount; layer++) {
      rigidMask.ishiftor(rigidGroupIndex, layer * 5);
    }
    rigidMask.iand(replace.movementsLayerMask);
    curRigidGroupIndexMask = level.rigidGroupIndexMask[currentIndex] || new BitVec(STRIDE_MOV);
    curRigidMovementAppliedMask = level.rigidMovementAppliedMask[currentIndex] || new BitVec(STRIDE_MOV);

    if (!rigidMask.bitsSetInArray(curRigidGroupIndexMask.data) &&
      !replace.movementsLayerMask.bitsSetInArray(curRigidMovementAppliedMask.data) ) {
      curRigidGroupIndexMask.ior(rigidMask);
      curRigidMovementAppliedMask.ior(replace.movementsLayerMask);
      rigidchange=true;

    }
  }

  var result = false;

  //check if it's changed
  if (!oldCellMask.equals(curCellMask) || !oldMovementMask.equals(curMovementMask) || rigidchange) { 
    result=true;
    if (rigidchange) {
      level.rigidGroupIndexMask[currentIndex] = curRigidGroupIndexMask;
      level.rigidMovementAppliedMask[currentIndex] = curRigidMovementAppliedMask;
    }

		var created = curCellMask.cloneInto(_o4);
		created.iclear(oldCellMask);
		sfxCreateMask.ior(created);
		var destroyed = oldCellMask.cloneInto(_o5);
		destroyed.iclear(curCellMask);
		sfxDestroyMask.ior(destroyed);

		level.setCell(currentIndex, curCellMask);
		level.setMovements(currentIndex, curMovementMask);

		var colIndex=(currentIndex/level.height)|0;
		var rowIndex=(currentIndex%level.height);
		level.colCellContents[colIndex].ior(curCellMask);
		level.rowCellContents[rowIndex].ior(curCellMask);
		level.mapCellContents.ior(curCellMask);

		level.colCellContents_Movements[colIndex].ior(curMovementMask);
		level.rowCellContents_Movements[rowIndex].ior(curMovementMask);
		level.mapCellContents_Movements.ior(curMovementMask);

	}

  return result;
}


//say cellRow has length 5, with a split in the middle
/*
function cellRowMatchesWildcardFunctionGenerate(direction,cellRow,i, maxk, mink) {
  var result = [];
  var matchfirsthalf = cellRow[0].matches(i)&&cellRow[1].matches((i+d)%level.n_tiles);
  if (matchfirsthalf) {
    for (var k=mink,kmaxk;k++) {
      if (cellRow[2].matches((i+d*(k+0))%level.n_tiles)&&cellRow[2].matches((i+d*(k+1))%level.n_tiles)) {
        result.push([i,k]);
      }
    }
  }
  return result;
}
*/
/*
function DoesCellRowMatchWildCard(direction,cellRow,i,maxk,mink) {
  if (mink === undefined) {
    mink = 0;
  }

  var cellPattern = cellRow[0];

    //var result=[];

    if (cellPattern.matches(i)){
      var delta = dirMasksDelta[direction];
      var d0 = delta[0]*level.height;
    var d1 = delta[1];
        var targetIndex = i;

        for (var j=1;j<cellRow.length;j+=1) {
            targetIndex = (targetIndex+d1+d0);

            var cellPattern = cellRow[j]
            if (cellPattern === ellipsisPattern) {
              //BAM inner loop time
              for (var k=mink;k<maxk;k++) {
                var targetIndex2=targetIndex;
                    targetIndex2 = (targetIndex2+(d1+d0)*(k)+level.n_tiles)%level.n_tiles;
                for (var j2=j+1;j2<cellRow.length;j2++) {
                    cellPattern = cellRow[j2];
              if (!cellPattern.matches(targetIndex2)) {
                break;
              }
                        targetIndex2 = (targetIndex2+d1+d0);
                }

                if (j2>=cellRow.length) {
                  return true;
                    //result.push([i,k]);
                }
              }
              break;
            } else if (!cellPattern.matches(targetIndex)) {
        break;
            }
        }               
    }  
    return false;
}
*/
//say cellRow has length 3
/*
CellRow Matches can be specialized to look something like:
function cellRowMatchesFunctionGenerate(direction,cellRow,i) {
  var delta = dirMasksDelta[direction];
  var d = delta[1]+delta[0]*level.height;
  return cellRow[0].matches(i)&&cellRow[1].matches((i+d)%level.n_tiles)&&cellRow[2].matches((i+2*d)%level.n_tiles);
}
*/
/*
function DoesCellRowMatch(direction,cellRow,i,k) {
  var cellPattern = cellRow[0];
    if (cellPattern.matches(i)) {

      var delta = dirMasksDelta[direction];
      var d0 = delta[0]*level.height;
    var d1 = delta[1];
    var cr_l = cellRow.length;

        var targetIndex = i;
        for (var j=1;j<cr_l;j++) {
            targetIndex = (targetIndex+d1+d0);
            cellPattern = cellRow[j];
      if (cellPattern === ellipsisPattern) {
          //only for once off verifications
              targetIndex = (targetIndex+(d1+d0)*k);          
            }
        if (!cellPattern.matches(targetIndex)) {
                break;
            }
        }   
        
        if (j>=cellRow.length) {
            return true;
        }

    }  
    return false;
}
*/
function matchCellRow(direction, cellRowMatch, cellRow, cellRowMask,cellRowMask_Movements,d, isGlobal) {	
	var result=[];
	
	if ((!cellRowMask.bitsSetInArray(level.mapCellContents.data))||
	(!cellRowMask_Movements.bitsSetInArray(level.mapCellContents_Movements.data))) {
		return result;
	}

  if(isGlobal || state.metadata.local_radius === undefined){
    xmin=0;
    xmax=level.width;
    ymin=0;
    ymax=level.height;
  }
  else{
    var localradius = parseInt(state.metadata.local_radius);
    xmin=Math.max(0, (playerPositions[0]/level.height|0) - localradius);
    xmax=Math.min(level.width, (playerPositions[0]/level.height|0) + localradius +1);
    ymin=Math.max(0, playerPositions[0]%level.height - localradius);
    ymax=Math.min(level.height, playerPositions[0]%level.height + localradius+1);

  }

    var len=cellRow.length;

    switch(direction) {
      case 1://up
      {
        ymin+=(len-1);
        break;
      }
      case 2: //down 
      {
      ymax-=(len-1);
      break;
      }
      case 4: //left
      {
        xmin+=(len-1);
        break;
      }
      case 8: //right
    {
      xmax-=(len-1);  
      break;
    }
      default:
      {
        window.console.log("EEEP "+direction);
      }
    }

    var horizontal=direction>2;
    if (horizontal) {
		for (var y=ymin;y<ymax;y++) {
			if (!cellRowMask.bitsSetInArray(level.rowCellContents[y].data) 
			|| !cellRowMask_Movements.bitsSetInArray(level.rowCellContents_Movements[y].data)) {
				continue;
			}

			for (var x=xmin;x<xmax;x++) {
				var i = x*level.height+y;
				if (cellRowMatch(cellRow,i,d, level.objects, level.movements))
				{
					result.push(i);
				}
			}
		}
	} else {
		for (var x=xmin;x<xmax;x++) {
			if (!cellRowMask.bitsSetInArray(level.colCellContents[x].data)
			|| !cellRowMask_Movements.bitsSetInArray(level.colCellContents_Movements[x].data)) {
				continue;
			}

			for (var y=ymin;y<ymax;y++) {
				var i = x*level.height+y;
				if (cellRowMatch(	cellRow,i, d, level.objects, level.movements))
				{
					result.push(i);
				}
			}
		}		
	}

  return result;
}


function matchCellRowWildCard(direction, cellRowMatch, cellRow,cellRowMask,cellRowMask_Movements,d) {
	var result=[];
	if ((!cellRowMask.bitsSetInArray(level.mapCellContents.data))
	|| (!cellRowMask_Movements.bitsSetInArray(level.mapCellContents_Movements.data))) {
		return result;
	}
	
	var xmin=0;
	var xmax=level.width;
	var ymin=0;
	var ymax=level.height;

  var len=cellRow.length-1;//remove one to deal with wildcard
    switch(direction) {
      case 1://up
      {
        ymin+=(len-1);
        break;
      }
      case 2: //down 
      {
      ymax-=(len-1);
      break;
      }
      case 4: //left
      {
        xmin+=(len-1);
        break;
      }
      case 8: //right
    {
      xmax-=(len-1);  
      break;
    }
      default:
      {
        window.console.log("EEEP2 "+direction);
      }
    }



    var horizontal=direction>2;
    if (horizontal) {
		for (var y=ymin;y<ymax;y++) {
			if (!cellRowMask.bitsSetInArray(level.rowCellContents[y].data)
			|| !cellRowMask_Movements.bitsSetInArray(level.rowCellContents_Movements[y].data) ) {
				continue;
			}

			for (var x=xmin;x<xmax;x++) {
				var i = x*level.height+y;
				var kmax;

				if (direction === 4) { //left
					kmax=x-len+2;
				} else if (direction === 8) { //right
					kmax=level.width-(x+len)+1;	
				} else {
					window.console.log("EEEP2 "+direction);					
				}

				result.push.apply(result, cellRowMatch(cellRow,i,kmax,0, d, level.objects, level.movements));
			}
		}
	} else {
		for (var x=xmin;x<xmax;x++) {
			if (!cellRowMask.bitsSetInArray(level.colCellContents[x].data)
			|| !cellRowMask_Movements.bitsSetInArray(level.colCellContents_Movements[x].data)) {
				continue;
			}

			for (var y=ymin;y<ymax;y++) {
				var i = x*level.height+y;
				var kmax;


        if (direction === 2) { // down
          kmax=level.height-(y+len)+1;
        } else if (direction === 1) { // up
          kmax=y-len+2;         
        } else {
          window.console.log("EEEP2 "+direction);
        }
        result.push.apply(result, cellRowMatch(cellRow,i,kmax,0, d, level.objects, level.movements));
      }
    }   
  }

  return result;
}

function generateTuples(lists) {
    var tuples=[[]];

    for (var i=0;i<lists.length;i++)
    {
        var row = lists[i];
        var newtuples=[];
        for (var j=0;j<row.length;j++) {
            var valtoappend = row[j];
            for (var k=0;k<tuples.length;k++) {
                var tuple=tuples[k];
                var newtuple = tuple.concat([valtoappend]);
                newtuples.push(newtuple);
            }
        }
        tuples=newtuples;
    }
    return tuples;
}


Rule.prototype.findMatches = function() {	
	if ( ! this.ruleMask.bitsSetInArray(level.mapCellContents.data) )
		return [];

	const d = level.delta_index(this.direction)

	var matches=[];
	var cellRowMasks=this.cellRowMasks;
	var cellRowMasks_Movements=this.cellRowMasks_Movements;
    for (var cellRowIndex=0;cellRowIndex<this.patterns.length;cellRowIndex++) {
        var cellRow = this.patterns[cellRowIndex];
        var matchFunction = this.cellRowMatches[cellRowIndex];
        if (this.isEllipsis[cellRowIndex]) {//if ellipsis     
        	var match = matchCellRowWildCard(this.direction,matchFunction,cellRow,cellRowMasks[cellRowIndex],cellRowMasks_Movements[cellRowIndex],d);  
        } else {
        	var match = matchCellRow(this.direction,matchFunction,cellRow,cellRowMasks[cellRowIndex],cellRowMasks_Movements[cellRowIndex],d, this.isGlobal);               	
        }
        if (match.length===0) {
            return [];
        } else {
            matches.push(match);
        }
    }
    return matches;
};

Rule.prototype.directional = function(){
  //Check if other rules in its rulegroup with the same line number.
  for (var i=0;i<state.rules.length;i++){
    var rg = state.rules[i];
    var copyCount=0;
    for (var j=0;j<rg.length;j++){
      if (this.lineNumber===rg[j].lineNumber){
        copyCount++;
      }
      if (copyCount>1){
        return true;
      }
    }
  }

    return false;
}

Rule.prototype.applyAt = function(level,tuple,check,delta) {
	var rule = this;
	//have to double check they apply 
	//(cf test ellipsis bug: rule matches two candidates, first replacement invalidates second)
	if (check)
	{
		for (var cellRowIndex=0; cellRowIndex<this.patterns.length; cellRowIndex++)
		{
			if (this.isEllipsis[cellRowIndex]) //if ellipsis
			{
				if ( this.cellRowMatches[cellRowIndex](this.patterns[cellRowIndex], tuple[cellRowIndex][0], tuple[cellRowIndex][1]+1, tuple[cellRowIndex][1], delta, level.objects, level.movements).length == 0 )
					return false
			}
			else if ( ! this.cellRowMatches[cellRowIndex](this.patterns[cellRowIndex], tuple[cellRowIndex], delta, level.objects, level.movements) )
				return false
		}
	}


    var result=false;
    
    //APPLY THE RULE
    for (var cellRowIndex=0;cellRowIndex<rule.patterns.length;cellRowIndex++) {
        var preRow = rule.patterns[cellRowIndex];
        
        var currentIndex = rule.isEllipsis[cellRowIndex] ? tuple[cellRowIndex][0] : tuple[cellRowIndex];
        for (var cellIndex=0;cellIndex<preRow.length;cellIndex++) {
            var preCell = preRow[cellIndex];

            if (preCell === ellipsisPattern) {
            	var k = tuple[cellRowIndex][1];
            	currentIndex += delta*k;
            	continue;
            }

            result = preCell.replace(rule, currentIndex) || result;

            currentIndex += delta;
        }
    }

  if (verbose_logging && result){
    var ruleDirection = dirMaskName[rule.direction];
    if (!rule.directional()){
      ruleDirection="";
    }

		var inspect_ID =  addToDebugTimeline(level,rule.lineNumber);
		var logString = `<font color="green">Rule <a onclick="jumpToLine(${rule.lineNumber});"  href="javascript:void(0);">${rule.lineNumber}</a> ${ruleDirection} applied.</font>`;
		consolePrint(logString,false,rule.lineNumber,inspect_ID);
		
	}

    return result;
};

Rule.prototype.tryApply = function(level) {
	const delta = level.delta_index(this.direction);

    //get all cellrow matches
    var matches = this.findMatches();
    if (matches.length===0) {
      return false;
    }

    var result=false;	
	if (this.hasReplacements) {
	    var tuples = generateTuples(matches);
	    for (var tupleIndex=0;tupleIndex<tuples.length;tupleIndex++) {
	        var tuple = tuples[tupleIndex];
	        var shouldCheck=tupleIndex>0;
	        var success = this.applyAt(level,tuple,shouldCheck,delta);
	        result = success || result;
	    }
	}

    if (matches.length>0) {
      this.queueCommands();
    }
    return result;
};

Rule.prototype.queueCommands = function() {
	var commands = this.commands;
	
	if (commands.length==0){
		return;
	}

	//commandQueue is an array of strings, message.commands is an array of array of strings (For messagetext parameter), so I search through them differently
	var preexisting_cancel=level.commandQueue.indexOf("cancel")>=0;
	var preexisting_restart=level.commandQueue.indexOf("restart")>=0;
	
	var currule_cancel = false;
	var currule_restart = false;
	for (var i=0;i<commands.length;i++){
		var cmd = commands[i][0];
		if (cmd==="cancel"){
			currule_cancel=true;
		} else if (cmd==="restart"){
			currule_restart=true;
		}
	}

	//priority cancel > restart > everything else
	//if cancel is the queue from other rules, ignore everything
	if (preexisting_cancel){
		return;
	}
	//if restart is in the queue from other rules, only apply if there's a cancel present here
	if (preexisting_restart && !currule_cancel){
		return;
	}

	//if you are writing a cancel or restart, clear the current queue
	if (currule_cancel || currule_restart){
		level.commandQueue=[];
        level.commandQueueSourceRules=[];
		messagetext="";
	}

	for(var i=0;i<commands.length;i++) {
		var command=commands[i];
		var already=false;
		if (level.commandQueue.indexOf(command[0])>=0) {
			continue;
		}
		level.commandQueue.push(command[0]);
		level.commandQueueSourceRules.push(this);

		if (verbose_logging){
			var lineNumber = this.lineNumber;
			var ruleDirection = dirMaskName[this.direction];
			var logString = '<font color="green">Rule <a onclick="jumpToLine(' + lineNumber.toString() + ');"  href="javascript:void(0);">' + lineNumber.toString() + '</a> triggers command '+command[0]+'.</font>';
			consolePrint(logString,false,lineNumber,null);
		}

    if (command[0]==='message') {     
      messagetext=command[1];
    }
	
    if (command[0]==='goto') {
      gotoLevel(command[1]);
    }

    if (state.metadata.runtime_metadata_twiddling !== undefined && twiddleable_params.includes(command[0])) {

      value = command[1];

      if (value == "wipe") {
        delete state.metadata[command[0]]; //value = undefined;
        value = null;
      } else if (value == "default") {
        value = deepClone(state.default_metadata[command[0]]);
      }

      if (value != null) {
        state.metadata[command[0]] = value;
      }
      
      if (command[0] === "zoomscreen" || command[0] === "flickscreen") {
        twiddleMetaData(state, true);
        canvasResize();
      }

      if (command[0] === "smoothscreen") {
        if (value !== undefined) {
          twiddleMetaData(state, true);
          initSmoothCamera()
        } else {
          smoothscreen = false;
        }
        canvasResize();
      }

      twiddleMetadataExtras()

      if (state.metadata.runtime_metadata_twiddling_debug !== undefined) {
        var log = "Metadata twiddled: Flag "+command[0] + " set to " + value;
        if (value != command[1]) {
          log += " ("+command[1]+")"
        }
        consolePrintFromRule(log,this,true);
      }
    }   
  }
};

function twiddleMetadataExtras() {
  if (state.metadata.realtime_interval!==undefined) {
    autotick=0;
    autotickinterval=state.metadata.realtime_interval*1000;
  } else {
    autotick=0;
    autotickinterval=0;
  }

  if (state.metadata.again_interval!==undefined) {
    againinterval=state.metadata.again_interval*1000;
  } else {
    againinterval=150;
  }

  if (state.metadata.key_repeat_interval!==undefined) {
    repeatinterval=state.metadata.key_repeat_interval*1000;
  } else {
    repeatinterval=150;
  }

  if ('background_color' in state.metadata) {
    state.bgcolor=colorToHex(colorPalette,state.metadata.background_color);
  } else {
    state.bgcolor="#000000";
  }

  if ('text_color' in state.metadata) {
    state.fgcolor=colorToHex(colorPalette,state.metadata.text_color);
  } else {
    state.fgcolor="#FFFFFF";
  }
}

function showTempMessage() {
	keybuffer=[];
	textMode=true;
	titleScreen=false;
	quittingMessageScreen=false;
	messageselected=false;
	ignoreNotJustPressedAction=true;
	tryPlayShowMessageSound();
	drawMessageScreen();
	canvasResize();
}

function processOutputCommands(commands) {
	for (var i=0;i<commands.length;i++) {
		var command = commands[i];
		if (command.charAt(1)==='f')  {//identifies sfxN
			tryPlaySimpleSound(command);
		}
		if (unitTesting===false) {
			if (command==='message') {
				showTempMessage();
			}
		}
	}
}

function applyRandomRuleGroup(level,ruleGroup) {
	var propagated=false;

	var matches=[];
	for (var ruleIndex=0;ruleIndex<ruleGroup.length;ruleIndex++) {
		var rule=ruleGroup[ruleIndex];
		var ruleMatches = rule.findMatches();
		if (ruleMatches.length>0) {
	    	var tuples  = generateTuples(ruleMatches);
	    	for (var j=0;j<tuples.length;j++) {
	    		var tuple=tuples[j];
				matches.push([ruleIndex,tuple]);
	    	}
		}		
	}

  if (matches.length===0)
  {
    return false;
  } 

	var match = matches[Math.floor(RandomGen.uniform()*matches.length)];
	var ruleIndex=match[0];
	var rule=ruleGroup[ruleIndex];
	var tuple=match[1];
	var check=false;
	const delta = level.delta_index(rule.direction)
	var modified = rule.applyAt(level,tuple,check,delta);

    rule.queueCommands();

  return modified;
}


function applyRuleGroup(ruleGroup) {
	if (ruleGroup[0].isRandom) {
		return applyRandomRuleGroup(level,ruleGroup);
	}

  var loopPropagated=false;
    var propagated=true;
    var loopcount=0;
	var nothing_happened_counter = -1;
    while(propagated) {
      loopcount++;
      if (loopcount>200) 
      {
        logErrorCacheable("Got caught looping lots in a rule group :O",ruleGroup[0].lineNumber,true);
        break;
      }
        propagated=false;

        for (var ruleIndex=0;ruleIndex<ruleGroup.length;ruleIndex++) {
            var rule = ruleGroup[ruleIndex];     
			if (rule.tryApply(level)){
				propagated=true;
				nothing_happened_counter=0;//why am I resetting to 1 rather than 0? because I've just verified that applications of the current rule are exhausted
			} else {
				nothing_happened_counter++;
			}
			if ( nothing_happened_counter === ruleGroup.length)
				break;
        }
        if (propagated) {
        	loopPropagated=true;
			
			if (verbose_logging){
				debugger_turnIndex++;
				addToDebugTimeline(level,-2);//pre-movement-applied debug state
			}
        }
    }

    return loopPropagated;
}

function applyRules(rules, loopPoint, startRuleGroupindex, bannedGroup){
    //for each rule
    //try to match it

    playerPositions = getPlayerPositions();

    //when we're going back in, let's loop, to be sure to be sure
    var loopPropagated = startRuleGroupindex>0;
    var loopCount = 0;
    for (var ruleGroupIndex=startRuleGroupindex;ruleGroupIndex<rules.length;) {
      if (bannedGroup && bannedGroup[ruleGroupIndex]) {
        //do nothing
      } else {
        var ruleGroup=rules[ruleGroupIndex];
      loopPropagated = applyRuleGroup(ruleGroup) || loopPropagated;
      }
        if (loopPropagated && loopPoint[ruleGroupIndex]!==undefined) {
        	ruleGroupIndex = loopPoint[ruleGroupIndex];
        	loopPropagated=false;
        	loopCount++;
			if (loopCount > 200) {
    			var ruleGroup=rules[ruleGroupIndex];
			   	logErrorCacheable("got caught in an endless startloop...endloop vortex, escaping!", ruleGroup[0].lineNumber,true);
			   	break;
			}
			
			if (verbose_logging){
				debugger_turnIndex++;
				addToDebugTimeline(level,-2);//pre-movement-applied debug state
			}
        } else {
        	ruleGroupIndex++;
        	if (ruleGroupIndex===rules.length) {
        		if (loopPropagated && loopPoint[ruleGroupIndex]!==undefined) {
		        	ruleGroupIndex = loopPoint[ruleGroupIndex];
		        	loopPropagated=false;
		        	loopCount++;
					if (loopCount > 200) {
		    			var ruleGroup=rules[ruleGroupIndex];
					   	logErrorCacheable("got caught in an endless startloop...endloop vortex, escaping!", ruleGroup[0].lineNumber,true);
					   	break;
					}
		        } 
        	}
			
			if (verbose_logging){
				debugger_turnIndex++;
				addToDebugTimeline(level,-2);//pre-movement-applied debug state
			}
        }
    }
}


//if this returns!=null, need to go back and reprocess
function resolveMovements(level, bannedGroup){
    var moved=true;
    while(moved){
        moved=false;
        for (var i=0;i<level.n_tiles;i++) {
          moved = repositionEntitiesAtCell(i) || moved;
        }
    }
    var doUndo=false;

	for (var i=0;i<level.n_tiles;i++) {
		var cellMask = level.getCellInto(i,_o6);
		var movementMask = level.getMovements(i);
		if (!movementMask.iszero()) {
			var rigidMovementAppliedMask = level.rigidMovementAppliedMask[i];
			if (rigidMovementAppliedMask !== 0) {
				movementMask.iand(rigidMovementAppliedMask);
				if (!movementMask.iszero()) {
					//find what layer was restricted
					for (var j=0;j<level.layerCount;j++) {
						var layerSection = movementMask.getshiftor(0x1f, 5*j);
						if (layerSection!==0) {
							//this is our layer!
							var rigidGroupIndexMask = level.rigidGroupIndexMask[i];
							var rigidGroupIndex = rigidGroupIndexMask.getshiftor(0x1f, 5*j);
							rigidGroupIndex--;//group indices start at zero, but are incremented for storing in the bitfield
							var groupIndex = state.rigidGroupIndex_to_GroupIndex[rigidGroupIndex];
							bannedGroup[groupIndex]=true;
							//backtrackTarget = rigidBackups[rigidGroupIndex];
							doUndo=true;
							break;
						}
					}
				}
			}
			for (var j=0;j<state.sfx_MovementFailureMasks.length;j++) {
				var o = state.sfx_MovementFailureMasks[j];
				var objectMask = o.objectMask;
				if (objectMask.anyBitsInCommon(cellMask)) {
					var directionMask = o.directionMask;
					if (movementMask.anyBitsInCommon(directionMask) && seedsToPlay_CantMove.indexOf(o.seed)===-1) {
						seedsToPlay_CantMove.push(o.seed);
					}
				}
			}
    	}

    	for (var j=0;j<STRIDE_MOV;j++) {
    		level.movements[j+i*STRIDE_MOV]=0;
    	}
	    level.rigidGroupIndexMask[i]=0;
	    level.rigidMovementAppliedMask[i]=0;
    }
    return doUndo;
}

var sfxCreateMask=null;
var sfxDestroyMask=null;

function calculateRowColMasks() {
	for(var i=0;i<level.mapCellContents.length;i++) {
		level.mapCellContents[i]=0;
		level.mapCellContents_Movements[i]=0;	
	}

	for (var i=0;i<level.width;i++) {
		var ccc = level.colCellContents[i];
		ccc.setZero();
		var ccc_Movements = level.colCellContents_Movements[i];
		ccc_Movements.setZero();
	}

	for (var i=0;i<level.height;i++) {
		var rcc = level.rowCellContents[i];
		rcc.setZero();
		var rcc_Movements = level.rowCellContents_Movements[i];
		rcc_Movements.setZero();
	}

	for (var i=0;i<level.width;i++) {
		for (var j=0;j<level.height;j++) {
			var index = j+i*level.height;
			var cellContents=level.getCellInto(index,_o9);
			level.mapCellContents.ior(cellContents);
			level.rowCellContents[j].ior(cellContents);
			level.colCellContents[i].ior(cellContents);

			
			var mapCellContents_Movements=level.getMovementsInto(index,_m1);
			level.mapCellContents_Movements.ior(mapCellContents_Movements);
			level.rowCellContents_Movements[j].ior(mapCellContents_Movements);
			level.colCellContents_Movements[i].ior(mapCellContents_Movements);
		}
	}
}

var playerPositions;
var playerPositionsAtTurnStart;

/* returns a bool indicating if anything changed */
function processInput(dir,dontDoWin,dontModify,bak) {
var startDir = dir;

	againing = false;

	if (bak==undefined) {
		bak = backupLevel();
	}
  
  playerPositions= [];
playerPositionsAtTurnStart = getPlayerPositions();

    if (dir<=5) {

      if (verbose_logging) { 
        debugger_turnIndex++;
        addToDebugTimeline(level,-2);//pre-movement-applied debug state
      }

    	if (dir>=0 && dir<=4) {
	        switch(dir){
	            case 0://up
	            {
	                dir=parseInt('00001', 2);;
	                break;
	            }
	            case 1://left
	            {
	                dir=parseInt('00100', 2);;
	                break;
	            }
	            case 2://down
	            {
	                dir=parseInt('00010', 2);;
	                break;
	            }
	            case 3://right
	            {
	                dir=parseInt('01000', 2);;
	                break;
	            }
	            case 4://action
	            {
	                dir=parseInt('10000', 2);;
	                break;
				      }
	        }
	        playerPositions = startMovement(dir);
		}
			
		
		if (verbose_logging) { 
			consolePrint('Applying rules');

			var inspect_ID = addToDebugTimeline(level,-1);
				
			 if (dir===-1) {
				 consolePrint(`Turn starts with no input.`,false,null,inspect_ID)
			 } else {
				//  consolePrint('=======================');
				consolePrint(`Turn starts with input of ${['up','left','down','right','action','mouse'][startDir]}.`,false,null,inspect_ID);
			 }
		}

		
        bannedGroup = [];
        level.commandQueue=[];
        level.commandQueueSourceRules=[];
        var startRuleGroupIndex=0;
        var rigidloop=false;
		const startState = {
			objects: new Int32Array(level.objects),
			movements: new Int32Array(level.movements),
			rigidGroupIndexMask: level.rigidGroupIndexMask.concat([]),
			rigidMovementAppliedMask: level.rigidMovementAppliedMask.concat([]),
			commandQueue: [],
			commandQueueSourceRules: []
		}
	    sfxCreateMask.setZero();
	    sfxDestroyMask.setZero();

    seedsToPlay_CanMove=[];
    seedsToPlay_CantMove=[];

    calculateRowColMasks();

        var i=0;
        do {
        //not particularly elegant, but it'll do for now - should copy the world state and check
        //after each iteration
        	rigidloop=false;
        	i++;
        	


        	applyRules(state.rules, state.loopPoint, startRuleGroupIndex, bannedGroup);
        	var shouldUndo = resolveMovements(level,bannedGroup);

        	if (shouldUndo) {
        		rigidloop=true;

				{
					// trackback
					consolePrint("Rigid movement application failed. Rolling back...")
					//don't need to concat or anythign here, once something is restored it won't be used again.
					level.objects = new Int32Array(startState.objects)
					level.movements = new Int32Array(startState.movements)
					level.rigidGroupIndexMask = startState.rigidGroupIndexMask.concat([])
					level.rigidMovementAppliedMask = startState.rigidMovementAppliedMask.concat([])
					// TODO: shouldn't we also save/restore the level data computed by level.calculateRowColMasks() ?
					level.commandQueue = startState.commandQueue.concat([])
					level.commandQueueSourceRules = startState.commandQueueSourceRules.concat([])
					sfxCreateMask.setZero()
					sfxDestroyMask.setZero()
					// TODO: should

				}

				if (verbose_logging && rigidloop && i>0){				
					consolePrint('Relooping through rules because of rigid.');
						
					debugger_turnIndex++;
					addToDebugTimeline(level,-2);//pre-movement-applied debug state
				}

        		startRuleGroupIndex=0;//rigidGroupUndoDat.ruleGroupIndex+1;
        	} else {
        		if (verbose_logging){

					var eof_idx = debug_visualisation_array[debugger_turnIndex].length+1;//just need some number greater than any rule group
					var inspect_ID = addToDebugTimeline(level,eof_idx);

					consolePrint(`Processed movements.`,false,null,inspect_ID);
					
					if (state.lateRules.length>0){
											
						debugger_turnIndex++;
						addToDebugTimeline(level,-2);//pre-movement-applied debug state
					
						consolePrint('Applying late rules');
					}
				}
        		applyRules(state.lateRules, state.lateLoopPoint, 0);
        		startRuleGroupIndex=0;
        	}
        } while (i < 250 && rigidloop);

        if (i>=250) {
          consolePrint("looped through 250 times, gave up. Too many loops!");
          
          applyRules(state.lateRules, state.lateLoopPoint, 0);
          startRuleGroupIndex=0;
          
          backups.push(bak);
          DoUndo(true,false);
          return false;
        }


        if (playerPositionsAtTurnStart.length>0 && state.metadata.require_player_movement!==undefined && dir >= 0) {
        	var somemoved=false;
        	for (var i=0;i<playerPositionsAtTurnStart.length;i++) {
        		var pos = playerPositionsAtTurnStart[i];
        		var val = level.getCell(pos);
        		if (state.playerMask.bitsClearInArray(val.data)) {
        			somemoved=true;
        			break;
        		}
        	}
        	if (somemoved===false) {
        		if (verbose_logging){
	    			consolePrint('require_player_movement set, but no player movement detected, so cancelling turn.');
	    			consoleCacheDump();
				}
        		addUndoState(bak);
        		DoUndo(true,false);
        		return false;
        	}
        	//play player cantmove sounds here
        }
		
		/// Taken from zarawesome, thank you :)
	    if (level.commandQueue.indexOf('undo')>=0) {
	    	if (verbose_logging) {
	    		consoleCacheDump();
	    		consolePrint('UNDO command executed, undoing turn.',true);
			}
			messagetext = "";
    		DoUndo(true,false);
    		return true;
		}



	    if (level.commandQueue.indexOf('cancel')>=0) {
	    	if (verbose_logging) { 
	    		consoleCacheDump();
	    		var r = level.commandQueueSourceRules[level.commandQueue.indexOf('cancel')];
	    		consolePrintFromRule('CANCEL command executed, cancelling turn.',r,true);
			}
			processOutputCommands(level.commandQueue);
    		addUndoState(bak);
    		DoUndo(true,false);
    		tryPlayCancelSound();
    		return false;
	    } 

	    if (level.commandQueue.indexOf('restart')>=0) {
	    	if (verbose_logging) { 
	    		var r = level.commandQueueSourceRules[level.commandQueue.indexOf('restart')];
	    		consolePrintFromRule('RESTART command executed, reverting to restart state.',r);
	    		consoleCacheDump();
			}
			processOutputCommands(level.commandQueue);
    		addUndoState(bak);
	    	DoRestart(true);
    		return true;
		}
		
		if (level.commandQueue.indexOf('quit')>=0) {
			if (verbose_logging) { 
				var r = level.commandQueueSourceRules[level.commandQueue.indexOf('restart')];
				consolePrintFromRule('QUIT command executed, exiting level.',r);
				consoleCacheDump();
			}
			if (state.metadata.level_select !== undefined) {
				gotoLevelSelectScreen();
			} else {
				goToTitleScreen();
			}
			messagetext = "";
			canvasResize();	
			return true;
		}

	    if (dontModify && level.commandQueue.indexOf('win')>=0) {
	    	return true;
		}
		
		var save_backup = true;
		if(!winning && level.commandQueue.indexOf('nosave')>=0) {
			if (verbose_logging) { 
				var r = level.commandQueueSourceRules[level.commandQueue.indexOf('nosave')];
				consolePrintFromRule('NOSAVE command executed, not storing current state to undo queue.',r);
			}
			save_backup = false;
		}
	    
        var modified=false;
	    for (var i=0;i<level.objects.length;i++) {
	    	if (level.objects[i]!==bak.dat[i]) {
				if (dontModify) {
	        		if (verbose_logging) {
	        			consoleCacheDump();
	        		}
	        		addUndoState(bak);
	        		DoUndo(true,false);
					return true;
				} else {
					if (dir!==-1 && save_backup) {
	    				addUndoState(bak);
	    			}
	    			modified=true;
	    			updateCameraPositionTarget();
	    		}
	    		break;
	    	}
	    }

		if (dontModify && level.commandQueue.indexOf('win')>=0) {	
	    	return true;	
		}
		
		if (dontModify) {		
    		if (verbose_logging) {
    			consoleCacheDump();
    		}
			return false;
		}

        for (var i=0;i<seedsToPlay_CantMove.length;i++) {
            playSound(seedsToPlay_CantMove[i]);
        }

        for (var i=0;i<seedsToPlay_CanMove.length;i++) {
            playSound(seedsToPlay_CanMove[i]);
        }

        for (var i=0;i<state.sfx_CreationMasks.length;i++) {
          var entry = state.sfx_CreationMasks[i];
          if (sfxCreateMask.anyBitsInCommon(entry.objectMask)) {
            playSound(entry.seed);
          }
        }

        for (var i=0;i<state.sfx_DestructionMasks.length;i++) {
          var entry = state.sfx_DestructionMasks[i];
          if (sfxDestroyMask.anyBitsInCommon(entry.objectMask)) {
            playSound(entry.seed);
          }
        }

	    processOutputCommands(level.commandQueue);

	    if (textMode===false) {
	    	if (verbose_logging) { 
	    		consolePrint('Checking win conditions.');
			}
			if (dontDoWin===undefined){
				dontDoWin = false;
			}
	    	checkWin( dontDoWin );
	    }

	    if (!winning) {
			if (level.commandQueue.indexOf('checkpoint')>=0) {
		    	if (verbose_logging) { 
	    			var r = level.commandQueueSourceRules[level.commandQueue.indexOf('checkpoint')];
		    		consolePrintFromRule('CHECKPOINT command executed, saving current state to the restart state.',r);
				}
				restartTarget=level4Serialization();
				hasUsedCheckpoint=true;
				var backupStr = JSON.stringify(restartTarget);
				storage_set(document.URL+'_checkpoint',backupStr);
				storage_set(document.URL,curlevel);				
			}	 

		    if (level.commandQueue.indexOf('again')>=0 && modified) {

	    		var r = level.commandQueueSourceRules[level.commandQueue.indexOf('again')];

		    	//first have to verify that something's changed
		    	var old_verbose_logging=verbose_logging;
		    	var oldmessagetext = messagetext;
		    	verbose_logging=false;
		    	if (processInput(-1,true,true)) {
			    	verbose_logging=old_verbose_logging;

			    	if (verbose_logging) { 
			    		consolePrintFromRule('AGAIN command executed, with changes detected - will execute another turn.',r);
					}

			    	againing=true;
			    	timer=0;
			    } else {		    	
			    	verbose_logging=old_verbose_logging;
					if (verbose_logging) { 
						consolePrintFromRule('AGAIN command not executed, it wouldn\'t make any changes.',r);
					}
			    }
			    verbose_logging=old_verbose_logging;
			    messagetext = oldmessagetext;
		    }   
		}
		
		if (verbose_logging) { 
			consolePrint(`Turn complete`);    
		}
		
	    level.commandQueue=[];
	    level.commandQueueSourceRules=[];

    }

  if (verbose_logging) {
    consoleCacheDump();
  }

  if (winning) {
    againing=false;
  }

  return modified;
}

function checkWin(dontDoWin) {

  if (levelEditorOpened) {
    dontDoWin=true;
  }

	if (level.commandQueue.indexOf('win')>=0) {
		if (runrulesonlevelstart_phase){
			consolePrint("Win Condition Satisfied (However this is in the run_rules_on_level_start rule pass, so I'm going to ignore it for you.  Why would you want to complete a level before it's already started?!)");		
		} else {
			consolePrint("Win Condition Satisfied");
		}
		if(!dontDoWin){
			DoWin();
		}
		return;
	}

	var won= false;
	if (state.winconditions.length>0)  {
		var passed=true;
		for (var wcIndex=0;wcIndex<state.winconditions.length;wcIndex++) {
			var wincondition = state.winconditions[wcIndex];
			var filter1 = wincondition[1];
			var filter2 = wincondition[2];
			var rulePassed=true;
			switch(wincondition[0]) {
				case -1://NO
				{
					for (var i=0;i<level.n_tiles;i++) {
						var cell = level.getCellInto(i,_o10);
						if ( (!filter1.bitsClearInArray(cell.data)) &&  
							 (!filter2.bitsClearInArray(cell.data)) ) {
							rulePassed=false;
							break;
						}
					}

          break;
        }
        case 0://SOME
        {
          var passedTest=false;
          for (var i=0;i<level.n_tiles;i++) {
            var cell = level.getCellInto(i,_o10);
            if ( (!filter1.bitsClearInArray(cell.data)) &&  
               (!filter2.bitsClearInArray(cell.data)) ) {
              passedTest=true;
              break;
            }
          }
          if (passedTest===false) {
            rulePassed=false;
          }
          break;
        }
        case 1://ALL
        {
          for (var i=0;i<level.n_tiles;i++) {
            var cell = level.getCellInto(i,_o10);
            if ( (!filter1.bitsClearInArray(cell.data)) &&  
               (filter2.bitsClearInArray(cell.data)) ) {
              rulePassed=false;
              break;
            }
          }
          break;
        }
      }
      if (rulePassed===false) {
        passed=false;
      }
    }
    won=passed;
  }

	if (won) {
		if (runrulesonlevelstart_phase){
			consolePrint("Win Condition Satisfied (However this is in the run_rules_on_level_start rule pass, so I'm going to ignore it for you.  Why would you want to complete a level before it's already started?!)");		
		} else {
			consolePrint("Win Condition Satisfied");
		}
		if (!dontDoWin){
			DoWin();
		}
	}
}

function DoWin() {
  if (winning) {
    return;
  }
  againing=false;
  tryPlayEndLevelSound();
  if (unitTesting) {
    nextLevel();
    return;
  }

  winning=true;
  timer=0;
}

/*
//this function isn't valid after refactoring, but also isn't used.
function anyMovements() { 
    for (var i=0;i<level.movementMask.length;i++) {
        if (level.movementMask[i]!==0) {
          return true;
        }
    }
    return false;
}*/

function nextLevel() {
    againing=false;
	messagetext="";
	if (state && state.levels && (curlevel>state.levels.length) ){
		curlevel=state.levels.length-1;
	}
  
  ignoreNotJustPressedAction=true;
	if (titleScreen && titleMode <= 1) {
		if(isContinueOptionSelected()) {
			// continue
			loadLevelFromStateOrTarget();
		} else if(isNewGameOptionSelected()) {
			// new game
			curlevel=0;
			curlevelTarget=null;

			if (state.metadata.level_select === undefined) {
				clearLocalStorage();
			}

			loadLevelFromStateOrTarget();
		} else if(isLevelSelectOptionSelected()) {
			// level select
			titleSelection = 0;
			gotoLevelSelectScreen();
		} else {
			// settings
			// TODO
		}
	} else {
		if (hasUsedCheckpoint){
			curlevelTarget=null;
			hasUsedCheckpoint=false;
		}

		if (curlevel<(state.levels.length-1)) {
			var skip = false;
			var curSection = state.levels[Number(curlevel)].section;
			var nextSection = state.levels[Number(curlevel)+1].section;
			if(nextSection != curSection) {
				setSectionSolved(state.levels[Number(curlevel)].section);
				
				if(solvedSections.length == state.sections.length && state.winSection != undefined) {
					curlevel = state.winSection.firstLevel - 1; // it's gonna be increased to match few lines below
				} else if (nextSection == "__WIN__") {
					gotoLevelSelectScreen();
					skip = true;
				}		
			}

			if(!skip) {
				curlevel++;
				curlevelTarget=null;
				textMode=false;
				titleScreen=false;
				quittingMessageScreen=false;
				messageselected=false;
	
				loadLevelFromStateOrTarget();
			}
		} else {
			if(solvedSections.length == state.sections.length) {
				if(state.metadata["level_select"] === undefined) {
					// solved all
          try{
            storage_remove(document.URL);
            storage_remove(document.URL+'_checkpoint');				
          } catch(ex){
          }
					
					curlevel=0;
					curlevelTarget=null;
					goToTitleScreen();
				} else {
					gotoLevelSelectScreen();
				}
				
				tryPlayEndGameSound();	
			} else {
				if(state.levels[Number(curlevel)].section != null) {
					setSectionSolved(state.levels[Number(curlevel)].section);
				}
				gotoLevelSelectScreen();
			}
		}		
		//continue existing game
	}

	updateLocalStorage();
	resetFlickDat();
	canvasResize();	
}

function loadLevelFromStateOrTarget() {
	if (curlevelTarget!==null){			
		loadLevelFromStateTarget(state,curlevel,curlevelTarget);
	} else {
		loadLevelFromState(state,curlevel);
	}
}

function goToTitleScreen(){
    againing=false;
	messagetext="";
	titleScreen=true;
	textMode=true;
	doSetupTitleScreenLevelContinue();
  //titleSelection=showContinueOptionOnTitleScreen()?1:0;
  
  state.metadata = deepClone(state.default_metadata);
  twiddleMetadataExtras();

  if (canvas!==null){//otherwise triggers error in cat bastard test
		regenSpriteImages();
	}

	generateTitleScreen();
}

function resetFlickDat() {
	if (state!==undefined && state.metadata.flickscreen!==undefined){
		oldflickscreendat=[0,0,Math.min(state.metadata.flickscreen[0],level.width),Math.min(state.metadata.flickscreen[1],level.height)];
	}
}

function updateLocalStorage() {
	try {
		
		storage_set(document.URL,curlevel);
		if (curlevelTarget!==null){
			restartTarget=level4Serialization();
			var backupStr = JSON.stringify(restartTarget);
			storage_set(document.URL+'_checkpoint',backupStr);
		} else {
			storage_remove(document.URL+"_checkpoint");
		}		
		
	} catch (ex) {
  }
}

function setSectionSolved(section) {
	if(section == null || section == undefined) {
		return;
	}

	if(section.name == "__WIN__") {
		return;
	}

	if(solvedSections.indexOf(section) >= 0) {
		return;
	}

	try {
		if(!!window.localStorage) {
			solvedSections.push(section);
			localStorage.setItem(document.URL + "_sections", JSON.stringify(solvedSections));
		}
	} catch(ex) { }
}

function clearLocalStorage() {
	curlevel = 0;
	curlevelTarget = null;
	solvedSections = [];

	try {
		if (!!window.localStorage) {
			localStorage.removeItem(document.URL);
			localStorage.removeItem(document.URL+'_checkpoint');
			localStorage.removeItem(document.URL+'_sections');
		}
	} catch(ex){ }
}

var cameraPositionTarget = null;

var cameraPosition = {
  x: 0,
  y: 0
};

function initSmoothCamera() {
    if (state===undefined || state.metadata.smoothscreen===undefined) {
        return;
    }

    screenwidth=state.metadata.smoothscreen.screenSize.width;
    screenheight=state.metadata.smoothscreen.screenSize.height;

    var boundarySize = state.metadata.smoothscreen.boundarySize;
    var flick = state.metadata.smoothscreen.flick;

    var playerPositions = getPlayerPositions();
    if (playerPositions.length>0) {
        var playerPosition = {
            x: (playerPositions[0]/(level.height))|0,
            y: (playerPositions[0]%level.height)|0
        };

        cameraPositionTarget = {
            x: flick
              ? getFlickCameraPosition(playerPosition.x, level.width, screenwidth, boundarySize.width)
              : getCameraPosition(playerPosition.x, level.width, screenwidth),
            y: flick
              ? getFlickCameraPosition(playerPosition.y, level.height, screenheight, boundarySize.height)
              : getCameraPosition(playerPosition.y, level.height, screenheight)
        };

        cameraPosition.x = cameraPositionTarget.x;
        cameraPosition.y = cameraPositionTarget.y;
    }
}

function getCameraPosition (targetPosition, levelDimension, screenDimension) {
    return Math.min(
        Math.max(targetPosition, Math.floor(screenDimension / 2)),
        levelDimension - Math.ceil(screenDimension / 2)
    );
}

function getFlickCameraPosition (targetPosition, levelDimension, screenDimension, boundaryDimension) {
    var flickGridOffset = (Math.floor(screenDimension / 2) - Math.floor(boundaryDimension / 2));
    var flickGridPlayerPosition = targetPosition - flickGridOffset;
    var flickGridPlayerCell = Math.floor(flickGridPlayerPosition / boundaryDimension);
    var maxFlickGridCell = Math.floor((levelDimension - Math.ceil(screenDimension / 2) - Math.floor(boundaryDimension / 2) - flickGridOffset) / boundaryDimension);

    return Math.min(Math.max(flickGridPlayerCell, 0), maxFlickGridCell) * boundaryDimension + Math.floor(screenDimension / 2);
}

function updateCameraPositionTarget() {
    var smoothscreenConfig = state.metadata.smoothscreen;
    var playerPositions = getPlayerPositions();

    if (!smoothscreenConfig || playerPositions.length === 0) {
        return
    }

    var playerPosition = {
        x: (playerPositions[0]/(level.height))|0,
        y: (playerPositions[0]%level.height)|0
    };

    ['x', 'y'].forEach(function (coord) {
        var screenDimension = coord === 'x' ? screenwidth : screenheight;

        var dimensionName = coord === 'x' ? 'width' : 'height';
        var levelDimension = level[dimensionName];
        var boundaryDimension = smoothscreenConfig.boundarySize[dimensionName];

        var playerVector = playerPosition[coord] - cameraPositionTarget[coord];
        var direction = Math.sign(playerVector);
        var boundaryVector = direction > 0
          ? Math.ceil(boundaryDimension / 2)
          : -(Math.floor(boundaryDimension / 2) + 1);

        if (Math.abs(playerVector) - Math.abs(boundaryVector) >= 0) {
            cameraPositionTarget[coord] = smoothscreenConfig.flick
              ? getFlickCameraPosition(playerPosition[coord], levelDimension, screenDimension, boundaryDimension)
              : getCameraPosition(playerPosition[coord] - boundaryVector + direction, levelDimension, screenDimension);
        }
    })
}
