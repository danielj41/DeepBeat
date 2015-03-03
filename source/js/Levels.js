(function (window) {

    var Level = function(stage) {
        this.stage = stage;
        this.lastTime = 0;
    };

    Level.prototype = {
        spawnEnemies: function() {

            var position = this.music.getPosition();
            DeepBeat.dt = position - this.lastTime;
            this.lastTime = position;

            while(this.enemies.length &&
             (position + this.enemies[0].type.prototype.timeToSound(this.enemies[0].params)) > this.enemies[0].beat * this.beatRate) {
                this.stage.addChild(new this.enemies[0].type(this.enemies[0].params));
                this.enemies.splice(0,1);
            }
        },

        stage: null,
        enemies: [],
        music: null,
        beatRate: 1000,

        tick: function() {},

        end: function() {},

        lostLevel: function() {}
    };


    //sort enemies by the order they will be spawned, regardless of when they are destroyed.
    var sortEnemies = function(beatRate, enemies) {
        return enemies.sort(function(a, b) {
            return (a.beat * beatRate - a.type.prototype.timeToSound(a.params))
            - (b.beat * beatRate - b.type.prototype.timeToSound(b.params));
        });
    };

    /*
    var addDiagonal = function(enemies, beatStart, number, beatIncrement, speed, xDir, yDir, startX, startY, endX, endY) {
        for(var i = 0; i < number; i++) {
            enemies.push({
                beat: beatStart + i * beatIncrement,
                type: Enemy,
                params: [startX + i * (endX - startX) / number, startY + i * (endY - startY) / number, xDir, yDir, speed]
            });
        }
    };
    */
    
    var addEnemy = function(enemies, phrase, measure, beat, speed, xDir, yDir, type) {
        enemies.push({
            beat: phrase*(4*8) + measure*4 + beat,
            type: Enemy,
            params: [
                xDir == 0 ? DeepBeat.windowWidth/2 : (xDir == 1 ? 0 : DeepBeat.windowWidth), //startX
                yDir == 0 ? DeepBeat.windowHeight/2 : (yDir == 1 ? 0 : DeepBeat.windowHeight),  //startY
                xDir, yDir, speed,
                type]
        });
    };
    
    var addEnemyGroup = function(enemies, phraseStart, measureStart, beatStart, number, beatIncr, speed, xDir, yDir, type) {
        for (var i = 0; i < number; i++) {
            var beat = (phraseStart*(4*8) + measureStart*4 + beatStart) + i*beatIncr;
            addEnemy(enemies, 0, 0, beat, speed, xDir, yDir, type);
        }
    }
    
    // Converts the BPM to a beat rate (milliseconds between each beat)
    var bpmToBeatRate = function(bpm) {
        return (1 / bpm) * 60 * 1000;
    }
    
    var randBool = function() {
        return Math.random()<.5;
    }
    
    // Psuedo-randomly produce a level with enemies
    var level1Design = function(enemies) {
        var xDir = 1;
        var yDir = 0;
        
        for (var phrase = 1; phrase < 16; phrase++) {
            var number = Math.pow(2, Math.floor(Math.min(Math.log(phrase*2),3))+2);
            var speed = Math.log(phrase)*0.05 + 0.1;
            var type = randBool() ? DeepBeat.enemyType.linear : DeepBeat.enemyType.wave;
            
            addEnemyGroup(enemies, phrase, 0, 0, number, 32/number, speed, xDir, yDir, type);   
            
            xDir = xDir == 0 ? (randBool() ? -1 : 1) : 0;
            yDir = yDir == 0 ? (randBool() ? -1 : 1) : 0;
        }
    }

    window.DeepBeatLevels = {};

    window.DeepBeatLevels.MainMenu = function(stage) {
        Level.apply(this, [stage]);
        stage.addChild(new Menu([{
            text: "Play Game",
            level: window.DeepBeatLevels.Level1
        }, {
            text: "Help",
            level: window.DeepBeatLevels.HelpMenu
        }]));
    };
    window.DeepBeatLevels.MainMenu.prototype = _.extend(new Level(), {});

    window.DeepBeatLevels.HelpMenu = function(stage) {
        Level.apply(this, [stage]);
        stage.addChild(new Menu([{
            text: "Back",
            level: window.DeepBeatLevels.MainMenu
        }]));
        var text = new createjs.Text("Use the arrow keys to shoot your laser!\nShoot objects before they damage your space station!", "bold 24px Arial", "#FFFFFF");
        text.maxWidth = 1000;
        text.textAlign = "center";
        text.textBaseline = "middle";
        text.x = DeepBeat.windowWidth / 2;
        text.y = 100;
        stage.addChild(text);
    };
    window.DeepBeatLevels.HelpMenu.prototype = _.extend(new Level(), {});

    // Define first level
    window.DeepBeatLevels.Level1 = function(stage) {
        Level.apply(this, [stage]);
        stage.addChild(new Gun());
        stage.addChild(new Blackhole());
        this.health = new HealthBar();
        stage.addChild(this.health);
        this.music = createjs.Sound.play("level1Music");
        this.enemies = [];
        
        // Level enemy design (https://docs.google.com/spreadsheets/d/1A6TbD9uX-BzYY3LA29Rkb5xUfGDKnTwhemWctucYRRk/edit#gid=1841141855)
        level1Design(this.enemies);

        this.enemies = sortEnemies(this.beatRate, this.enemies);
    };

    window.DeepBeatLevels.Level1.prototype = _.extend(new Level(), {
        beatRate: bpmToBeatRate(165), // define the BPM of the song here
        
        tick: function() {
            this.spawnEnemies();
        },

        lostLevel: function() {
            DeepBeat.setLevel(DeepBeatLevels.MainMenu);
        }
    });

}(window));