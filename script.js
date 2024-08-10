document.addEventListener('DOMContentLoaded', () => {
    const sendBtn = document.getElementById('send-btn');
    const textarea = document.getElementById('chat-textarea');
    const previewImg = document.getElementById('image-preview');
    const messages = document.getElementById('messages');
    const readBtn = document.getElementById('read-btn');
    const uploadBtn = document.getElementById('upload-btn');
    const uploadModal = document.getElementById('upload-options-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cameraContainer = document.getElementById('camera-container');
    const cameraPreview = document.getElementById('camera-preview');
    const captureBtn = document.getElementById('capture-btn');
    const cancelCameraBtn = document.getElementById('cancel-camera-btn');
    const uploadDeviceBtn = document.getElementById('upload-device-btn');
    const uploadCameraBtn = document.getElementById('upload-camera-btn');
    const micBtn = document.getElementById('mic-btn'); // Mic button
    let videoStream;
    let lastBotMessage; // Variable to store the last bot message
    let recognition; // For speech recognition
    let isListening = false; // Flag to track the listening state

    // Initialize speech recognition if available
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            textarea.value = transcript;
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event);
        };

        recognition.onend = () => {
            isListening = false; // Update flag when recognition ends
        };
    } else {
        console.error('Speech recognition not supported.');
    }

    // Show the modal when the upload button is clicked
    uploadBtn.addEventListener('click', () => {
        uploadModal.style.display = 'block';
    });

    // Close the modal when the "Cancel" button or close button is clicked
    closeModalBtn.addEventListener('click', () => {
        uploadModal.style.display = 'none';
    });

    // Handle the upload from device option
    uploadDeviceBtn.addEventListener('click', () => {
        uploadModal.style.display = 'none';
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                // Check file type and size (example: limit size to 2MB)
                if (!file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) {
                    alert('Please upload a valid image file under 2MB.');
                    return;
                }

                const reader = new FileReader();
                reader.onload = (event) => {
                    previewImg.src = event.target.result;
                    previewImg.style.display = 'block'; // Show image preview
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    });

    // Handle the use camera option
    uploadCameraBtn.addEventListener('click', async () => {
        uploadModal.style.display = 'none';
        cameraContainer.style.display = 'flex';

        try {
            videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
            cameraPreview.srcObject = videoStream;
        } catch (err) {
            console.error('Error accessing the camera', err);
            cameraContainer.style.display = 'none';
        }
    });

    // Capture the image from the video feed
    captureBtn.addEventListener('click', () => {
        const canvas = document.createElement('canvas');
        canvas.width = cameraPreview.videoWidth;
        canvas.height = cameraPreview.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(cameraPreview, 0, 0, canvas.width, canvas.height);
        const imageUrl = canvas.toDataURL('image/png');
        previewImg.src = imageUrl;
        previewImg.style.display = 'block'; // Show image preview
        cameraContainer.style.display = 'none';

        // Stop the camera
        videoStream.getTracks().forEach(track => track.stop());
    });

    // Cancel the camera preview
    cancelCameraBtn.addEventListener('click', () => {
        cameraContainer.style.display = 'none';
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
        }
    });

    // Handle the mic button click
    micBtn.addEventListener('click', () => {
        if (recognition) {
            if (!isListening) {
                recognition.start();
                isListening = true; // Update flag to indicate listening state
            } else {
                recognition.stop();
                isListening = false; // Update flag to indicate stopped state
            }
        }
    });

    // Handle the send button click
    sendBtn.addEventListener('click', () => {
        const text = textarea.value.trim();
        const imageSrc = previewImg.src;

        if (text || imageSrc) {
            const messageElem = document.createElement('div');
            messageElem.classList.add('message', 'user');

            if (imageSrc) {
                const imgElem = document.createElement('img');
                imgElem.src = imageSrc;
                imgElem.onerror = () => {
                    messageElem.removeChild(imgElem); // Remove the broken image element
                };
                messageElem.appendChild(imgElem);
                previewImg.src = ''; // Clear preview after sending
                previewImg.style.display = 'none'; // Hide image preview
            }

            if (text) {
                const textElem = document.createElement('span');
                textElem.classList.add('message-content');
                textElem.textContent = text;
                messageElem.appendChild(textElem);
            }

            messages.appendChild(messageElem);
            messages.scrollTop = messages.scrollHeight;

            // Send message to backend and simulate a bot response
            sendToBackend(text);
        }
    });

    // Function to send user message to backend and handle the response
    async function sendToBackend(userMessage) {
        try {
            const response = await fetch('http://localhost:5000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMessage }),
            });

            const data = await response.json();
            const botMessage = data.response;

            // Create and append the bot's message
            const botMessageElem = document.createElement('div');
            botMessageElem.classList.add('message', 'bot');
            const textElem = document.createElement('span');
            textElem.classList.add('message-content');
            textElem.textContent = botMessage;
            botMessageElem.appendChild(textElem);

            messages.appendChild(botMessageElem);
            messages.scrollTop = messages.scrollHeight;

            // Store the last bot message for reading
            lastBotMessage = botMessage;

        } catch (error) {
            console.error('Error sending message to backend:', error);
        }
    }

    // Handle the read button click
    readBtn.addEventListener('click', () => {
        if (lastBotMessage) {
            const utterance = new SpeechSynthesisUtterance(lastBotMessage);
            speechSynthesis.speak(utterance);
        } else {
            alert('No message to read.');
        }
    });
});
