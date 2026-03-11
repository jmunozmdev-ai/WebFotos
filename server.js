const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000; // Render usará process.env.PORT

app.listen(PORT, () => {
    console.log(`Servidor en marcha en el puerto ${PORT}`);
});

if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Obtenemos el nombre del usuario desde el body de la petición
        const userName = req.body.userName || 'anonimo';
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${userName}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage: storage });

app.use(express.static('public'));
app.use(express.json());

app.post('/upload', upload.single('photo'), (req, res) => {
    console.log(`Foto recibida de: ${req.body.userName}`);
    res.json({ message: 'Foto subida exitosamente', file: req.file });
});
app.get('/photos', (req, res) => {
    fs.readdir('./uploads', (err, files) => {
        if (err) return res.status(500).json({ error: 'No se pudieron leer las fotos' });
        res.json(files); // Devuelve la lista de nombres de archivos
    });
});

// Hacer que la carpeta uploads sea accesible desde la web
app.use('/uploads', express.static('uploads'));
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
