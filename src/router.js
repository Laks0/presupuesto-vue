import {createRouter, createWebHistory} from "vue-router";

import MenuPrincipal from "./components/Principal/MenuPrincipal.vue";
import EditorPresupuesto from "./components/Presupuestos/EditorPresupuesto.vue";

const routes = [
	{
		path: "/",
		component: MenuPrincipal,
	},

	{
		path: "/presupuesto/edit/:pid",
		component: EditorPresupuesto,
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

export default router;
