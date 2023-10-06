document.getElementById('documentType').addEventListener('change', function () {
    const filedCheckbox = document.getElementById('filedCheckbox');
    const subCheckboxes = document.getElementById('subCheckboxes');
    const grantedCheckbox = document.getElementById('grantedCheckbox');
    const downloadButtonContainer = document.getElementById('download-button-container');
    const downloadGrantedButton = document.getElementById('downloadGrantedButton');
    const downloadApplicationLink = document.getElementById('downloadApplicationLink');
    const downloadZipButton = document.getElementById('downloadZipButton');

    if (this.value === 'application') {
        filedCheckbox.checked = true;
        subCheckboxes.style.display = 'block';
        downloadButtonContainer.style.display = 'none';
        downloadGrantedButton.style.display = 'none';
        downloadApplicationLink.style.display = 'block';
        downloadZipButton.style.display = 'none';
    } else if (this.value === 'granted') {
        filedCheckbox.checked = false;
        subCheckboxes.style.display = 'none';
        grantedCheckbox.checked = true;
        downloadButtonContainer.style.display = 'block';
        downloadGrantedButton.style.display = 'block';
        downloadApplicationLink.style.display = 'none';
        downloadZipButton.style.display = 'none';
    }
});

document.getElementById('documentForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    const documentType = document.getElementById('documentType').value;
    const grantedCheckbox = document.getElementById('grantedCheckbox');
    const patentNumber = document.getElementById('patentNumber').value;

    if (documentType === 'granted' && grantedCheckbox.checked) {
        // If "Granted" is selected and "Granted Documents" checkbox is checked
        const downloadURL = `https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/${patentNumber}`;
        initiateDownload(downloadURL, patentNumber);
    } else if (documentType === 'application') {
        // If "Application" is selected, determine which document codes to include
        const abstractCheckbox = document.getElementById('abstractCheckbox');
        const claimsCheckbox = document.getElementById('claimsCheckbox');
        const specificationCheckbox = document.getElementById('specificationCheckbox');
        const selectedDocumentCodes = [];

        if (abstractCheckbox.checked) selectedDocumentCodes.push('ABST');
        if (claimsCheckbox.checked) selectedDocumentCodes.push('CLM');
        if (specificationCheckbox.checked) selectedDocumentCodes.push('SPEC');

        // If at least one document code is selected, trigger app.js
        // ... (previous code)

        // If at least one document code is selected, trigger app.js
        if (selectedDocumentCodes.length > 0) {
            try {
                const documentCodesString = selectedDocumentCodes.join(','); // Convert to a comma-separated string
                const response = await fetch('/trigger-app-js', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        patentNumber,
                        documentCodes: documentCodesString, // Send as a string
                    }),
                });

                // ... (rest of the code)
            } catch (error) {
                // ... (error handling)
            }
        } else {
            alert("Please select a document to download.");
        }

        //         if (response.status === 200) {
        //             // Display a message to the user indicating that processing is in progress
        //             alert("Processing is in progress. Please wait for the download button to appear.");
        //         } else {
        //             alert("Failed to trigger app.js.");
        //         }
        //     } catch (error) {
        //         console.error('Error:', error);
        //         alert("Failed to trigger app.js.");
        //     }
        // } else {
        //     alert("Please select a document to download.");
        // }
    }
});

// Function to initiate the zip file download
function initiateDownload(downloadURL, patentNumber) {
    if (downloadURL) {
        const link = document.createElement("a");
        link.href = downloadURL;
        link.style.display = "none";
        link.download = `patent_${patentNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        alert("Please select a valid download option.");
    }
}

// Add an event listener for the zip download button
document.getElementById('downloadZipButton').addEventListener('click', async function () {
    const patentNumber = document.getElementById('patentNumber').value;

    try {
        const response = await fetch('/download-zip', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                patentNumber,
            }),
        });

        if (response.status === 200) {
            const data = await response.json();
            if (data.filePath) {
                // If a valid file path is returned, initiate the download
                initiateDownload(data.filePath, patentNumber);
            } else {
                alert("Failed to fetch the download URL.");
            }
        } else {
            alert("Failed to fetch the download URL.");
        }
    } catch (error) {
        console.error('Error:', error);
        alert("Failed to fetch the download URL.");
    }
});
// Add an event listener for the zip download button
document.getElementById('downloadZipButton').addEventListener('click', function () {
    const zipDownloadURL = `/downloaded-documents/downloaded.zip`; // Modify this URL as needed
    initiateDownload(zipDownloadURL);
});



// Function to initiate the download
function initiateDownload(downloadURL) {
    if (downloadURL) {
        const link = document.createElement("a");
        link.href = downloadURL;
        link.style.display = "none";
        link.download = 'downloaded.zip'; // Set the desired file name here
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        alert("Please select a valid download option.");
    }
}

