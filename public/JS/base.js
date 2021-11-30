const memberLogin = document.querySelectorAll('.member');

function login() {
  FB.login(
    (res) => {
      if (res.status === 'connected') {
        alert('成功登入囉～');
      } else {
        alert('登入失敗，請再登入一次');
      }
      statusChangeCallback(res); // eslint-disable-line no-use-before-define
    }, { scope: 'public_profile, email' },
  );
}

function redirect() {
  window.location.href = './profile.html';
}

function statusChangeCallback(res) {
  if (res.status === 'connected') {
    memberLogin.forEach((e) => {
      e.removeEventListener('click', login);
      e.addEventListener('click', redirect);
    });
  } else {
    memberLogin.forEach((e) => {
      e.addEventListener('click', login);
    });
  }
}

window.fbAsyncInit = function () {
  FB.init({
    appId: '541448576965452',
    cookie: true,
    xfbml: true,
    version: 'v11.0',
  });

  FB.AppEvents.logPageView();

  // Called after the JS SDK has been initialized 檢查狀態
  FB.getLoginStatus((res) => {
    statusChangeCallback(res);
  });
};

(function (d, s, id) {
  const fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) { return; }
  const js = d.createElement(s); js.id = id;
  js.src = 'https://connect.facebook.net/en_US/sdk.js';
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function getUrl(pathname, searchParams = '') {
  const url = new URL('https://api.appworks-school.tw/api/1.0');
  pathname.forEach((p) => {
    url.pathname += `/${p}`;
  });
  url.search = new URLSearchParams(searchParams);
  return url;
}

const getCount = () => {
  const count = document.getElementsByClassName('count');
  const storage = window.localStorage;
  for (let i = 0; i < count.length; i += 1) {
    if (!storage.getItem('cart')) {
      storage.setItem('cart', JSON.stringify([]));
      count[i].innerText = 0;
    } else {
      count[i].innerText = JSON.parse(storage.getItem('cart')).length;
    }
  }
};

export { getCount, getUrl, memberLogin };
