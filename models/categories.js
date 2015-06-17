// Estructura del objeto que hace de interface con la tabla
// Categories de la BBDD. Tiene relación uno a uno con dicha tabla.
module.exports = function(sequelize, DataTypes) {
	return sequelize.define('Categories', {
		categoria : {
			type : DataTypes.STRING,
			validate : {
				notEmpty : {
					msg : '-> Falta categoría'
				}
			}
		}
	});
}