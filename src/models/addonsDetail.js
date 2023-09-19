// Importar las clases Model y DataTypes de Sequelize
const { Model, DataTypes } = require('sequelize');

// Importar la instancia de Sequelize previamente configurada
const sequelize = require('../config/database'); // Suponiendo que tienes una configuración de Sequelize en '../config/database'

// Definición de la clase de modelo "addonsDetail" que extiende de Sequelize "Model"
class addonsDetail extends Model { }

// Inicializar el modelo "addonsDetail"
addonsDetail.init(
    {
        // Definir los campos de la tabla y sus tipos de datos
        id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        addon_id:{
            type:   DataTypes.INTEGER,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: flase
        },
        price: {
            type: DataTypes.BIGINT,
            allowNull: flase,
            validate: {
                isInt: true,
                min: 0  // si quieres asegurarte de que no haya valores negativos
            }
        },
        status:{
            type: DataTypes.INTEGER,
            allowNull:false
        }
    },
    {
        // Pasar la instancia de Sequelize para la conexión a la base de datos
        sequelize,

        // Especificar el nombre de la tabla en la base de datos (opcional)
        modelName: 'addonsDetail' // Esto establecerá el nombre de la tabla en la base de datos como 'addonsDetail'
    }
);

// Exportar el modelo "addonsDetail" para que pueda ser utilizado en otros archivos
module.exports = addonsDetail;