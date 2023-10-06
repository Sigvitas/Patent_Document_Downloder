// Function to handle the behavior when the download button is clicked for granted patents
function downloadGrantedPDF() {
    const patentNumber = document.getElementById('patentNumber').textContent;

    // Create the download URL for granted patents
    const downloadURL = `https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/${patentNumber}`;

    if (downloadURL) {
        // If a valid download URL is determined, initiate the download
        const link = document.createElement("a");
        link.href = downloadURL;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        alert("Please select a valid download option.");
    }
}

// Function to handle the behavior when the download button is clicked for application documents
function downloadApplicationPDF() {
    const abstractCheckbox = document.getElementById('abstractCheckbox');
    const claimsCheckbox = document.getElementById('claimsCheckbox');
    const specificationCheckbox = document.getElementById('specificationCheckbox');
    const patentNumber = document.getElementById('patentNumber').textContent;

    const selectedDocumentCodes = [];

    // Determine which document codes to include based on user selections
    if (abstractCheckbox.checked) selectedDocumentCodes.push('ABST');
    if (claimsCheckbox.checked) selectedDocumentCodes.push('CLM');
    if (specificationCheckbox.checked) selectedDocumentCodes.push('SPEC');

    if (selectedDocumentCodes.length > 0) {
        // Create the download URL for application documents
        const downloadURL = `https://patents.tvornica.net/api/download-available-documents/?numbers=${patentNumber}&date_from=1990-10-05&date_to=2023-10-05&document_code=${selectedDocumentCodes.join(',')}&desired_apps_extended_info=false`;

        if (downloadURL) {
            // If a valid download URL is determined, initiate the download
            const link = document.createElement("a");
            link.href = downloadURL;
            link.style.display = "none";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert("Please select a valid download option.");
        }
    } else {
        alert("Please select at least one document component.");
    }
}
