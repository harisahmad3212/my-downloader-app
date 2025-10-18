document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('url-input');
    const logOutput = document.getElementById('log-output');
    const previewSection = document.getElementById('preview-section');
    const thumbnail = document.getElementById('thumbnail');
    const videoTitle = document.getElementById('video-title');
    const qualitySelect = document.getElementById('quality-select');
    const downloadLink = document.getElementById('download-link');

    let videoFormats = [];

    urlInput.addEventListener('input', async () => {
        const url = urlInput.value.trim();
        if (url.startsWith('http')) {
            logOutput.innerHTML = '<p>[*] Fetching video details...</p>';
            previewSection.classList.add('hidden');
            
            try {
                // Netlify ke backend engine ko call karo
                const response = await fetch(`/.netlify/functions/downloader?url=${encodeURIComponent(url)}`);
                if (!response.ok) {
                    throw new Error('Failed to get video info from server.');
                }
                const data = await response.json();

                logOutput.innerHTML = '';
                thumbnail.src = data.thumbnail;
                videoTitle.textContent = data.title;
                videoFormats = data.formats;

                qualitySelect.innerHTML = '<option value="">-- Select Quality --</option>';
                data.formats.forEach(format => {
                    const option = document.createElement('option');
                    option.value = format.format_id;
                    option.textContent = `${format.height}p - ${format.ext}`;
                    qualitySelect.appendChild(option);
                });
                
                // Audio option add karo
                if (data.audioFormat) {
                    const option = document.createElement('option');
                    option.value = data.audioFormat.format_id;
                    option.textContent = `Audio Only - ${data.audioFormat.ext}`;
                    qualitySelect.appendChild(option);
                }

                previewSection.classList.remove('hidden');

            } catch (error) {
                logOutput.innerHTML = `<p>[ERROR] ${error.message}</p>`;
            }
        }
    });

    qualitySelect.addEventListener('change', () => {
        const selectedId = qualitySelect.value;
        const allFormats = [...videoFormats, videoFormats.audioFormat].filter(Boolean);
        const selectedFormat = allFormats.find(f => f.format_id === selectedId);
        
        if (selectedFormat) {
            downloadLink.href = selectedFormat.url;
            downloadLink.classList.remove('hidden');
        } else {
            downloadLink.classList.add('hidden');
        }
    });
});