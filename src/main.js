import './styles/index.css';
import { start } from './bootstrap/start.js';
import { esc } from './shared/html.js';

start().catch((error) => {
  document.querySelector('#app').innerHTML =
    `<div class="boot">Open ESKD<span>${esc(error.message)}</span></div>`;
});
