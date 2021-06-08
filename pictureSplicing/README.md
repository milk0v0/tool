## 作用

+ 将传入图片链接按照 [传入参数](#opts) ，按照 *瀑布流* 的排布方式拼接



## 基本用法

```javascript
new PictureSplicing({
    urls: [ 'https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=2496571732,442429806&fm=26&gp=0.jpg', 'https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=2151136234,3513236673&fm=26&gp=0.jpg',  'https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=3566088443,3713209594&fm=26&gp=0.jpg',   'https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=2676935521,922112450&fm=11&gp=0.jpg'],
    width: 200,
    row: 3,
    maxHeight: 600,
    onload: function (loaded, total) { },
    onerror: function (url) { },
    cb: function (canvas) { }
});
```



## <span id="opts">传入参数</span>

+ Object

|    键名     |   类型   | 必填 |                             描述                             |
| :---------: | :------: | :--: | :----------------------------------------------------------: |
|   `urls`    |  Array   |  √   |                     要拼接的图片链接数组                     |
|   `width`   |  Number  |  √   |                        每张图片的宽度                        |
|    `row`    |  Number  |  √   |                        拼接一共多少列                        |
| `maxHeight` |  Number  |  √   |          以 `width` 为宽缩放后，每张图片的最大高度           |
|  `onload`   | Function |  ×   | 每张图片load成功回调<br />回调形参 - 已完成：`loaded`；总数：`total` |
|  `onerror`  | Function |  ×   |   每张图片load失败回调<br />回调形参 - 失败图片链接：`url`   |
|    `cb`     | Function |  ×   |    拼接完成后回调<br />回调形参 - 拼接后的画布：`canvas`     |



## canvas 操作

+ 获取 `base64` - `canvas.toDataURL(type, encoderOptions)`
  + `type` - 图片格式，默认为 `image/png`
  + `encoderOptions` - 在指定图片格式为 `image/jpeg 或` `image/webp的情况下，可以从 0 到 1 的区间内选择图片的质量`。如果超出取值范围，将会使用默认值 `0.92`。
+ 获取 `Blob` - `canvas.toBlob(callback, type, encoderOptions)`
  + `callback` - 回调函数，可获得一个单独的 `Blob` 对象参数。
