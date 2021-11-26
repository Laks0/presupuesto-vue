import { createApp } from 'vue';
import App from './App.vue';
import store from "./store";

import "@progress/kendo-ui";
//import "@progress/kendo-theme-bootstrap/dist/all.css";

createApp(App).use(store).mount('#app');
