document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    const urlForm = document.getElementById('url-form');
    const smsForm = document.getElementById('sms-form');
    const resultsContainer = document.getElementById('results');
    
    // Elements to update in results
    const threatLevelEl = document.getElementById('result-threat-level');
    const confidenceEl = document.getElementById('result-confidence');
    const inputEl = document.getElementById('result-input');
    const isPhishingEl = document.getElementById('result-is-phishing');
    const timeEl = document.getElementById('result-time');
    const reasonsEl = document.getElementById('result-reasons');

    // Tab Switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(tab.dataset.target).classList.add('active');
            resultsContainer.classList.add('hidden');
        });
    });

    async function handleScan(type, data, btnId) {
        const btn = document.getElementById(btnId);
        const btnText = btn.querySelector('span');
        const loader = btn.querySelector('.loader');

        // UI Loading state
        btn.disabled = true;
        btnText.classList.add('hidden');
        loader.classList.remove('hidden');
        resultsContainer.classList.add('hidden');

        let endpoint = type === 'url' ? '/api/v1/scan-url' : '/api/v1/scan-sms';
        let payload = type === 'url' ? { url: data } : { message: data };

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.detail || 'Scan failed');
            }

            displayResults(type, data, result);

        } catch (error) {
            alert(`Error: ${error.message}`);
        } finally {
            // Restore UI
            btn.disabled = false;
            btnText.classList.remove('hidden');
            loader.classList.add('hidden');
        }
    }

    function displayResults(type, input, result) {
        // Clear previous classes
        threatLevelEl.className = '';
        
        // Update values
        threatLevelEl.textContent = result.threat_level;
        threatLevelEl.classList.add(`threat-${result.threat_level.toLowerCase()}`);
        
        const confPercent = Math.round(result.confidence * 100);
        confidenceEl.textContent = `${confPercent}% Confidence`;
        
        inputEl.textContent = input;
        isPhishingEl.textContent = result.is_phishing ? 'Phishing / Malicious' : 'Legitimate / Safe';
        timeEl.textContent = `${result.scan_time_ms} ms`;
        
        // Reasons list
        reasonsEl.innerHTML = '';
        if (result.reasons && result.reasons.length > 0) {
            result.reasons.forEach(reason => {
                const li = document.createElement('li');
                li.textContent = reason;
                reasonsEl.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = 'No specific flags detected.';
            reasonsEl.appendChild(li);
        }

        resultsContainer.classList.remove('hidden');
    }

    urlForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const url = document.getElementById('url-input').value;
        handleScan('url', url, 'url-submit');
    });

    smsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const msg = document.getElementById('sms-input').value;
        handleScan('sms', msg, 'sms-submit');
    });
});
