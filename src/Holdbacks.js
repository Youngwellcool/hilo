
(function (ns) {

    var Holdbacks = ns.Holdbacks = Hilo.Class.create({
        Extends: Hilo.Container,
        constructor: function (properties) {
            Holdbacks.superclass.constructor.call(this, properties);

            //石头之间的水平间隔
            this.hoseSpacingX = 1000;//2000;
            //上下石头之间的垂直间隔，即小鸟要穿越的空间大小
            this.hoseSpacingY = 290;
            //石头的总数（上下一对石头算一个）
            this.numHoses = 6;
            //移出屏幕左侧的石头数量，一般设置为石头总数的一半
            this.numOffscreenHoses = 2;//this.numHoses * 0.5;
            //石头的宽度（包括石头之间的间隔）
            this.hoseWidth =  this.hoseSpacingX;

            //初始化障碍的宽和高
            this.width = this.hoseWidth * this.numHoses;
            this.height = properties.height;

            this.width = Math.min(innerWidth, 450) * 2;
            this.carImg = ns.asset.car;
            console.log("width"+this.carImg.width)

            // 石头出现的x坐标位置
            this.left = 120;
            this.center = this.width / 2 - this.carImg.width * 0.6 / 2;
            this.right = this.width - 180 - this.carImg.width / 2;

            this.reset();
            this.createHoses(properties.image);
            this.moveTween = new Hilo.Tween.to(this, null, {
                onComplete: this.resetHoses.bind(this)
            });
        },

        startY: 0, //障碍开始的起始x轴坐标
        groundY: 0, //地面的y轴坐标

        hoseSpacingX: 0, //石头之间的水平间隔
        hoseSpacingY: 0, //上下石头之间的垂直间隔
        numHoses: 0, //石头的总数（上下一对石头算一个）
        numOffscreenHoses: 0, //移出屏幕左侧的石头数量
        hoseWidth: 0, //石头的宽度（包括石头之间的间隔）

        passThrough: 0, //穿过的石头的数量，也即移出屏幕左侧的石头的数量

        createHoses: function (image) {
            for (var i = 0; i < this.numHoses; i++) {
                // var downHose = new Hilo.Bitmap({
                //     id: 'down' + i,
                //     image: image,
                //     rect: [0, 0, 148, 820],
                //     boundsArea: [
                //         { x: 8, y: 0 },
                //         { x: 140, y: 0 },
                //         { x: 140, y: 60 },
                //         { x: 136, y: 60 },
                //         { x: 136, y: 820 },
                //         { x: 14, y: 820 },
                //         { x: 14, y: 60 },
                //         { x: 8, y: 60 }
                //     ]
                // }).addTo(this);

                var stone = new Hilo.Bitmap({
                    id: 'up' + i,
                    image: image,
                    rect: [0,0,210,156],
                    x:300,
                    y:500
                    // boundsArea: [
                    //     { x: 14, y: 0 },
                    //     { x: 140, y: 0 },
                    //     { x: 140, y: 820 - 60 },
                    //     { x: 144, y: 820 - 60 },
                    //     { x: 144, y: 820 },
                    //     { x: 8, y: 820 },
                    //     { x: 8, y: 820 - 60 },
                    //     { x: 14, y: 820 - 60 }
                    // ]
                }).addTo(this);

                this.placeHose( stone, i);
            }
        },

        placeHose: function (up, index) {
            //下面障碍在y轴的最上的位置
            // var downMinY = this.groundY - down.height + this.hoseSpacingY;
            //下面障碍在y轴的最下的位置
            // var downMaxY = this.groundY - 180;
            //在downMinY和downMaxY之间随机位置

            // 障碍物的x值，在left,center,right随机取一个
            up.x = [this.left,this.center,this.right][Math.floor(Math.random() * (2 - 0 + 1) + 0)];//downMinY + (downMaxY - downMinY) * Math.random() >> 0;
            up.y = -this.hoseWidth * index;
            console.log('ux' + up.x + "//uy" + up.y)

            // up.y = 500;//down.y - this.hoseSpacingY - up.height;
            // up.x = 300;//down.x;
        },

        resetHoses: function () {
            var total = this.children.length;
            console.log('total'+total)
            console.log(this.numOffscreenHoses)
            //把已移出屏幕外的石头放到队列最后面，并重置它们的可穿越位置
            for (var i = 0; i < this.numOffscreenHoses; i++) {
                // var downHose = this.getChildAt(0);
                var upHose = this.getChildAt(0);
                // this.setChildIndex(downHose, total - 1);
                this.setChildIndex(upHose, total - 1);
                this.placeHose(upHose, this.numOffscreenHoses + i);
            }

            //重新确定队列中所有石头的x轴坐标
            for (var i = 0; i < total - this.numOffscreenHoses * 2; i++) {
                var hose = this.getChildAt(i);
                hose.y = -this.hoseWidth * (i * 0.5 >> 0);
                console.log('y'+hose.y)
            }

            //重新确定障碍的x轴坐标
            this.y = 0;

            //更新穿过的石头数量
            this.passThrough += this.numOffscreenHoses;
            console.log('得分'+this.passThrough)

            //继续移动
            console.log('reset')
            this.startMove();
            Hilo.Tween._tweens.push(this.moveTween);
        },

        startMove: function () {
            console.log('move')
            //设置缓动的x轴坐标
            var targetY = this.hoseWidth * this.numOffscreenHoses;
        
            //设置缓动时间
            this.moveTween.duration = (targetY - this.y) * 1.1;
            //设置缓动的变换属性，即x从当前坐标变换到targetX
            this.moveTween.setProps({ y: this.y }, { y: targetY });
            console.log(this.y)
            console.log(targetY)
            //启动缓动动画
            this.moveTween.start();
        },

        stopMove: function () {
            if (this.moveTween) this.moveTween.pause();
        },

            // 检查碰撞
        checkCollision: function (bird) {
            for (var i = 0, len = this.children.length; i < len; i++) {
                if (bird.hitTestObject(this.children[i], true)) {
                    return true;
                }
            }
            return false;
        },

        calcPassThrough: function (x) {
            var count = 0;

            x = -this.x + x;
            if (x > 0) {
                var num = x / this.hoseWidth + 0.5 >> 0;
                count += num;
            }
            count += this.passThrough;

            return count;
        },

        reset: function () {
            this.y = this.startY;
            this.passThrough = 0;
        }

    });

})(window.game);