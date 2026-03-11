const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureBtn = document.getElementById('capture-btn');
const userNameInput = document.getElementById('userName');
const status = document.getElementById('status');

// 1. Activar la cámara
navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false })
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(err => {
        console.error("Error accediendo a la cámara: ", err);
        status.innerText = "Error: No se pudo acceder a la cámara.";
    });

// 2. Capturar y enviar
captureBtn.addEventListener('click', () => {
    const name = userNameInput.value;
    if (!name) {
        alert("Por favor, ingresa tu nombre");
        return;
    }

    // Dibujar el frame del video en el canvas
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convertir canvas a Blob (archivo)
    canvas.toBlob(blob => {
        const formData = new FormData();
        formData.append('photo', blob, 'foto.jpg');
        formData.append('userName', name);

        status.innerText = "Subiendo...";

        // Enviar al servidor
        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            status.innerText = "¡Foto enviada con éxito!";
            console.log(data);
        })
        .catch(err => {
            status.innerText = "Error al subir.";
            console.error(err);
        });
    }, 'image/jpeg', 0.8);
});