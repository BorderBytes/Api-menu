// Nos conectamos a la bd
const connection = require('../config/database.js');
// Incluimos las funciones
const {calculateExecutionTime, sendJsonResponse} = require('../utils/utilsCRUD');
// Mensaje estandar de error
const error_message = 'Error in mysql query';
// Mensaje estandar consulta completa
const success_message = null;
// Mensaje estanadar sin resultados
const no_data_message = null;
// Libreria de iamgenes
const multer = require('multer');
const sharp = require('sharp');
const mkdirp = require('mkdirp'); // Asegúrate de instalar este paquete para crear directorios de manera recursiva
const path = require('path');
const fs = require('graceful-fs');
const imagesDirectory = path.join(__dirname, '..', 'public', 'images/categories');
const {v4: uuidv4} = require('uuid');
const bcrypt = require('bcryptjs');
// Configuración de Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, imagesDirectory) // Directorio donde se guardarán las imágenes.
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)) // Se genera un nombre de archivo único con timestamp + extensión original.
    }
})
const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/; // Tipos de archivos permitidos
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Error: Solo se admiten imágenes.');
    }
};
const upload = multer({storage: storage, fileFilter: fileFilter});

exports.getInfoBusiness = async (req, res) => {
    try {
        const fetchProductByName = () => {
            return new Promise((resolve, reject) => {
                connection.query(
                    'SELECT name,phone,image,image_cover FROM configuration',
                    async (error, results) => {
                        if (error) {
                            reject(new Error('Error al obtener el nombre: ' + error.message));
                        } else {
                            const productInfo = results[0];

                            // For image
                            const imagePath = path.join(__dirname, '..', 'public', 'images/business', productInfo.image);
                            if (fs.existsSync(imagePath)) {
                                const files = fs.readdirSync(imagePath);
                                const originalFile = files.find(file => file.startsWith('original'));
                                if (originalFile) {
                                    productInfo.originalFileName = originalFile;
                                }
                            }

                            // For image_cover
                            const imageCoverPath = path.join(__dirname, '..', 'public', 'images/business', productInfo.image_cover);
                            if (fs.existsSync(imageCoverPath)) {
                                const filesCover = fs.readdirSync(imageCoverPath);
                                const originalCoverFile = filesCover.find(file => file.startsWith('original'));
                                if (originalCoverFile) {
                                    productInfo.originalCoverFileName = originalCoverFile;
                                }
                            }

                            resolve(productInfo);
                        }
                    }
                );
            });
        };

        const product = await fetchProductByName();
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'No encontrado' });
        }

    } catch (err) {
        console.error('Error ejecutando la consulta de configuración:', err);
        sendJsonResponse(res, 'error', err.message, null);
    }
};


exports.updateInfoBusiness = async (req, res) => {
    try {
        // Obtén los datos que deseas actualizar desde el cuerpo de la solicitud
        const { name, phone } = req.body;

        const updateConfiguration = () => {
            return new Promise((resolve, reject) => {
                connection.query(
                    'UPDATE configuration SET name = ?, phone = ? WHERE id = 1', // Asumiendo que el registro que deseas actualizar tiene un ID de 1
                    [name, phone],
                    (error, results) => {
                        if (error) {
                            reject(new Error('Error al actualizar la configuración: ' + error.message));
                        } else {
                            resolve(results); 
                        }
                    }
                );
            });
        };

        // Llama a la función 'updateConfiguration' para realizar la actualización
        await updateConfiguration();
        res.json({ message: 'Registro actualizado correctamente' });

    } catch (err) {
        console.error('Error ejecutando la actualización de configuración:', err);
        sendJsonResponse(res, 'error', error_message, null);
    }
};

exports.getDirectionBusiness = async (req, res) => {
    try {
        const fetchProductByName = () => {
            return new Promise((resolve, reject) => {
                connection.query(
                    'SELECT address,latitude,longitude FROM configuration',
                    (error, results) => {
                        if (error) {
                            reject(new Error('Error al obtener la información: ' + error.message));
                        } else {
                            resolve(results[0]); 
                        }
                    }
                );
            });
        };

        // Aquí deberías llamar a la función 'fetchProductByName' y enviar los datos al cliente. 
        const product = await fetchProductByName();
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'No encontrado' });
        }

    } catch (err) {
        console.error('Error ejecutando la consulta de configuración:', err);
        sendJsonResponse(res, 'error', error_message, null);
    }
};

exports.updateDirectionBusiness = async (req, res) => {
    try {
        // Obtén los datos que deseas actualizar desde el cuerpo de la solicitud
        const { address, latitude, longitude } = req.body;

        const updateConfiguration = () => {
            return new Promise((resolve, reject) => {
                connection.query(
                    'UPDATE configuration SET address = ?, latitude = ?, longitude = ? WHERE id = 1', // Asumiendo que el registro que deseas actualizar tiene un ID de 1
                    [address, latitude, longitude],
                    (error, results) => {
                        if (error) {
                            reject(new Error('Error al actualizar la configuración: ' + error.message));
                        } else {
                            resolve(results); 
                        }
                    }
                );
            });
        };

        // Llama a la función 'updateConfiguration' para realizar la actualización
        await updateConfiguration();
        res.json({ message: 'Registro de dirección actualizado correctamente' });

    } catch (err) {
        console.error('Error ejecutando la actualización de dirección de configuración:', err);
        sendJsonResponse(res, 'error', error_message, null);
    }
};

exports.insertSchedule = async (req, res) => {
    try {
        // Obtén los horarios desde el cuerpo de la solicitud
        const horarios = req.body; // Esto debería ser un array de objetos, cada uno con day, open_hour y close_hour
        console.log(horarios);

        const deleteAllSchedules = () => {
            return new Promise((resolve, reject) => {
                connection.query(
                    'DELETE FROM branch_hours', 
                    [],
                    (error, results) => {
                        if (error) {
                            reject(new Error('Error al eliminar los horarios: ' + error.message));
                        } else {
                            resolve(results);
                        }
                    }
                );
            });
        };

        const insertSingleSchedule = (day, open_hour, close_hour) => {
            return new Promise((resolve, reject) => {
                connection.query(
                    'INSERT INTO branch_hours (day, open_hour, close_hour) VALUES (?, ?, ?)', 
                    [day, open_hour, close_hour],
                    (error, results) => {
                        if (error) {
                            reject(new Error('Error al insertar el horario: ' + error.message));
                        } else {
                            resolve(results);
                        }
                    }
                );
            });
        };

        // Eliminar todos los horarios existentes
        await deleteAllSchedules();

        // Iterar sobre cada horario e insertarlo
        for (let horario of horarios) {
            await insertSingleSchedule(horario.day, horario.open_hour, horario.close_hour);
        }

        res.json({ message: 'Horarios insertados correctamente' });

    } catch (err) {
        console.error('Error ejecutando la inserción de horarios:', err);
        // Nota: Necesitas definir la función 'sendJsonResponse' o cambiar esta línea para manejar errores.
        sendJsonResponse(res, 'error', err.message, null);
    }
};

exports.getAllSchedules = async (req, res) => {
    try {
        const selectAllSchedules = () => {
            return new Promise((resolve, reject) => {
                connection.query(
                    'SELECT * FROM branch_hours', 
                    [],
                    (error, results) => {
                        if (error) {
                            reject(new Error('Error al obtener los horarios: ' + error.message));
                        } else {
                            resolve(results);
                        }
                    }
                );
            });
        };

        // Obtener todos los horarios
        const schedules = await selectAllSchedules();

        res.json({ message: 'Horarios obtenidos correctamente', data: schedules });

    } catch (err) {
        console.error('Error ejecutando la consulta de horarios:', err);
        // Nota: Necesitas definir la función 'sendJsonResponse' o cambiar esta línea para manejar errores.
        sendJsonResponse(res, 'error', err.message, null);
    }
};
exports.changeProfileImage = async (req, res) => {
    try {
        upload.single('image')(req, res, async function (uploadError) {
            if (uploadError) {
                throw new Error('Error uploading file: ' + uploadError.message);
            }

            if (!req.file) {
                throw new Error('No file uploaded');
            }

            const uniqueFolderName = uuidv4();
            const profilePath = path.join(__dirname, '..', 'public', 'images/business', uniqueFolderName);
            mkdirp.sync(profilePath);

            const ext = path.extname(req.file.originalname).toLowerCase();

            if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext) ) {
                const inputImagePath = path.join(profilePath, 'original' + ext);
                fs.renameSync(req.file.path, inputImagePath);

                console.log(`Processing image from: ${inputImagePath}`);

                let finalImagePath = inputImagePath;

                if (ext !== '.webp') {
                    finalImagePath = path.join(profilePath, `profile.webp`);
                    console.log(`Creating webp image at: ${finalImagePath}`);

                    await sharp(inputImagePath)
                        .webp({ quality: 90 })
                        .toFile(finalImagePath);

                    console.log(`Webp image created successfully.`);
                }

                const getExistingImage = () => {
                    return new Promise((resolve, reject) => {
                        connection.query('SELECT image FROM configuration', (error, results) => {
                            if (error) {
                                reject(new Error('Error fetching image: ' + error.message));
                            } else {
                                resolve(results[0]?.image);
                            }
                        });
                    });
                };

                const oldImageName = await getExistingImage();

                if (oldImageName) {
                    const oldImagePath = path.join(__dirname, '..', 'public', 'images/business', oldImageName, 'profile.webp');
                    const trashPath = path.join(__dirname, '..', 'public', 'images/trash', oldImageName + '.webp');
                    if (fs.existsSync(oldImagePath)) {
                        fs.renameSync(oldImagePath, trashPath);
                    }
                }

                const updateConfiguration = () => {
                    return new Promise((resolve, reject) => {
                        connection.query('UPDATE configuration SET image = ?', [uniqueFolderName], (error) => {
                            if (error) {
                                reject(new Error('Error updating configuration: ' + error.message));
                            } else {
                                resolve();
                            }
                        });
                    });
                };

                await updateConfiguration();

                // Construct the path for the newly uploaded image
                const imageUrl = `/images/business/${uniqueFolderName}/profile.webp`;
                sendJsonResponse(res, 'success', `Profile image updated successfully`, { imageUrl: imageUrl });

            } else {
                console.error('Invalid file format. Expected a valid image.');
                sendJsonResponse(res, 'error', 'Invalid file format. Expected a valid image.');
            }
        });
    } catch (err) {
        handleErrors(res, err);
    }
};
exports.changeCoverPicture = async (req, res) => {
    try {
        upload.single('image')(req, res, async function (uploadError) {
            if (uploadError) {
                throw new Error('Error uploading file: ' + uploadError.message);
            }

            if (!req.file) {
                throw new Error('No file uploaded');
            }

            const uniqueFolderName = uuidv4();
            const profilePath = path.join(__dirname, '..', 'public', 'images/business', uniqueFolderName);
            mkdirp.sync(profilePath);

            const ext = path.extname(req.file.originalname).toLowerCase();

            if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext) ) {
                const inputImagePath = path.join(profilePath, 'original' + ext);
                fs.renameSync(req.file.path, inputImagePath);

                console.log(`Processing image from: ${inputImagePath}`);

                let finalImagePath = inputImagePath;

                if (ext !== '.webp') {
                    finalImagePath = path.join(profilePath, `profile.webp`);
                    console.log(`Creating webp image at: ${finalImagePath}`);

                    await sharp(inputImagePath)
                        .webp({ quality: 90 })
                        .toFile(finalImagePath);

                    console.log(`Webp image created successfully.`);
                }

                const getExistingImage = () => {
                    return new Promise((resolve, reject) => {
                        connection.query('SELECT image_cover FROM configuration', (error, results) => {
                            if (error) {
                                reject(new Error('Error fetching image: ' + error.message));
                            } else {
                                resolve(results[0]?.image);
                            }
                        });
                    });
                };

                const oldImageName = await getExistingImage();

                if (oldImageName) {
                    const oldImagePath = path.join(__dirname, '..', 'public', 'images/business', oldImageName, 'profile.webp');
                    const trashPath = path.join(__dirname, '..', 'public', 'images/trash', oldImageName + '.webp');
                    if (fs.existsSync(oldImagePath)) {
                        fs.renameSync(oldImagePath, trashPath);
                    }
                }

                const updateConfiguration = () => {
                    return new Promise((resolve, reject) => {
                        connection.query('UPDATE configuration SET image_cover = ?', [uniqueFolderName], (error) => {
                            if (error) {
                                reject(new Error('Error updating configuration: ' + error.message));
                            } else {
                                resolve();
                            }
                        });
                    });
                };

                await updateConfiguration();

                // Construct the path for the newly uploaded image
                const imageUrl = `/images/business/${uniqueFolderName}/profile.webp`;
                sendJsonResponse(res, 'success', `Profile image updated successfully`, { imageUrl: imageUrl });

            } else {
                console.error('Invalid file format. Expected a valid image.');
                sendJsonResponse(res, 'error', 'Invalid file format. Expected a valid image.');
            }
        });
    } catch (err) {
        handleErrors(res, err);
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const oldPassword = req.body.oldPassword; // la contraseña anterior proporcionada por el usuario
        const newPassword = req.body.newPassword; // la nueva contraseña proporcionada por el usuario
        
        // 1. Seleccionar el usuario con nivel 2
        connection.query('SELECT password FROM users WHERE level_id = 2 LIMIT 1', async (error, results) => {
            if (error) {
                return res.status(500).json({ status:"info", message: 'Error al obtener el usuario: ' + error.message });
            }

            const user = results[0];
            
            if (!user) {
                return res.status(200).json({ status:"info", message: 'Usuario no encontrado.' });
            }

            // 2. Comparar la contraseña antigua proporcionada con la almacenada
            const match = await bcrypt.compare(oldPassword, user.password);
            
            if (!match) {
                return res.status(200).json({ status:"error", message: 'Contraseña incorrecta.' });
            }

            // 3. Si coincide, actualiza la contraseña con la nueva
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            
            connection.query('UPDATE users SET password = ? WHERE level_id = 2', [hashedNewPassword], (error, results) => {
                if (error) {
                    return res.status(200).json({ status:"error",message: 'Error al actualizar la contraseña: ' + error.message });
                }

                return res.status(200).json({ status:"success", message: 'Contraseña actualizada con éxito.' });
            });
        });

    } catch (err) {
        console.error('Error al actualizar la contraseña:', err);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};
