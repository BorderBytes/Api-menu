// Nos conectamos a la bd
const connection = require("../config/database.js");
// Función para enviar correos
const path = require("path");
require("dotenv").config({
    path: path.resolve(__dirname, "../../.env")
});

// Funciones exec
const {exec} = require("child_process");

exports.gitStatus = async (req, res) => {
    exec("git rev-parse HEAD", (error, currentCommitHash, stderr) => {
        if (error) {
            console.error(`Error al ejecutar 'git rev-parse HEAD': ${
                error.message
            }`);
            return res.status(500).json({error: "Error al obtener el hash del commit actual."});
        }
        if (stderr) {
            console.error(`Salida de error de 'git rev-parse HEAD': ${stderr}`);
            return res.status(500).json({error: "Error al obtener el hash del commit actual."});
        }

        // Modifica la instrucción 'git log' para incluir la fecha del commit en ISO 8601.
        exec('git log origin/main..HEAD --pretty=format:"%h %cd" --date=iso-strict', (error, stdout, stderr) => {
            if (error) {
                console.error(`Error al ejecutar 'git log': ${
                    error.message
                }`);
                return res.status(500).json({error: "Error al obtener la lista de commits sin hacer pull."});
            }

            // El resultado de 'git log' estará en stdout.
            const commitLog = stdout;

            // Divide las líneas del resultado del registro en un arreglo.
            const logEntries = commitLog.split("\n");

            // Calcula el número de commits sin hacer pull.
            const numberOfCommitsWithoutPull = logEntries.length - 1;
            // Restamos 1 para excluir la última línea en blanco.

            // Obtiene la fecha del último commit.
            const lastCommitDate = logEntries[0] ?. split(" ")[1] || "";
            // La primera línea tiene la fecha del commit más reciente.

            // Envía los resultados como respuesta al cliente.
            res.status(200).json({numberOfCommitsWithoutPull, currentCommitHash: currentCommitHash.trim(), lastCommitDate});
        });
    });
};
