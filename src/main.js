import { createApp } from 'vue';
import App from './App.vue';
import store from "./store";
import router from "./router";

import "@progress/kendo-ui";
//import "@progress/kendo-theme-bootstrap/dist/all.css";

createApp(App)
	.use(store)
	.use(router)
	.mount("#app");
