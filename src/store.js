import { createStore } from "vuex";
import http from "./http-common";

const store = createStore({
	state: {
		user: {},
		logged: false,
		token: "",
		active: false,
		presupuesto: {},
	},

	mutations: {
		guardarPresupuesto(state, data) {
			state.presupuesto = data;
		},

		login(state, data) {
			state.user = data.usuario;
			state.logged = true;
			state.token = data.token;

			// http.defaults.headers.common["auth-token"] = data.token;
		},

		active(state, data) {
			state.active = data;
		},
	},

	actions: {
		login({commit}, user) {
			return new Promise((resolve, reject) => {
				// Llama a Axios a logearse por la API
				http.post("/login", {
					email: user.email,
					contraseña: user.contraseña,
				})
					.then(res => {
						commit("login", res.data);
						resolve(res);
					})
					.catch(err => {
						reject(err);
					});
			});
		},

		// Función que recibe el presupuesto que queremos usar y se fija si es el mismo que ya tenemos guardado, si no, guarda el nuevo
		checkPresupuesto({commit, state}, id) {
			return new Promise((resolve, reject) => {
				if (state.presupuesto.p_id === parseFloat(id)) {
					resolve(state.presupuesto);
				}

				http.get(`/presupuesto/presid/${id}`)
					.then(res => {
						commit("guardarPresupuesto", res.data[0]);
						resolve(res);
					})
					.catch(err => {
						reject(err);
					});
			});
		},

		checkCookie({commit}) {
			return new Promise((resolve, reject) => {
				http.get("/logged")
					.then(res => {
						commit("active", true);
						if (!res.data.usuario) {
							resolve(res);
							return;
						}

						commit("login", res.data);
						resolve(res);
					})
					.catch(err => {
						reject(err);
					});
			});
		}
	},

	getters: {
		logged: state => state.logged,
		user: state => state.user,
		token: state => state.token,
		active: state => state.active,
		presupuesto: state => state.presupuesto,
	},
})

export default store;
