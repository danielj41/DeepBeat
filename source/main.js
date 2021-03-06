DeepBeat = {
    manifest: null,
    preload: null,

    canvas: null,
    stage: null,

    keysDown: {},
    keysEventDispatcher: null,

    currentLevel: null,
    firstLevel: null,

    windowWidth: 640,
    windowHeight: 640,

    collisionTypes: {
        "Enemy": []
    },
    
    enemyType: { // How to enum: http://stackoverflow.com/questions/287903/enums-in-javascript
        linear: 0,
        wave: 1,
        spiral: 2,
        diagonal: 3,
        creeper: 4
    },

    collisionFroms: [],

    dt: 0,
    time: 0,

    KEYCODES: {
        "13": "enter",
        "32": "space",
        "38": "up",
        "37": "left",
        "39": "right",
        "40": "down",
        "87": "up",
        "65": "left",
        "68": "right",
        "83": "down",
        "109": "mute",
        "77": "mute",
        "27": "esc"
    },

    init: function(level) {
        var game = this;
        this.firstLevel = level;

        document.onkeydown = function(e){game.handleKeyDown(e);}
        document.onkeyup = function(e){game.handleKeyUp(e);};

        createjs.Sound.initializeDefaultPlugins();

        this.canvas = document.getElementById("gameCanvas");
        this.stage = new createjs.Stage(this.canvas);
        this.background = new Background();
        this.keysEventDispatcher = new createjs.EventDispatcher();
        
        // Loading message
		this.messageField = new createjs.Text("Loading...", "24px Verdana", "#FFFFFF");
		this.messageField.maxWidth = 1000;
		this.messageField.textAlign = "center";
		this.messageField.textBaseline = "middle";
		this.messageField.x = this.canvas.width / 2;
		this.messageField.y = this.canvas.height / 2;
		this.stage.addChild(this.messageField);
        this.stage.update();

        // Preload the following assets
        var assetsPath = "assets/";
        this.manifest = [ // Be sure to define bpm of song for each level in Level.js
            {id: "tutorialMusic", src: "audio/tutorial.mp3"},
            {id: "level1Music", src: "audio/Phazd_tobycreed.mp3"},
            {id: "level2Music", src: "audio/Heaven_Envy.mp3"},
            {id: "level3Music", src: "audio/ChaozFantasy_ParagonX9.mp3"},
            {id: "bonusMusic", src: "audio/Faded_Zhu.mp3"},
            {id: "laserSFX", src: "audio/laser.mp3"},
            {id: "shipHitSFX", src: "audio/ship_hit.mp3"},
            {id: "explosionSFX", src: "audio/explosion.mp3"},
            {id: "logo", src: "images/logo.png"}
        ];
        
        this.preload = new createjs.LoadQueue(true, assetsPath);
        this.preload.installPlugin(createjs.Sound);
        this.preload.addEventListener("complete", function(){game.doneLoading();});
        this.preload.addEventListener("progress", function(){game.updateLoading();});
        this.preload.loadManifest(this.manifest);
    },

    stop: function() {
        if (this.preload != null) {
            this.preload.close();
        }
        createjs.Sound.stop();
    },
    
    updateLoading: function() {
        var percentage = Math.round(this.preload.progress * 100);
        this.messageField.text = "Loading... "+percentage+"%";
        this.stage.update();
    },
    doneLoading: function() {
		// Remove loading message
        this.stage.removeChild(this.messageField);
        
        var game = this;
        this.setLevel(this.firstLevel);
        createjs.Ticker.interval = 17;
        createjs.Ticker.addEventListener("tick", function(){game.tick();});
        // Play music after it was preloaded
    },

    setLevel: function(level) {
        this.dt = 17;
        createjs.Sound.stop();
        if(this.currentLevel) {
            this.currentLevel.end();
        }
        this.stage.removeAllChildren();
        this.collisionTypes.Enemy = []; // reset all collisions
        this.collisionFroms = [];
        this.stage.addChild(this.background);
        this.currentLevel = new level(this.stage, createjs.Ticker.getTime());
    },

    tick: function(event) {
        this.handleKeys();
        this.handleCollisions();
        this.stage.update(event);
        this.currentLevel.tick();
    },

    handleKeys: function() {
        for (var key in this.keysDown) {
            if (this.keysDown[key]) {
                this.keysEventDispatcher.dispatchEvent("key-" + this.KEYCODES[key]);
            }
        }
    },

    handleKeyDown: function(e) {
        if(this.KEYCODES["" + e.keyCode] && !this.keysDown["" + e.keyCode]) {
            this.keysEventDispatcher.dispatchEvent(new createjs.Event("keydown-" + this.KEYCODES["" + e.keyCode], true));
            this.keysDown["" + e.keyCode] = true;
            return false;
        }
    },

    handleKeyUp: function(e) {
        if(this.KEYCODES["" + e.keyCode]) {
            this.keysEventDispatcher.dispatchEvent(new createjs.Event("keyup-" + this.KEYCODES["" + e.keyCode], true));
            delete this.keysDown["" + e.keyCode];
            return false;
        }
    },

    addKeyHandler: function(obj, k, func) {
        var game = this;
        var handle = function() {
            func.apply(obj);
        };
        this.keysEventDispatcher.addEventListener(k, handle);
        obj.on("removed", function() {
            game.keysEventDispatcher.removeEventListener(k, handle);
        });
    },

    addCollisionType: function(obj, typeString) {
        var game = this;
        obj.on("added", function() {
            game.collisionTypes[typeString].push(obj);
        });
        obj.on("removed", function() {
            game.collisionTypes[typeString].splice(game.collisionTypes[typeString].indexOf(obj), 1);
        });
    },

    addCollisionHandler: function(obj, sprite, typeString, func) {
        var game = this;

        var info = {
            from: sprite,
            to: typeString,
            func: func,
            obj: obj
        };

        obj.on("added", function() {
            game.collisionFroms.push(info);
        });
        obj.on("removed", function() {
            game.collisionFroms.splice(game.collisionFroms.indexOf(info), 1);
        });
    },

    handleCollisions: function() {
        for(var i in this.collisionFroms) {
            for(var j in this.collisionTypes[this.collisionFroms[i].to]) {
                if(ndgmr.checkRectCollision(this.collisionFroms[i].from, this.collisionTypes[this.collisionFroms[i].to][j])) {
                    this.collisionFroms[i].func.apply(this.collisionFroms[i].obj, [this.collisionTypes[this.collisionFroms[i].to][j]]);
                }
            }
        }
    },

    removeObject: function(obj) {
        this.stage.removeChild(obj);
    },

    addObject: function(obj) {
        this.stage.addChild(obj);
    }
};

