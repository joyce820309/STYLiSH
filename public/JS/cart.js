import { getCount } from './base.js';

getCount();

const { localStorage } = window;

if (localStorage.getItem('cart') == null) {
  localStorage.setItem('cart', JSON.stringify([]));
}

document.getElementsByClassName('count')[0].textContent = JSON.parse(
  localStorage.getItem('cart'),
).length;
document.getElementsByClassName('count')[1].textContent = JSON.parse(
  localStorage.getItem('cart'),
).length;

const itemsInCart = JSON.parse(window.localStorage.getItem('cart'));
let items = document.getElementsByClassName('items')[0];
document.getElementsByClassName('title')[0].textContent = `購物車(${itemsInCart.length})`;

function emptyCart() {
  items = document.querySelector('.items');
  const noItem = document.createElement('div');
  const text = document.createTextNode('購物車是空的唷～趕快來購物吧');
  noItem.classList.add('item');
  noItem.appendChild(text);
  items.appendChild(noItem);
}

if (itemsInCart.length === 0) {
  emptyCart();
}

function qtyOption(stock, number) {
  let option = '';
  for (let i = 1; i <= stock; i += 1) {
    if (i === number) {
      option += `<option value="${i}" selected="selected">${i}</option>`;
    } else {
      option += `<option value="${i}">${i}</option>`;
    }
  }
  return option;
}

function itemList(item) {
  let html = '';
  html = `
        <div class="item">
        <img class="item__img" src="https://api.appworks-school.tw/assets/${item.id}/main.jpg">
        <div class="item__detail">
            <div class="item__name">${item.title}</div>
            <div class="item__id">${item.id}</div>
            <div class="item__color">顏色｜${item.colorname}</div>
            <div class="item__size">尺寸｜${item.size}</div>
        </div>
        <div class="item__quantity">
            <div class="mobile-text">數量</div>
            <select class='select__qty'>
                ${qtyOption(item.stock, item.number)}
            </select>
        </div>
        <div class="item__price">
            <div class="mobile-text">單價</div>
            NT.${item.price}
        </div>
        <div class="item__sub">
            <div class="mobile-text">小計</div>
            NT.${item.price * item.number}
        </div>
        <div class="item__remove">
        <img class="remove__icon" src="./images/cart-remove.png">
        </div>
    </div>
    `;
  items.innerHTML += html;
}

itemsInCart.forEach((item) => {
  itemList(item);
});

const subValue = document.querySelector('.sub__value');
const totalValue = document.querySelector('.total__value');
const subValueSpan = document.createElement('span'); //  put real subValue in this span
const totalValueSpan = document.createElement('span'); // put real totalValue in this span
let item = document.getElementsByClassName('item');

function renderSubValue(totalPrice) {
  subValueSpan.innerText = `${totalPrice}`;
  subValue.appendChild(subValueSpan);

  if (Number(totalPrice) === 0) {
    totalValueSpan.innerText = 0;
  } else {
    totalValueSpan.innerText = `${totalPrice + 60}`;
  }
  totalValue.appendChild(totalValueSpan);
}

function calculate() {
  let totalPrice = 0;

  for (let i = 0; i < itemsInCart.length; i += 1) {
    const itemPrice = itemsInCart[i].number * itemsInCart[i].price;
    totalPrice += itemPrice;
  }
  renderSubValue(totalPrice);
}

function removeProduct() {
  items.addEventListener('click', (event) => {
    if (event.target.classList.contains('remove__icon')) {
      item = document.getElementsByClassName('item');
      const removeObject = event.path[2];
      const i = [...item].indexOf(removeObject);

      itemsInCart.splice(i, 1);
      item[i].remove();
      localStorage.setItem('cart', JSON.stringify(itemsInCart));

      window.alert('已從購物車中移除');
      getCount(itemsInCart);
      calculate(itemsInCart);

      if (itemsInCart.length === 0) {
        emptyCart();
      }
      document.getElementsByClassName('title')[0].textContent = `購物車(${itemsInCart.length})`;
    }
  });
}

function changeItemQty() {
  items.addEventListener('change', (event) => {
    if (event.target.classList.contains('select__qty')) {
      item = document.getElementsByClassName('item');
      const selectQty = document.getElementsByClassName('select__qty');
      const object = event.path[2];
      const objectChild = event.path[2].childNodes;
      const i = [...item].indexOf(object); // i for 第幾個item
      const index = selectQty[i].selectedIndex; // index for 選項裡面的第幾個

      itemsInCart[i].number = Number(selectQty[i].options[index].text);
      localStorage.setItem('cart', JSON.stringify(itemsInCart));
      objectChild[9].innerHTML = `
                <div class="mobile-text">小計</div>
                    NT.${Number(objectChild[7].innerHTML.split('NT.')[1]) * Number(event.target.value)}
            `;
      calculate(itemsInCart);
      window.alert('修改數量成功 :) ');
    }
  });
}

removeProduct(itemsInCart);
changeItemQty(itemsInCart);
calculate(itemsInCart);
