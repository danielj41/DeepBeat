(function (window) {


    function Enemy(params) {
        this.Container_constructor();

        this.addChild(new createjs.Bitmap(DeepBeat.preload.getResult("gun")));
        this.on("tick", p.tick);
        this.xReg = 16;
        this.yReg = 16;
        this.x = params[0] - 16;
        this.y = params[1] - 16;
        this.xDir = params[2];
        this.yDir = params[3];
        this.speed = params[4];


        DeepBeat.addCollisionType(this, "Enemy");
    }
    var p = createjs.extend(Enemy, createjs.Container);
    window.Enemy = createjs.promote(Enemy, "Container")

    p.tick = function (event) {
        this.x += this.xDir * this.speed * DeepBeat.dt;
        this.y += this.yDir * this.speed * DeepBeat.dt;
    }

    p.timeToSound = function(params) {
        return (params[2] == 0
            ? (params[3] > 0 ? DeepBeat.windowHeight/3 : 2*DeepBeat.windowHeight/3)
            : (params[2] > 0 ? DeepBeat.windowWidth/3 : 2*DeepBeat.windowWidth/3)) / params[4];
    };
    
}(window));