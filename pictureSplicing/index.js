function PictureSplicing(opts) {
    this.opts = opts;
    this.datas = [];
    this.loadCount = 0;
    this.line = [];
    for (var i = 0; i < this.opts.row; i++) {
        this.line.push(0);
    }
    this.allHeight = 0;

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');

    this.readyLoad();
}

PictureSplicing.prototype.readyLoad = function () {
    for (var i = 0; i < this.opts.urls.length; i++) {
        var img = new Image();
        img.src = this.opts.urls[i];
        img.crossOrigin = 'anonymous';
        img.index = i;
        img.errorNum = 0;
        img.onload = this.onLoad.bind(this, img);
        img.onerror = this.onerror.bind(this, img);

        this.datas.push({
            img: img,
            w: this.opts.width
        });
    }
}

PictureSplicing.prototype.onLoad = function (img) {
    this.loadCount++;

    this.datas[img.index].h = this.opts.width / (img.width / img.height);

    this.opts.onload && this.opts.onload(this.loadCount, this.opts.urls.length);

    this.loadCount === this.opts.urls.length && this.finishLoad();
}

PictureSplicing.prototype.onerror = function (img) {
    var src = img.src;
    var addType = '?id=';
    if (src.indexOf("?") > -1) {
        if (src.indexOf("?id=") > -1) {
            src = src.substring(0, src.indexOf("?id="));
        } else {
            if (src.indexOf("&id=") > -1) {
                src = src.substring(0, src.indexOf("&id="));
            }
            addType = '&id=';
        }
    }


    if (img.errorNum >= 3) {
        this.loadCount++;

        this.opts.onerror && this.opts.onerror(src);

        this.loadCount === this.opts.urls.length && this.finishLoad();
        return
    }

    img.errorNum += 1;
    img.src = src + addType + parseInt(Math.random() * 1000000000000000, 10);
}

PictureSplicing.prototype.finishLoad = function () {
    this.arrangement();

    this.canvas.width = this.opts.width * this.opts.row;
    this.canvas.height = this.allHeight;

    this.draw();

    this.opts.cb && this.opts.cb(this.canvas);
}

PictureSplicing.prototype.arrangement = function () {
    for (var i = this.datas.length - 1; i >= 0; i--) {
        this.datas[i].h >= this.opts.maxHeight && this.datas.splice(i, 1);
    }

    this.datas.sort(function (a, b) {
        return b.h - a.h;
    });

    for (var i = 0; i < this.datas.length; i++) {
        var min = Math.min.apply(this, this.line);
        var index = this.line.indexOf(min);

        this.datas[i].x = index * this.opts.width;
        this.datas[i].y = this.line[index];
        this.line[index] += this.datas[i].h;

        if (this.line[index] > this.allHeight) {
            this.allHeight = this.line[index];
        }
    }

    var tempArr = [];

    for (var i = 0; i < this.opts.row; i++) {
        tempArr[i] = [];
        for (var j = 0; j < this.datas.length; j++) {
            if (this.datas[j].x === i * this.opts.width) {
                tempArr[i].push(this.datas[j]);
            }
        }
    }

    for (var i = 0; i < tempArr.length; i++) {
        tempArr[i].sort(function (a, b) {
            return a.h - b.h;
        });

        var tempNum = 0;
        for (var j = 0; j < tempArr[i].length; j++) {
            tempArr[i][j].y = tempNum;
            tempNum += tempArr[i][j].h;
        }
    }
}

PictureSplicing.prototype.draw = function () {
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (var i = 0; i < this.datas.length; i++) {
        var data = this.datas[i];
        this.ctx.drawImage(data.img, data.x, data.y, data.w, data.h);
    }
}