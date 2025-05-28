// 回退強制重整強制重整
window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
      window.location.reload();
    }
});

//取得高度
function setVH() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

//跳轉動畫觸發
document.getElementById('getStart').addEventListener('click', function () {
    const button = this;
    button.classList.add('expand');
    document.getElementById('aboutUs').style.display = 'none';

    button.addEventListener('animationend', function handleAnimationEnd() {
        button.removeEventListener('animationend', handleAnimationEnd);
        window.location.href = 'https://harrylin0312.github.io/face-recognition/login/';
    });
});

window.addEventListener('load', setVH);
window.addEventListener('resize', setVH);
