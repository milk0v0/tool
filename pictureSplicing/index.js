function noop() { }

class PictureSplicing {
  constructor(opts) {
    this.opts = {
      ...{
        width: 200,
        row: 2,
        maxHeight: 600,
        onload: noop,
        onerror: noop,
        cb: noop
      },
      ...opts
    };

    this.urls = this.opts.urls;
    this.width = this.opts.width;
    this.maxHeight = this.opts.maxHeight;

    this.init();
  }

  init() {
    // 组装后数据
    this.datas = [];
    // successLoad 计数
    this.loadCount = 0;
    // 列数组
    this.rows = new Array(this.opts.row).fill(0);

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');

    this.readyLoad();
  }

  readyLoad() {
    this.urls.forEach((item, index) => {
      const img = new Image();
      img.src = item;
      img.crossOrigin = 'anonymous';
      img.errorNum = 0;

      img.onload = this.onLoad.bind(this, img, index);
      img.onerror = this.onerror.bind(this, img, index);

      this.datas.push({
        img: img,
        w: this.width
      });
    });
  }

  loadSuccess(fn) {
    this.opts.onload = fn;
  }

  loadFail(fn) {
    this.opts.onerror = fn;
  }

  finish(fn) {
    this.opts.cb = fn;
  }

  onLoad(img, index) {
    this.loadCount++;

    this.datas[index].h = this.width / (img.width / img.height);

    this.opts.onload(this.loadCount, this.opts.urls.length);

    this.loadCount === this.opts.urls.length && this.finishLoad();
  }

  onerror(img, index) {
    const { src, addType } = this.removeId(img.src);

    if (img.errorNum >= 3) {
      this.loadCount++;
      this.opts.onerror(src);

      this.datas[index].error = true;

      this.loadCount === this.opts.urls.length && this.finishLoad();
      return
    }

    img.errorNum += 1;
    img.src = src + addType + parseInt(Math.random() * 1000000000000000, 10);
  }

  removeId(src) {
    let addType = '?id=';
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

    return {
      src,
      addType
    }
  }

  finishLoad() {
    this.arrangement();

    this.canvas.width = this.width * this.opts.row;
    this.canvas.height = Math.max.apply(this, this.rows);

    this.draw();

    this.opts.cb(this.canvas);
  }

  arrangement() {
    this.datas = this.datas.filter(item => !item.error && item.h <= this.maxHeight);

    this.datas.sort((a, b) => b.h - a.h);

    this.datas.forEach(item => {
      const min = Math.min.apply(this, this.rows);
      const index = this.rows.indexOf(min);

      item.x = index * this.width;
      item.y = this.rows[index];

      this.rows[index] += item.h;
    });

    let arr = [];
    for (var i = 0; i < this.opts.row; i++) {
      arr.push(this.datas.filter(item => item.x === i * this.width));
    }

    arr.forEach((item, index) => {
      item.sort((a, b) => a.h - b.h);

      let y = 0;
      let x = (arr.length - index - 1) * this.width;
      item.forEach(data => {
        data.y = y;
        data.x = x;
        y += data.h;
      })
    })
  }

  draw() {
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.datas.forEach(item => this.ctx.drawImage(item.img, item.x, item.y, item.w, item.h));
  }
}