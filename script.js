document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('url-input');
    const executeBtn = document.getElementById('execute-btn');
    const logOutput = document.getElementById('log-output');

    const triggerDownload = (url, filename) => {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename; // File ka naam set karo
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const startProcess = async () => {
        const url = urlInput.value.trim();
        if (!url.startsWith('http')) {
            logOutput.innerHTML = '<p>[ERROR] Please enter a valid URL.</p>';
            return;
        }

        logOutput.innerHTML = '<p>[*] Requesting download link from server...</p>';
        
        try {
            // Netlify ke backend engine ko call karo
            const response = await fetch(`/.netlify/functions/downloader?url=${encodeURIComponent(url)}`);
            const data = await response.json();

            if (!response.ok || data.error) {
                throw new Error(data.error || 'Failed to get download link.');
            }
            
            logOutput.innerHTML += `<p>[+] Link received. Downloading: ${data.title}</p>`;
            logOutput.innerHTML += `<p>[*] Downloading start ho gai hay...</p>`;
            
            // Asal download start karo
            triggerDownload(data.downloadUrl, `${data.title}.${data.ext}`);

        } catch (error) {
            logOutput.innerHTML += `<p>[ERROR] ${error.message}</p>`;
        }
    };

    executeBtn.addEventListener('click', startProcess);
    urlInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            startProcess();
        }
    });
});
