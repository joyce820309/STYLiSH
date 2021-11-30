import { getCount } from './base.js';

getCount();

//  ------------------------default code from TapPay ------------------------- \\
TPDirect.setupSDK(12348, 'app_pa1pQcKoY22IlnSXq5m5WP5jFKzoRG58VEXpT7wU62ud7mMbDOGzCYIlzzLF', 'sandbox');

TPDirect.card.setup({
  fields: {
    number: {
      element: '#card-number',
      placeholder: '**** **** **** ****',
    },
    expirationDate: {
      element: '#card-expiration-date',
      placeholder: 'MM/YY',
    },
    ccv: {
      element: '#card-ccv',
      placeholder: 'ccv',
    },
  },

  styles: {
    input: {
      color: 'gray',
    },
    ':focus': {
      color: 'black',
    },
    '.valid': {
      color: 'green',
    },
    '.invalid': {
      color: 'red',
    },
  },
});
let token;
let prime;
let body;

function updateApiList() {
  const itemsInCart = JSON.parse(localStorage.getItem('cart'));
  const newItem = {};
  const list = itemsInCart.map((item) => {
    newItem.id = item.id;
    newItem.name = item.title;
    newItem.price = item.price;
    newItem.color = {
      code: item.color,
      name: item.colorname,
    };
    newItem.size = item.size;
    newItem.qty = item.number;
    return newItem;
  });
  return list;
}

const checkForm = () => {
  const name = document.getElementById('name').value;
  let email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const address = document.getElementById('address').value;
  const mailRegular = /^\w+((\.|-)\w+)*@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;
  const phoneRegular = /^[0]{1}[9]{1}[0-9]{8}/;
  const itemsInCart = JSON.parse(localStorage.getItem('cart'));

  // check payment into via TapPay
  function onSubmit() {
    const tappayStatus = TPDirect.card.getTappayFieldsStatus(); // 取得 TapPay Fields 的 status
    // 確認是否可以 getPrime
    if (tappayStatus.canGetPrime === false) {
      const { status } = tappayStatus;
      if (status.number === 1 && status.expiry === 1 && status.ccv === 1) {
        alert('請記得輸入信用卡資料唷');
      } else if (tappayStatus.status.number !== 0) {
        alert('信用卡號碼有誤喔');
      } else if (tappayStatus.status.expiry !== 0) {
        alert('有效期限有誤喔');
      } else if (tappayStatus.status.ccv !== 0) {
        alert('安全碼有誤喔');
      }
      return;
    }

    // get signin token from API
    function getToken(res) {
      const provider = res.authResponse.graphDomain;
      const { accessToken } = res.authResponse;
      const url = 'https://api.appworks-school.tw/api/1.0/user/signin';
      const headers = { 'Content-Type': 'application/json' };
      const signInBody = {
        provider: `${provider}`,
        access_token: `${accessToken}`,
      };

      fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(signInBody),
      })
        .then((response) => response.json())
        .catch((error) => console.error('Error:', error))
        .then((data) => {
          token = data.data.access_token;
          getPurchaseOrder(); // eslint-disable-line no-use-before-define
        });
    }

    function checkLogin() {
      FB.getLoginStatus((res) => {
        if (res.status === 'connected') {
          getToken(res);
        } else if (res.status === 'not_authorized' || res.status === 'unknown') alert('要先登入會員才能結帳喔！');
      });
    }

    TPDirect.card.getPrime((result) => {
      if (result.status !== 0) {
        alert(`信用卡資料取得異常：${result.msg}`);
        return;
      }
      prime = result.card.prime;
      checkLogin();
    });
  }

  if (itemsInCart.length === 0) {
    alert('購物車內沒有東西唷 > <');
    window.location = './';
  } else if (name === '') {
    alert('請填寫收件人姓名');
  } else if (email === '') {
    alert('請填寫email');
  } else if (email !== '' && mailRegular.test(email) !== true) {
    alert('Oh! email格式錯誤');
    email = '';
  } else if (phone === '') {
    alert('請填寫手機號碼');
  } else if (phone !== '' && phoneRegular.test(phone) !== true) {
    alert('Oh! 手機號碼格式錯誤');
  } else if (address === '') {
    alert('請填寫收件地址');
  } else {
    onSubmit();
  }
};

const checkout = document.getElementById('checkout');

checkout.addEventListener(('click'), () => {
  checkForm();
});

window.fbAsyncInit = function () {
  FB.init({
    appId: '541448576965452',
    cookie: true,
    xfbml: true,
    version: 'v11.0',
  });
};

(function (d, s, id) {
  const fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) { return; }
  const js = d.createElement(s); js.id = id;
  js.src = 'https://connect.facebook.net/en_US/sdk.js';
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

updateApiList();

function getPurchaseOrder() {
  const url = 'https://api.appworks-school.tw/api/1.0/order/checkout';
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const spans = document.getElementsByTagName('span');
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const address = document.getElementById('address').value;
  const time = document.querySelector('input[name="time"]:checked').value;

  body = {
    prime: `${prime}`,
    order: {
      shipping: 'delivery',
      payment: 'credit_card',
      subtotal: Number(`${spans[0].innerHTML}`),
      freight: 60,
      total: Number(`${spans[2].innerHTML}`),
      recipient: {
        name: `${name}`,
        phone: `${phone}`,
        email: `${email}`,
        address: `${address}`,
        time: `${time}`,
      },
      list: updateApiList(),
    },
  };

  fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

    .then((res) => res.json())
    .catch((err) => console.error('ERROR:', err))
    .then(
      (res) => {
        window.location.href = `./thanks.html?number=${res.data.number}`;
      },
      localStorage.removeItem('cart'),
    );
}
