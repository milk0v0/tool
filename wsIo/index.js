/**
 * (1)建立连接后，每25s向服务端发送ping心跳信息，收到回复png后重置定时器，注意，每次与服务的通信(如数据上报)也算一次心跳，也可重置定时器
 * (2)若第一次心跳包括通信)未收到回复/发送失败，3s后在发送一次心跳，排除由于短时网络异常导致不通的原因，若还是未收到回复/发送失败，关闭连接，重新建立连接，若建立连接失败，10s，30s后再尝试建立，若失败，不再重试，提示用户刷新页面.
 */

function noop() {}

export default class WsIo {
  /** 避免ws重复连接 */
  isOpen = false;
  /** 是否连接成功 */
  connectSuccess = false;
  /** 是否支持 */
  support = true;
  /** 连接时函数 */
  openFn = noop;
  /** 关闭时函数 */
  closeFn = [];
  /** 收到数据时函数 */
  messageFn = [];
  /** 连接因错误而关闭时触发 */
  errFn = noop;
  /** 确保连接定时器 */
  timeOut = null;
  heartbeatTimeOut = null;

  /** 准备重连 */
  reconnectionReady = false;
  /** 重复连接错误次数 */
  errorNum = 0;

  constructor(url_generator, opts) {
    if (!window.WebSocket) return (this.support = false);

    this.opts = opts;
    this.url_generator = typeof url_generator === 'string' ? () => url_generator : url_generator;
  }

  init() {
    if (this.isOpen) return;
    this.isOpen = true;
    this.ws = new WebSocket(this.url_generator());

    this.ws.onopen = e => {
      this.errorNum = 0;
      this.openFn(e);
    };

    this.ws.onclose = e => {
      if (!this.connectSuccess) return;

      this.closeClear();
      /** 手动关闭不管 */
      if (e.code === 1000) return;
      this.closeFn.forEach(fn => fn(e));
    };

    this.ws.onmessage = e => {
      this.clearTimeOut();
      if (e.data === 'pong') return;

      const data = JSON.parse(e.data);
      if (data.routin === 'connectSuccess') {
        this.connectSuccess = true;
        this.heartbeat();
      }

      if (!this.connectSuccess) return;

      this.messageFn.forEach(fn => fn(JSON.parse(e.data)));
    };

    this.ws.onerror = err => {
      this.errorNum++;

      let time = 0;
      switch (this.errorNum) {
        case 1:
          time = 10000;
          break;
        case 2:
          time = 30000;
          break;
        default:
          this.errFn(err);
          return;
      }

      setTimeout(() => {
        this.reconnection();
      }, time);
    };
  }

  /** 心跳 */
  heartbeat() {
    this.send('ping');

    this.heartbeatTimeOut = setTimeout(() => {
      this.heartbeat();
    }, 25000);
  }

  clearTimeOut() {
    this.reconnectionReady = false;
    clearTimeout(this.timeOut);
    this.timeOut = null;
  }

  closeClear() {
    clearTimeout(this.heartbeatTimeOut);
    this.isOpen = false;
    this.connectSuccess = false;
    this.clearTimeOut();
  }

  /** 不支持 ws 情况 */
  fail(fn) {
    if (this.support) return;
    fn();
  }

  /** ws 连接成功时触发 */
  open(fn) {
    this.openFn = fn;
  }

  /** ws 连接被关闭时触发 */
  close(fn) {
    this.closeFn.push(fn);
  }

  /** ws 收到数据时触发 */
  message(fn) {
    this.messageFn.push(fn);
  }

  /** ws 收到数据时触发 */
  error(fn) {
    this.errFn = fn;
  }

  /** 事件 - 关闭 ws */
  closeWs() {
    this.closeClear();
    this.ws.close();
  }

  /** 事件 - 发送 ws */
  send(data) {
    if (!this.connectSuccess) return;

    this.ws.send(data);
    if (!this.timeOut) {
      this.timeOut = setTimeout(() => {
        if (this.reconnectionReady) {
          this.reconnection();
          return;
        }

        this.reconnectionReady = true;
        this.send('ping');
      }, 3000);
    }
  }

  reconnection() {
    this.closeWs();

    this.init();
  }
}
