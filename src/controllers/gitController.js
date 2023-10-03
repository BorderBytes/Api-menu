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
    exec('git rev-parse HEAD', (error, commit_hash, stderr) => {
        if (error) {
            console.error(`Error al ejecutar 'git rev-parse HEAD': ${
                error.message
            }`);
            return res.status(500).json({error: 'Error al obtener el hash del commit actual.'});
        }
        if (stderr) {
            console.error(`Salida de error de 'git rev-parse HEAD': ${stderr}`);
            return res.status(500).json({error: 'Error al obtener el hash del commit actual.'});
        }

        // Modifica la instrucción 'git log' para obtener la fecha del commit actual.
        exec('git log -1 --pretty=format:"%cd" --date=iso-strict', (error, stdout, stderr) => {
            if (error) {
                console.error(`Error al ejecutar 'git log': ${
                    error.message
                }`);
                return res.status(500).json({error: 'Error al obtener la fecha del commit actual.'});
            }

            const commit_date = stdout;
            // La salida directa del comando contiene la fecha del commit actual.

            // Modifica la instrucción 'git log' para obtener la lista de commits no sincronizados.
            exec('git log origin/main..HEAD --oneline', (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error al ejecutar 'git log' para commits no sincronizados: ${
                        error.message
                    }`);
                    return res.status(500).json({error: 'Error al obtener la lista de commits sin hacer pull.'});
                }

                // El resultado de 'git log' estará en stdout.
                const commitLog = stdout;

                // Divide las líneas del resultado del registro en un arreglo.
                const logEntries = commitLog.split('\n');

                // Calcula el número de commits sin hacer pull.
                const new_commits = logEntries.length - 1;
                // Restamos 1 para excluir la última línea en blanco.

                // Envía los resultados como respuesta al cliente.
                res.status(200).json({new_commits, commit_hash: commit_hash.trim(), commit_date});
            });
        });
    });
};
exports.gitHistory = async (req, res) => {
    // Usa el comando 'git log' con un formato personalizado para obtener los detalles deseados de los últimos commits.
    exec('git log -n 5 --pretty=format:"%H|%an|%ae|%cd|%s" --date=iso-strict', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error al ejecutar 'git log': ${error.message}`);
        return res.status(500).json({ error: 'Error al obtener los últimos commits.' });
      }
      if (stderr) {
        console.error(`Salida de error de 'git log': ${stderr}`);
        return res.status(500).json({ error: 'Error al obtener los últimos commits.' });
      }
  
      // Divide la salida del comando en líneas, donde cada línea representa un commit.
      const logLines = stdout.split('\n');
  
      // Transforma cada línea en un objeto con los detalles del commit.
      const commits = logLines.map(line => {
        const [hash, authorName, authorEmail, date, message] = line.split('|');
        return {
          hash,
          author: {
            name: authorName,
            email: authorEmail
          },
          date,
          message
        };
      });
  
      // Envía los detalles de los commits como respuesta al cliente.
      res.status(200).json(commits);
    });
  };
