document.addEventListener('DOMContentLoaded', () => {
    const uploadBox = document.getElementById('upload-box');
    const fileInput = document.getElementById('file-input');
    const uploadContent = document.querySelector('.upload-content');
    const resultsContainer = document.getElementById('results-container');

    // Trigger file input click when upload box is clicked
    uploadBox.addEventListener('click', () => {
        fileInput.click();
    });

    // Handle file input change
    fileInput.addEventListener('change', handleFileUpload);

    // Handle drag over
    uploadBox.addEventListener('dragover', (event) => {
        event.preventDefault();
        uploadBox.style.background = '#e0e0e0';
    });

    // Handle drag leave
    uploadBox.addEventListener('dragleave', () => {
        uploadBox.style.background = '#fafafa';
    });

    // Handle drop
    uploadBox.addEventListener('drop', (event) => {
        event.preventDefault();
        uploadBox.style.background = '#fafafa';
        const file = event.dataTransfer.files[0];
        if (file) {
            handleFileUpload(file);
        }
    });

    // Handle file upload
    function handleFileUpload(inputFile) {
        const file = inputFile instanceof Event ? inputFile.target.files[0] : inputFile;
        if (file) {
            if (!file.type.match('image/jpeg')) {
                alert('Please upload a valid JPG or JPEG file.');
                return;
            }

            // Clear any existing content only once
            uploadBox.innerHTML = '';
            uploadContent.style.display = 'none'; // Hide the text and icon

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.classList.add('uploaded-image');
                uploadBox.appendChild(img);

                // Create and show result containers after image upload
                createResultContainers();

                // Send file to AI model
                sendToAIModel(file);
            };
            reader.readAsDataURL(file);
        }
    }

    // Function to create result containers
    function createResultContainers() {
        // Clear existing containers
        resultsContainer.innerHTML = '';

        // Create and append new containers
        const diseaseDiv = document.createElement('div');
        diseaseDiv.id = 'disease-text';
        diseaseDiv.className = 'result-container';
        diseaseDiv.innerHTML = '<strong>Disease:</strong> <span>No data</span>';
        
        const solutionDiv = document.createElement('div');
        solutionDiv.id = 'solution-text';
        solutionDiv.className = 'result-container';
        solutionDiv.innerHTML = '<strong>Solution:</strong> <span>No data</span>';

        const precautionDiv = document.createElement('div');
        precautionDiv.id = 'precaution-text';
        precautionDiv.className = 'result-container';
        precautionDiv.innerHTML = '<strong>Precaution:</strong> <span>No data</span>';

        resultsContainer.appendChild(diseaseDiv);
        resultsContainer.appendChild(solutionDiv);
        resultsContainer.appendChild(precautionDiv);
    }

    // Function to update results
    function updateResults(data) {
        const diseaseDiv = document.getElementById('disease-text');
        const solutionDiv = document.getElementById('solution-text');
        const precautionDiv = document.getElementById('precaution-text');

        if (diseaseDiv) {
            diseaseDiv.querySelector('span').textContent = data.disease || 'No data';
        }
        
        if (solutionDiv) {
            solutionDiv.querySelector('span').textContent = data.solution || 'No data';
        }
        
        if (precautionDiv) {
            precautionDiv.querySelector('span').textContent = data.precaution || 'No data';
        }
    }
});
