import {createRouter, createWebHistory} from "vue-router";

import MenuPrincipal from "./components/Principal/MenuPrincipal.vue";
import EditorPresupuesto from "./components/Presupuestos/EditorPresupuesto.vue";

const routes = [
	{
		path: "/",
		component: MenuPrincipal,
		meta: {
			title: "Dataobra",
		},
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

router.beforeEach((to, _, next) => {
	if (to.meta.title)
		document.title = to.meta.title;

	next();
});

export default router;
