(function() {

    window.onload = function() {
        game.init();
    }

    var game = window.game = {
        width: 0,
        height: 0,

        asset: null,
        stage: null,
        ticker: null,
        state: null,
        score: 0,

        bg: null,
        ground: null,
        bird: null,
        stones: null,
        gameReadyScene: null,
        gameOverScene: null,

        init: function() {
            this.asset = new game.Asset();
            this.asset.on('complete', function(e) {
                this.asset.off('complete');
                this.initStage();
            }.bind(this));
            this.asset.load();
        },

        initStage: function() {
            this.width = Math.min(innerWidth, 450) * 2;
            this.height = Math.min(innerHeight, 750) * 2;
            this.scale = 0.5;

            //舞台画布
            var renderType = location.search.indexOf('dom') != -1 ? 'dom' : 'canvas';

            //舞台
            this.stage = new Hilo.Stage({
                renderType: renderType,
                width: this.width,
                height: this.height,
                scaleX: this.scale,
                scaleY: this.scale
            });
            document.body.appendChild(this.stage.canvas);

            //启动计时器
            this.ticker = new Hilo.Ticker(60);
            this.ticker.addTick(Hilo.Tween);
            this.ticker.addTick(this.stage);
            this.ticker.start(true);

            // 创建车
            // var car = new Hilo.Bitmap({
            //     image: 'images/car.png',
            //     // rect: [0, 0, 100, 100]
            // })
            // car.addTo(this.stage)

            //绑定交互事件
            this.stage.enableDOMEvent(Hilo.event.POINTER_START, true);
            // this.stage.on(Hilo.event.POINTER_START, this.onUserInput.bind(this));

            //Space键控制
            if (document.addEventListener) {
                document.addEventListener('keydown', function(e) { // left
                    if (e.keyCode === 37) this.leftInput(e);
                }.bind(this));
                document.addEventListener('keydown', function (e) { // right
                    if (e.keyCode === 39) this.rightInput(e);
                }.bind(this));
            } else {
                document.attachEvent('onkeydown', function(e) { // right
                    if (e.keyCode === 39) this.rightInput(e);
                }.bind(this));
            }

            //舞台更新
            this.stage.onUpdate = this.onUpdate.bind(this);

            //初始化
            this.initBackground();
            this.initScenes();
            this.initHoldbacks();
            this.initBird();
            this.initCurrentScore();

            //准备游戏
            this.gameReady();
        },

        initBackground: function () {
            //背景
            var bgWidth = this.width * this.scale;
            var bgHeight = this.height * this.scale;
            var groundOffset = 60;
            var offset = 100;
            var bgImg = this.asset.bg;
            console.log('bg' + bgImg.height + '/' + this.height )
            this.bg = new Hilo.Bitmap({
                id: 'bg',
                image: bgImg,
                y: -offset * (this.height + offset * 2) / bgImg.height,
                scaleX: this.width / bgImg.width,
                scaleY: (this.height + offset * 2) / bgImg.height,//this.height / bgImg.height
            }).addTo(this.stage);

            //右侧
            var groundRImg = this.asset.groundR;
            
            this.groundR = new Hilo.Bitmap({
                id: 'groundR',
                image: groundRImg,
                y: -groundOffset * (this.height + groundOffset * 2) / groundRImg.height,
                scaleY: (this.height + groundOffset * 2) / groundRImg.height
            }).addTo(this.stage);
            //设置右侧的x轴坐标
            this.groundR.x = this.width - this.groundR.width;

            //左侧
            var groundLImg = this.asset.groundL;
            console.log('scale' + (this.height + groundOffset * 2) / groundLImg.height)
            console.log('scale22' + this.height +':'+  groundLImg.height)
            this.groundL = new Hilo.Bitmap({
                id: 'groundL',
                image: groundLImg,
                y: -groundOffset * (this.height + groundOffset * 2) / groundLImg.height,//-groundRImg.height * ((this.height + groundOffset * 2) / groundLImg.height - 1),
                scaleY: (this.height + groundOffset * 2) / groundLImg.height
            }).addTo(this.stage);
            //设置左侧的x轴坐标
            this.groundL.x = 0;

            //移动地面
            this.moveBg = Hilo.Tween.to([this.groundL,this.groundR,this.bg], {
                y: 0//groundOffset * this.groundL.scaleY
            }, 
            {
                duration: 100,
                loop: true
            });
        },

        stopMoveBg: function () {
            if (this.moveBg) {
                for(let item of this.moveBg){
                    item.pause();
                }
            }//this.moveBg.pause();
        },

        initCurrentScore: function() {
            //当前分数
            // this.currentScore = new Hilo.BitmapText({
            //     id: 'score',
            //     glyphs: this.asset.numberGlyphs,
            //     textAlign: 'center'
            // }).addTo(this.stage);

            // //设置当前分数的位置
            // this.currentScore.x = this.width - this.currentScore.width >> 1;
            // this.currentScore.y = 180;
        },

        initBird: function() {
            this.carImg = this.asset.car;
            this.bird = new Hilo.Bitmap({
                id: 'bird',
                image: this.carImg,
                x: this.width/2 - this.carImg.width*0.6/2,
                y: this.height - 400,
                scaleX:0.6,
                scaleY:0.6,
            }).addTo(this.stage);



            // this.bird = new game.Bird({
            //     id: 'bird',
            //     atlas: this.asset.birdAtlas,
            //     startX: 300,
            //     startY: 300,//this.height >> 1,
            //     groundY: 100,//this.ground.y - 12
            // }).addTo(this.stage, this.groundR.depth - 1);
        },

        initHoldbacks: function() {
            console.log(this.asset.stone)
            console.log(this.height)
            // this.stones = new game.Holdbacks({
            //     id: 'stones',
            //     image: this.asset.stone,
            //     width: 100,//this.height,
            //     startY: this.height - 500,
            //     groundY: 400,//this.groundR.y
            // }).addTo(this.stage, this.groundR.depth - 1);


            this.stones = new game.Holdbacks({
                id: 'stones',
                image: this.asset.stone,
                height: this.height,
                startY: -100,//this.height - 100,
                // groundY: this.ground.y
            }).addTo(this.stage, this.groundR.depth - 1);
        },

        initScenes: function() {
            //准备场景
            // this.gameReadyScene = new game.ReadyScene({
            //     id: 'readyScene',
            //     width: this.width,
            //     height: this.height,
            //     image: this.asset.ready
            // }).addTo(this.stage);

            // //结束场景
            // this.gameOverScene = new game.OverScene({
            //     id: 'overScene',
            //     width: this.width,
            //     height: this.height,
            //     image: this.asset.over,
            //     numberGlyphs: this.asset.numberGlyphs,
            //     visible: false
            // }).addTo(this.stage);

            // //绑定开始按钮事件
            // this.gameOverScene.getChildById('start').on(Hilo.event.POINTER_START, function(e) {
            //     e.stopImmediatePropagation && e.stopImmediatePropagation();
            //     this.gameReady();
            // }.bind(this));
        },

        // onUserInput: function(e) {
        //     if (this.state !== 'over' && !this.gameOverScene.contains(e.eventTarget)) {
        //         //启动游戏场景
        //         if (this.state !== 'playing') this.gameStart();
        //         //控制小鸟往上飞
        //         this.bird.startFly();
        //     }
        // },


        leftInput:function (e) {
            console.log('left')
            console.log(this.carImg.width)
            console.log(this.width / 2 - this.carImg.width * 0.6 / 2)
            var w = this.width / 2 - this.carImg.width * 0.6 / 2;
            if (this.bird.x == w){
                // this.bird.x = 150
                Hilo.Tween.to(this.bird, {
                    x: 150
                }, {
                    duration: 150,
                });
            } else if (this.bird.x == (this.width - 180 - this.carImg.width / 2)){
                Hilo.Tween.to(this.bird, {
                    x: w
                }, {
                    duration: 150,
                });
            }
        },
        rightInput:function (e) {
            console.log('right')
            var w = this.width / 2 - this.carImg.width * 0.6 / 2;
            if (this.bird.x == w) {
                // this.bird.x = (this.width - 180 - this.carImg.width  / 2)
                Hilo.Tween.to(this.bird, {
                    x: this.width - 180 - this.carImg.width / 2
                }, {
                    duration: 150,
                });
            } else if (this.bird.x == 150) {
                // this.bird.x = w
                Hilo.Tween.to(this.bird, {
                    x: w
                }, {
                    duration: 150,
                });
            } 
        },

        onUpdate: function(delta) {
            if (this.state === 'ready') {
                return;
            }

            if (this.bird.isDead) {
                this.gameOver();
            } else {
                // this.currentScore.setText(this.calcScore());
                //碰撞检测
                if (this.stones.checkCollision(this.bird)) {
                    this.gameOver();
                }
            }
        },

        gameReady: function() {
            // this.gameOverScene.hide();
            // this.state = 'ready';
            // this.score = 0;
            // this.currentScore.visible = true;
            // this.currentScore.setText(this.score);
            // this.gameReadyScene.visible = true;
            // this.stones.reset();
            // this.bird.getReady();
        },

        gameStart: function() {
            // this.state = 'playing';
            // this.gameReadyScene.visible = false;
            // this.stones.startMove();
        },

        gameOver: function() {
            if (this.state !== 'over') {
                //设置当前状态为结束over
                this.state = 'over';
                //停止障碍的移动
                this.stones.stopMove();
                // 停止背景移动
                this.stopMoveBg()
                //小鸟跳转到第一帧并暂停
                // this.bird.goto(0, true);
                //隐藏屏幕中间显示的分数
                // this.currentScore.visible = false;
                //显示结束场景
                // this.gameOverScene.show(this.calcScore(), this.saveBestScore());
                var overImg = this.asset.over2;
                this.over2 = new Hilo.Bitmap({
                    id: 'over2',
                    image: overImg,
                    x: this.width / 2 - overImg.width * 2 / 2,
                    y: this.height / 2 - overImg.height * 2 / 2 - 100,
                    scaleX: 2,
                    scaleY: 2,
                }).addTo(this.stage);

                
            }
        },

        calcScore: function() {
            // var count = this.stones.calcPassThrough(this.bird.x);
            // return this.score = count;
        },

        saveBestScore: function() {
        //     var score = this.score,
        //         best = 0;
        //     if (Hilo.browser.supportStorage) {
        //         best = parseInt(localStorage.getItem('hilo-flappy-best-score')) || 0;
        //     }
        //     if (score > best) {
        //         best = score;
        //         localStorage.setItem('hilo-flappy-best-score', score);
        //     }
        //     return best;
        // }
    }
}

})();