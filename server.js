const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');
const app = express();

// 1. CONFIGURACIÓN DE CLOUDINARY
// Render leerá automáticamente las variables de entorno que configures en su panel
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. CONFIGURACIÓN DEL ALMACENAMIENTO EN LA NUBE
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'fotos_boda', // Nombre de la carpeta que se creará en tu Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
  },
});

const upload = multer({ storage: storage });

// Array temporal para guardar las URLs de las fotos subidas
// (Nota: Esto se borra si el servidor de Render se reinicia, 
// pero las fotos seguirán seguras en Cloudinary)
let database_fotos = [];

// Middleware para archivos estáticos (tu index.html, css, etc.)
app.use(express.static('public'));
app.use(express.json());

// 3. RUTA PARA SUBIR LA FOTO
app.post('/upload', upload.single('photo'), (req, res) => {
  if (req.file && req.file.path) {
    const nuevaFoto = {
      url: req.file.path, // Esta es la URL de Cloudinary
      id: req.file.filename,
      fecha: new Date()
    };
    
    database_fotos.push(nuevaFoto);
    
    console.log("¡Éxito! Foto subida a Cloudinary:", nuevaFoto.url);
    res.json(nuevaFoto);
  } else {
    res.status(400).send('Error: No se pudo subir la imagen a la nube.');
  }
});

// 4. RUTA PARA OBTENER TODAS LAS FOTOS
app.get('/fotos', (req, res) => {
  res.json(database_fotos);
});

// 5. INICIAR EL SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log("Listo para recibir fotos de la boda 💍");
});