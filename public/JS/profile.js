import { getCount, getUrl, memberLogin } from './base.js';

getCount();

let body;

const loginApi = getUrl(['user', 'signin']);

function renderUserInfo(res) {
  const {
    user: { name, email, picture },
  } = res.data;
  document.querySelector('.profile__name').textContent = name;
  document.querySelector('.profile__email').textContent = email;
  document.querySelector('.profile__pic').src = picture;
}

function ajaxPost(src, ajaxBody, callback) {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      callback(JSON.parse(xhr.responseText));
    }
  };
  xhr.open('POST', src);
  xhr.setRequestHeader('Content-type', 'application/json');
  xhr.send(ajaxBody);
}

function statusChangeCallback(response) {
  if (response.status === 'connected') {
    const { graphDomain, accessToken } = response.authResponse;
    body = JSON.stringify({
      provider: graphDomain,
      access_token: accessToken,
    });
    ajaxPost(loginApi, body, (res) => renderUserInfo(res));
  } else {
    window.location.href = './';
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

  setTimeout(() => {
    FB.getLoginStatus((res) => {
      statusChangeCallback(res);
    });
  }, 500);
};

(function (d, s, id) {
  const fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) { return; }
  const js = d.createElement(s); js.id = id;
  js.src = 'https://connect.facebook.net/en_US/sdk.js';
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

//  ---------------------------------------------------------- \\

const logoutBtn = document.querySelector('.logout__btn');

function logout() {
  FB.logout((res) => {
    console.log(res);
  });
  alert('成功登出囉！');
  window.location.href = './index.html';
}

memberLogin.forEach((member) => {
  member.addEventListener('click', () => {
    window.location.href = './profile.html';
  });
});
logoutBtn.addEventListener('click', logout);
