import { getCount } from './base.js';

getCount();

const product = document.getElementById('product');
const urlId = window.location.href;
const id = urlId.split('?id=')[1];
const urlProduct = `https://api.appworks-school.tw/api/1.0/products/details?id=${id}`;
let itemsInCart = [];

// Handle Product Variants
const colorBtn = document.getElementsByClassName('product-color');
const colorBtnSelect = document.getElementsByClassName('product-color-select');
const sizeBtn = document.getElementsByClassName('product-size');
const sizeBtnSelect = document.getElementsByClassName('product-size-select');
const outOfSize = document.getElementsByClassName('product-disable');
const count = document.querySelectorAll('.count');
let qty;
let maxQty;
let disableSize;
let data;

function ajax(src, callback) {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && this.status === 200) {
      data = JSON.parse(xhr.responseText);
      callback(data);
    } else if (this.status === 400) { // Client Error Response: 400
      console.error('ERROR');
    }
  };
  xhr.open('GET', src);
  xhr.send();
}

const keyword = window.location.search;
if (keyword.split('=')[0] === '?keyword') {
  window.location.href = `./index.html${keyword}`;
}

function noSize() {
  const selectC = document.querySelector('.product-color-select');
  const colorCode = selectC.dataset.color;

  for (let i = 0; i < data.variants.length; i += 1) {
    const stock = data.variants;
    if (stock[i].color_code === colorCode && stock[i].stock === 0) {
      disableSize = stock[i].size;
      document.querySelector(`[data-size~=${disableSize}]`).classList.add('product-disable');
      return;
    }
  }
}

function defaultQty() {
  if (qty > 1) {
    qty = 1;
    document.querySelector('.qty').innerHTML = qty;
  }
}

function getMaxQty() {
  const selectC = document.querySelector('.product-color-select');
  const colorCode = selectC.dataset.color;
  const selectS = document.querySelector('.product-size-select');
  const sizeCode = selectS.dataset.size;

  for (let i = 0; i < data.variants.length; i += 1) {
    const { stock } = data.variants[i];
    if (data.variants[i].color_code === colorCode && data.variants[i].size === sizeCode) {
      maxQty = stock;
      console.log(`maxQty: ${maxQty}`);
      return;
    }
  }
}

function selectSize() {
  for (let i = 0; i < sizeBtn.length; i += 1) {
    sizeBtn[i].addEventListener('click', (event) => {
      if (sizeBtnSelect.innerHTML !== event.target.innerHTML) {
        defaultQty();
      }
      if (!event.target.classList.contains('product-disable')) {
        sizeBtnSelect[0].classList.remove('product-size-select');
        sizeBtn[i].classList.add('product-size-select');
      }

      getMaxQty();
    });
  }
}

function removeDisable() {
  if (document.querySelector(`[data-size~=${disableSize}]`)) {
    document.querySelector(`[data-size~=${disableSize}]`).classList.remove('product-disable');
  }
}

function selectColor() {
  for (let i = 0; i < colorBtn.length; i += 1) {
    colorBtn[i].addEventListener('click', (event) => {
      // fun1：click another colorBtn, qty will be 1 & click same colorBtn, qty keep the same
      if (colorBtnSelect.innerHTML !== event.target.innerHTML) {
        defaultQty();
      }

      colorBtnSelect[0].classList.remove('product-color-select');
      colorBtn[i].classList.add('product-color-select');
      getMaxQty();
      removeDisable();
      noSize();
      if (document.querySelector('.product-size-select').classList.contains('product-disable')) {
        document.querySelector('.product-disable').classList.remove('product-size-select');

        for (let j = 0; j < sizeBtn.length; j += 1) {
          if (!sizeBtn[j].classList.contains('product-disable')) {
            sizeBtn[j].classList.add('product-size-select');
            break;
          }
        }
      }
    });
  }
}

const qtyBox = document.getElementsByClassName('product-qty');

function changeQty() {
  qtyBox[0].addEventListener('click', (event) => {
    qty = Number(document.getElementsByClassName('qty')[0].innerText);

    if (event.target.matches('#increase') && qty < maxQty) {
      qty += 1;
      document.querySelector('.qty').innerHTML = qty;
    } else if (event.target.matches('#decrease')) {
      qty -= 1;
      if (qty < 1) {
        qty = 1;
      }
      document.querySelector('.qty').innerHTML = qty;
    }
  });
}

function addItemToCart(addToCartBtn) {
  itemsInCart = JSON.parse(localStorage.getItem('cart')) || [];

  addToCartBtn.addEventListener('click', () => {
    const selectItem = {};
    selectItem.title = data.title;
    selectItem.id = data.id;
    selectItem.price = data.price;
    selectItem.color = colorBtnSelect[0].dataset.color;
    selectItem.colorname = colorBtnSelect[0].dataset.colorname;
    selectItem.size = sizeBtnSelect[0].innerHTML;
    selectItem.number = Number(document.querySelector('.qty').innerText);
    selectItem.stock = maxQty;

    console.log(`itemsInCart: ${itemsInCart}`);
    const sameItem = itemsInCart
      .filter((item) => item.title === selectItem.title)
      .filter((item) => item.color === selectItem.color)
      .filter((item) => item.size === selectItem.size);

    if (sameItem.length === 0) {
      itemsInCart.push(selectItem);
      window.alert('已加入購物車！');
      defaultQty();
    } else {
      itemsInCart.map((item) => {
        if (item.title === selectItem.title && item.color === selectItem.color) {
          if (item.size === selectItem.size) {
            if (Number(item.number) + Number(selectItem.number) >= maxQty) {
              const it = item;
              it.number = maxQty;
            } else {
              const it = item;
              it.number = Number(selectItem.number) + Number(item.number);
            }
          }
        }
        return item;
      });

      window.alert('已更新商品數量！');
      defaultQty();
    }
    localStorage.setItem('cart', JSON.stringify(itemsInCart));

    for (let i = 0; i < count.length; i += 1) {
      count[i].innerHTML = itemsInCart.length;
    }
  });
}

const mainImg = document.createElement('img');
const detailVariants = document.createElement('section');
const productDetail = document.createElement('div');
const productTitle = document.createElement('div');
const productId = document.createElement('div');
const productPrice = document.createElement('div');
const productVariants = document.createElement('div');
let productVariant = document.createElement('div');
let productVartag = document.createElement('div');
const productColors = document.createElement('div');
const productSizes = document.createElement('div');
const productVarqty = document.createElement('div');
const productQty = document.createElement('div');
const decrease = document.createElement('button');
const increase = document.createElement('button');
const addToCart = document.createElement('button');
const productNote = document.createElement('div');
const productTexture = document.createElement('div');
const productDescription = document.createElement('div');
const productWash = document.createElement('div');
const productPlace = document.createElement('div');
const moreInfo = document.createElement('section');
const productHr = document.createElement('div');
const productStory = document.createElement('div');
const imgContainer = document.createElement('div');

function render(productInfo) {
  data = productInfo.data;

  const createMainImg = () => {
    mainImg.className = 'product-main-img';
    mainImg.src = data.main_image;
    mainImg.alt = 'main_Img';
    product.appendChild(mainImg);
  };
  createMainImg();

  detailVariants.className = 'detail-variants';
  product.appendChild(detailVariants);
  productDetail.className = 'product-detail';
  detailVariants.appendChild(productDetail);

  productTitle.className = 'product-title';
  productTitle.textContent = data.title;
  productId.className = 'product-id';
  productId.textContent = data.id;
  productPrice.className = 'product-price';
  productPrice.textContent = `TWD.${data.price}`;

  productDetail.appendChild(productTitle);
  productDetail.appendChild(productId);
  productDetail.appendChild(productPrice);

  productVariants.className = 'product-variants';
  detailVariants.appendChild(productVariants);
  productVariant.className = 'product-variant';
  productVariants.appendChild(productVariant);

  productVartag.className = 'product-var-tag';
  productVartag.textContent = '顏色';
  productVariant.appendChild(productVartag);

  productColors.className = 'product-colors';
  productVariant.appendChild(productColors);

  function showColor() {
    for (let i = 0; i < data.colors.length; i += 1) {
      const productColor = document.createElement('span');
      productColor.classList.add('product-color');
      productColor.style.backgroundColor = `#${data.colors[i].code}`;
      productColor.dataset.color = data.colors[i].code;
      productColor.dataset.colorname = data.colors[i].name;
      productColors.appendChild(productColor);
    }
    return productColors;
  }
  showColor();

  productVariant = document.createElement('div');
  productVariant.className = 'product-variant';
  productVariants.appendChild(productVariant);

  productVartag = document.createElement('div');
  productVartag.className = 'product-var-tag';
  productVartag.textContent = '尺寸';
  productVariant.appendChild(productVartag);

  productSizes.className = 'product-sizes';
  productVariant.appendChild(productSizes);

  function showSize() {
    for (let i = 0; i < data.sizes.length; i += 1) {
      const productSize = document.createElement('span');
      productSize.className = 'product-size';
      productSize.textContent = `${data.sizes[i]}`;
      productSize.dataset.size = data.sizes[i];
      productSizes.appendChild(productSize);
    }
    return productSizes;
  }

  showSize();

  const createProductQty = () => {
    productVariant = document.createElement('div');
    productVariant.className = 'product-variant';
    productVariants.appendChild(productVariant);

    productVarqty.className = 'product-var-qty';
    productVarqty.textContent = '數量';
    productVariant.appendChild(productVarqty);

    productQty.className = 'product-qty';
    productVariant.appendChild(productQty);

    decrease.id = 'decrease';
    decrease.textContent = '-';
    productQty.appendChild(decrease);

    qty = document.createElement('span');
    qty = document.createElement('span');
    qty.className = 'qty';
    qty.textContent = '1';
    productQty.appendChild(qty);

    increase.id = 'increase';
    increase.textContent = '+';
    productQty.appendChild(increase);
  };
  createProductQty();

  const createCartNoteTexture = () => {
    addToCart.id = 'add-to-cart';
    addToCart.textContent = ' 加入購物車';
    productVariants.appendChild(addToCart);

    productNote.className = 'product-note';
    productNote.textContent = data.note;
    productVariants.appendChild(productNote);

    productTexture.className = 'product-texture';
    productTexture.textContent = data.texture;
    productVariants.appendChild(productTexture);
  };
  createCartNoteTexture();
  const createDesWashPlace = () => {
    productDescription.className = 'product-description';
    productDescription.textContent = data.description;
    productVariants.appendChild(productDescription);

    productWash.className = 'product-wash';
    productWash.textContent = `清洗：${data.wash}`;
    productVariants.appendChild(productWash);

    productPlace.className = 'product-place';
    productPlace.textContent = `產地：${data.place}`;
    productVariants.appendChild(productPlace);
  };
  createDesWashPlace();

  const createMoreInfo = () => {
    moreInfo.className = 'more-info';
    product.appendChild(moreInfo);

    productHr.className = 'product-hr';
    productHr.textContent = '更多產品資訊';
    moreInfo.appendChild(productHr);

    productStory.className = 'product-story';
    productStory.textContent = data.story;
    moreInfo.appendChild(productStory);
  };
  createMoreInfo();

  imgContainer.className = 'img-container';
  moreInfo.appendChild(imgContainer);

  function showImg() {
    for (let i = 0; i < data.images.length; i += 1) {
      const productImg = document.createElement('img');
      productImg.className = 'product-img';
      productImg.src = data.images[i];
      productImg.alt = 'product_Img';
      imgContainer.appendChild(productImg);
    }
  }

  showImg();

  colorBtn[0].classList.add('product-color-select');
  sizeBtn[0].classList.add('product-size-select');

  selectColor();
  selectSize();
  noSize();

  const addToCartBtn = document.getElementById('add-to-cart');
  addItemToCart(addToCartBtn);

  if (document.querySelector('.product-size-select').classList.contains('product-disable')) {
    outOfSize[0].classList.remove('product-size-select');

    for (let i = 0; i < sizeBtn.length; i += 1) {
      if (!sizeBtn[i].classList.contains('product-disable')) {
        sizeBtn[i].classList.add('product-size-select');
        break;
      }
      sizeBtn[i + 1].classList.add('product-size-select');
    }
  }

  getMaxQty();
  changeQty();
}

window.onload = function () {
  if (keyword.split('=')[0] === '?id') {
    ajax(`${urlProduct}${keyword}`, render);
  }
};
