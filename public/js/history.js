function makePdf(dataType, userId) {
  // Construct the URL with query parameters
  const url = `/download-history?dataType=${dataType}&userId=${userId}`;

  // Disable the button to prevent multiple clicks
  document.getElementById("download-pdf-history-btn").disabled = true;

  // Make a GET request to the backend to get the URL of the weather history PDF
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Failed to fetch: ${response.status} ${response.statusText}`
        );
      }
      return response.blob(); // Extract the response body as a Blob
    })
    .then((blob) => {
      // Create object URL from the blob
      const url = URL.createObjectURL(blob);

      // Open the PDF file in a new window/tab
      window.open(url, "_blank");

      // Release the object URL when no longer needed
      URL.revokeObjectURL(url);

      // Enable the button again after the PDF is opened
      document.getElementById("download-weather-history-btn").disabled = false;
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Failed to open PDF");
      // Enable the button again if an error occurs
      document.getElementById("download-weather-history-btn").disabled = false;
    });
}
