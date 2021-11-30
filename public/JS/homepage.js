import { getCount } from './base.js';

getCount();

const products = document.getElementById('products');
const noProduct = document.getElementById('no-product');
const campaigns = document.getElementById('campaigns');
const dots = document.getElementById('dots');
const textes = document.getElementById('text');
let nextpage = 0;

function ajax(src, callback) {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && this.status === 200) {
      const data = JSON.parse(xhr.responseText);
      callback(data);
    } else if (this.status === 400) {
      console.error('ERROR');
    }
  };

  xhr.open('GET', src);
  xhr.send();
}

function bannerRender(banner) {
  let i = 0;
  banner.data.forEach((data) => {
    const campaign = document.createElement('a');
    const dot = document.createElement('div');
    const text = document.createElement('div');

    campaign.classList.add('campaign');
    text.classList.add('text');
    dot.classList.add('dot');
    dot.id = i;
    i += 1;

    campaign.href = `./product.html?id=${data.product_id}`;
    text.textContent = data.story;
    campaign.style = `background-image: url(${data.picture})`;

    campaigns.appendChild(campaign);
    textes.appendChild(text);
    dots.appendChild(dot);
  });

  const allCampaigns = document.getElementsByClassName('campaign');
  allCampaigns[0].classList.add('campaign-active'); // slide: 第一張
  const allDots = Array.from(document.getElementsByClassName('dot'));
  allDots[0].classList.add('dot-active'); // slide: 第一顆
  const allTextes = document.getElementsByClassName('text');
  allTextes[0].classList.add('text-active');

  let slide = 0;

  function campaignChange() {
    const campaignPage = allCampaigns.length - 1;

    setInterval(() => {
      allCampaigns[slide].classList.remove('campaign-active'); // slide： 先移除第一張，五秒後顯示第二張
      allDots[slide].classList.remove('dot-active');
      allTextes[slide].classList.remove('text-active');

      if (slide >= campaignPage) {
        slide = 0;
        allCampaigns[slide].classList.add('campaign-active');
        allDots[slide].classList.add('dot-active');
        allTextes[slide].classList.add('text-active');
      } else {
        slide += 1;
        allCampaigns[slide].classList.add('campaign-active');
        allDots[slide].classList.add('dot-active');
        allTextes[slide].classList.add('text-active');
      }
    }, 5000);
  }

  function clickDot() {
    allDots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const { id } = dot;
        allCampaigns[slide].classList.remove('campaign-active');
        allDots[slide].classList.remove('dot-active');
        allTextes[slide].classList.remove('text-active');

        allCampaigns[id].classList.add('campaign-active');
        allDots[id].classList.add('dot-active');
        allTextes[id].classList.add('text-active');
        slide = id;
      });
    });
  }

  campaignChange();
  clickDot();
}

function render(allProduct) {
  nextpage = allProduct.next_paging;

  const arr = allProduct.data;
  if (arr.length === 0) {
    noProduct.innerHTML = '迷有東西唷，我們在努力進貨惹 > <';
  }

  allProduct.data.forEach((data) => {
    const product = document.createElement('a');
    const pTitle = document.createElement('div');
    const pPrice = document.createElement('div');
    const pColors = document.createElement('div');
    const pImg = document.createElement('img');

    product.classList.add('product');
    pTitle.classList.add('p-title');
    pPrice.classList.add('p-price');
    pColors.classList.add('p-colors');

    product.href = `./product.html?id=${data.id}`;
    pImg.src = data.main_image;
    pImg.alt = 'main_image';

    pTitle.textContent = data.title;
    pPrice.textContent = `TWD.${data.price}`;

    function showColor() {
      for (let i = 0; i < data.colors.length; i += 1) {
        const pColor = document.createElement('div');
        pColor.classList.add('p-color');
        pColor.style.backgroundColor = `#${data.colors[i].code}`;
        pColors.appendChild(pColor);
      }
      return pColors;
    }
    showColor();

    products.appendChild(product);
    product.appendChild(pImg);
    product.appendChild(pColors);
    product.appendChild(pTitle);
    product.appendChild(pPrice);
  });
}

const url = 'https://api.appworks-school.tw/api/1.0/';
const urlBanner = 'https://api.appworks-school.tw/api/1.0/marketing/campaigns';
let tag = '';

ajax(urlBanner, (response) => {
  bannerRender(response);
});

function renderNextPage(nextPaging) {
  ajax(`${url}products/${tag}?paging=${nextPaging}`, (response) => {
    render(response);
  });
}

const address = window.location.search;
if (address === '') {
  tag = 'all';
  ajax(`${url}products/${tag}`, (response) => {
    render(response);
  });
} else if (address === '?tag=women') {
  tag = 'women';
  ajax(`${url}products/${tag}`, (response) => {
    render(response);
  });
} else if (address === '?tag=men') {
  tag = 'men';
  ajax(`${url}products/${tag}`, (response) => {
    render(response);
  });
} else if (address === '?tag=accessories') {
  tag = 'accessories';
  ajax(`${url}products/${tag}`, (response) => {
    render(response);
  });
}

const keyword = window.location.search;
if (keyword.split('=')[0] === '?keyword') {
  ajax(`${url}products/search${keyword}`, (response) => {
    render(response);
  });
}

const body = document.querySelector('body');

function showMore() {
  const moveHeight = window.innerHeight;
  if (moveHeight >= body.getBoundingClientRect().bottom - 90) {
    if (nextpage !== undefined) {
      renderNextPage(nextpage);
      nextpage = undefined; // avoid adding page num without scrolling dwon
    }
  }
}

window.addEventListener('scroll', showMore);

if (localStorage.getItem('cart') == null) {
  localStorage.setItem('cart', JSON.stringify([]));
}
