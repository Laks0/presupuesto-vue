class PresupuestoLog {
	accion;
	aCalcular = [];
	estaticoACambiar;
	agregarEstatico;
	logueado = false;
	info = {};

	constructor(accion) {
		this.accion = accion;
	}
}

module.exports = PresupuestoLog;
