document.addEventListener('DOMContentLoaded', function() {
    const frame = document.getElementById('browser-frame');
    const addressBar = document.getElementById('address-bar');
    const backBtn = document.getElementById('back-btn');
    const forwardBtn = document.getElementById('forward-btn');
    const refreshBtn = document.getElementById('refresh-btn');
    const homeBtn = document.getElementById('home-btn');
    const goBtn = document.getElementById('go-btn');
    const newTabBtn = document.getElementById('new-tab-btn');
    const statusText = document.getElementById('status-text');
    const tabBar = document.querySelector('.tab-bar');
    
    let tabs = [];
    let currentTabId = 1;
    
    // Initialize first tab
    createNewTab();
    
    // Navigation buttons
    backBtn.addEventListener('click', () => {
        try {
            frame.contentWindow.history.back();
        } catch (e) {
            statusText.textContent = "Cannot go back";
        }
    });
    
    forwardBtn.addEventListener('click', () => {
        try {
            frame.contentWindow.history.forward();
        } catch (e) {
            statusText.textContent = "Cannot go forward";
        }
    });
    
    refreshBtn.addEventListener('click', () => {
        frame.contentWindow.location.reload();
    });
    
    homeBtn.addEventListener('click', () => {
        navigateTo('about:blank');
    });
    
    goBtn.addEventListener('click', () => {
        navigate(addressBar.value);
    });
    
    addressBar.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            navigate(addressBar.value);
        }
    });
    
    newTabBtn.addEventListener('click', () => {
        createNewTab();
    });
    
    // Helper functions
    function navigate(url) {
        if (!url) return;
        
        // Add http:// if no protocol is specified
        if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('about:')) {
            url = 'https://' + url;
        }
        
        try {
            frame.src = url;
            addressBar.value = url;
            statusText.textContent = `Loading ${url}...`;
            
            // Listen for frame load
            frame.onload = function() {
                statusText.textContent = `Loaded ${frame.src}`;
                addressBar.value = frame.src;
            };
            
            frame.onerror = function() {
                statusText.textContent = `Error loading ${url}`;
            };
        } catch (e) {
            statusText.textContent = `Error: ${e.message}`;
        }
    }
    
    function navigateTo(url) {
        addressBar.value = url;
        navigate(url);
    }
    
    function createNewTab() {
        const tabId = ++currentTabId;
        const tab = document.createElement('div');
        tab.className = 'tab';
        tab.dataset.tabId = tabId;
        
        const tabTitle = document.createElement('span');
        tabTitle.textContent = 'New Tab';
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-tab';
        closeBtn.textContent = '×';
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeTab(tabId);
        });
        
        tab.appendChild(tabTitle);
        tab.appendChild(closeBtn);
        
        tab.addEventListener('click', () => {
            switchTab(tabId);
        });
        
        tabBar.appendChild(tab);
        tabs.push({
            id: tabId,
            element: tab,
            url: 'about:blank',
            title: 'New Tab'
        });
        
        switchTab(tabId);
    }
    
    function switchTab(tabId) {
        // Find the tab
        const tab = tabs.find(t => t.id === tabId);
        if (!tab) return;
        
        // Update UI
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.element.classList.add('active');
        
        // Update frame (in a real app, you'd have separate iframes per tab)
        frame.src = tab.url;
        addressBar.value = tab.url;
        statusText.textContent = `Switched to tab: ${tab.title}`;
    }
    
    function closeTab(tabId) {
        if (tabs.length <= 1) {
            statusText.textContent = "Cannot close the last tab";
            return;
        }
        
        const tabIndex = tabs.findIndex(t => t.id === tabId);
        if (tabIndex === -1) return;
        
        // Remove from DOM
        tabBar.removeChild(tabs[tabIndex].element);
        
        // Remove from array
        tabs.splice(tabIndex, 1);
        
        // Switch to another tab (first one available)
        if (tabs.length > 0) {
            switchTab(tabs[0].id);
        }
    }
    
    // Initial load
    navigateTo('https://www.google.com');
});
