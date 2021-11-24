import { createStore } from "vuex";
import http from "./http-common";

const store = createStore({
	state: {
		user: {},
		logged: false,
	},

	mutations: {
		login(state, user) {
			state.user = user;
			state.logged = true;
		}
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
						console.log(res);
						resolve(res);
					})
					.catch(err => {
						reject(err);
					});
			});
		},
	},

	getters: {
		isLogged: state => state.logged,
	},
})

export default store;
