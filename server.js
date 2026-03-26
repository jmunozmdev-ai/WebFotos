const express = require('express');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. CONFIGURACIÓN DE CLOUDINARY
// Asegúrate de poner estos nombres EXACTOS en las "Environment Variables" de Render
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. CONFIGURACIÓN DE ALMACENAMIENTO (Storage)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'fotos_boda', // Nombre de la carpeta en tu Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'heic'],
  },
});

const upload = multer({ storage: storage });

// 3. ARCHIVOS ESTÁTICOS (Para que cargue tu index.html, css, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// 4. RUTA PARA SUBIR LA FOTO
app.post('/upload', upload.single('foto'), async (req, res) => {
  try {
    console.log("Archivo subido con éxito a Cloudinary:", req.file.path);
    // Redirigimos al inicio para que no se quede la pantalla en blanco
    res.redirect('/'); 
  } catch (error) {
    console.error("Error al subir:", error);
    res.status(500).send("Hubo un problema al subir tu foto. Inténtalo de nuevo.");
  }
});

// 5. RUTA PARA OBTENER LAS FOTOS (Para la galería)
app.get('/api/fotos', async (req, res) => {
  try {
    const { resources } = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'fotos_boda/', // Debe coincidir con el nombre de la carpeta arriba
      max_results: 100 // Cantidad de fotos que quieres mostrar
    });
    
    // Extraemos solo las URLs seguras
    const urls = resources.map(file => file.secure_url);
    res.json(urls);
  } catch (error) {
    console.error("Error al obtener fotos:", error);
    res.status(500).json({ error: "No se pudieron cargar las fotos" });
  }
});

// 6. INICIAR EL SERVIDOR
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  console.log("Listo para recibir fotos de la boda 💍");
});