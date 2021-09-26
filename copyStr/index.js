/**
 * 
 * @param {String} id 复制指定 id 的 内容
 * @param {String} attr id ? id 的 【innerText】或自选（例 innerHTMl） : 复制内容
 */

function copyStr(id, attr) {
  let target = null;

  if (attr) {
    target = document.createElement("div");
    target.id = "tempTarget";
    target.style.opacity = "0";

    if (id) {
      let curNode = document.querySelector("#" + id);
      target.innerText = curNode[attr];
    } else {
      target.innerText = attr;
    }

    document.body.appendChild(target);
  } else {
    target = document.querySelector("#" + id);
  }

  try {
    let range = document.createRange();
    range.selectNode(target);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand("copy");
    window.getSelection().removeAllRanges();
  } catch (e) {
    console.log("复制失败");
  }

  if (attr) {
    // remove temp target
    target.parentElement.removeChild(target);

    target = null;
  }
}