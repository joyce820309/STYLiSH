import { getCount } from './base.js';

getCount();

const number = document.querySelector('#number');
const getNumber = new URLSearchParams(window.location.search).get('number');

number.appendChild(document.createTextNode(getNumber));
