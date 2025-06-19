document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('url-input');
    const checkButton = document.getElementById('check-button');
    const resultsContainer = document.getElementById('results-container');

    // NOTE: A free, public CORS proxy is used here for demonstration purposes.
    // In a real-world application, you would want to set up your own proxy.
    const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";

    checkButton.addEventListener('click', () => {
        const urlToFetch = urlInput.value;
        if (!urlToFetch) {
            alert('Please enter a URL to check.');
            return;
        }
        checkLinks(urlToFetch);
    });

    const checkLinks = async (baseUrl) => {
        resultsContainer.innerHTML = '<p>Fetching page content...</p>';

        try {
            // 1. Fetch the initial page content via the CORS proxy
            const response = await fetch(CORS_PROXY + baseUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const htmlText = await response.text();
            resultsContainer.innerHTML = '<p>Page content fetched. Parsing for links...</p>';

            // 2. Parse the HTML to find all links
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');
            const links = Array.from(doc.querySelectorAll('a'));

            if (links.length === 0) {
                resultsContainer.innerHTML = '<p>No links found on the page.</p>';
                return;
            }

            resultsContainer.innerHTML = ''; // Clear the container for results

            // 3. Check each link
            links.forEach(link => {
                let href = link.getAttribute('href');
                if (!href || href.startsWith('#') || href.startsWith('javascript:')) {
                    return; // Skip empty, anchor, or javascript links
                }

                // Resolve relative URLs to absolute URLs
                try {
                    const absoluteUrl = new URL(href, baseUrl).href;
                    addResultToList(absoluteUrl, 'Checking...');
                    checkLinkStatus(absoluteUrl);
                } catch (e) {
                    // Handle invalid URLs
                    addResultToList(`${href} (Invalid URL)`, 'Broken');
                }
            });

        } catch (error) {
            resultsContainer.innerHTML = `<p class="status-broken">Failed to fetch the URL. Error: ${error.message}. Please ensure the URL is correct and accessible. Note that Cross-Origin (CORS) restrictions may prevent this tool from working on certain websites.</p>`;
            console.error('Error fetching the base URL:', error);
        }
    };

    const checkLinkStatus = async (url) => {
        try {
            // Use a HEAD request for efficiency as we only need the status code
            const response = await fetch(CORS_PROXY + url, { method: 'HEAD' });
            updateResultStatus(url, response.status, response.ok);
        } catch (error) {
            // Network errors or other issues are treated as broken links
            updateResultStatus(url, 'Network Error', false);
        }
    };
    
    const addResultToList = (url, status) => {
        const resultItem = document.createElement('div');
        resultItem.classList.add('result-item');
        resultItem.setAttribute('data-url', url); // Use a data attribute to find this element later
        
        const statusClass = status === 'Broken' ? 'status-broken' : 'status-checking';
        resultItem.innerHTML = `<span>${url}</span> - <strong class="${statusClass}">${status}</strong>`;
        resultsContainer.appendChild(resultItem);
    };

    const updateResultStatus = (url, status, isOk) => {
        const resultItem = resultsContainer.querySelector(`[data-url="${url}"]`);
        if (resultItem) {
            const statusElement = resultItem.querySelector('strong');
            statusElement.textContent = `${status}`;
            statusElement.className = isOk ? 'status-ok' : 'status-broken';
        }
    };
});