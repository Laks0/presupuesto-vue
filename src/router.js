import {createRouter, createWebHistory} from "vue-router";

import MenuPrincipal from "./components/Principal/MenuPrincipal.vue";

const routes = [
	{
		path: "/",
		component: MenuPrincipal,
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

export default router;
