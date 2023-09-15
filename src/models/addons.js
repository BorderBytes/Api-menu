// Importar las clases Model y DataTypes de Sequelize
const { Model, DataTypes } = require('sequelize');

// Importar la instancia de Sequelize previamente configurada
const sequelize = require('../config/database'); // Suponiendo que tienes una configuración de Sequelize en '../config/database'

// Definición de la clase de modelo "addons" que extiende de Sequelize "Model"
class addons extends Model { }

// Inicializar el modelo "addons"
addons.init(
    {
        // Definir los campos de la tabla y sus tipos de datos
        id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false, // No se permite un valor nulo para este campo
        },
        min: {
            type: DataTypes.INTEGER,
        },
        max: {
            type: DataTypes.INTEGER,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false, // No se permite un valor nulo para este campo
        }
    },
    {
        // Pasar la instancia de Sequelize para la conexión a la base de datos
        sequelize,

        // Especificar el nombre de la tabla en la base de datos (opcional)
        modelName: 'addons' // Esto establecerá el nombre de la tabla en la base de datos como 'addons'
    }
);

// Exportar el modelo "addons" para que pueda ser utilizado en otros archivos
module.exports = addons;