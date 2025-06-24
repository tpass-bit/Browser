document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const frame = document.getElementById('browser-frame');
    const addressBar = document.getElementById('address-bar');
    const backBtn = document.getElementById('back-btn');
    const forwardBtn = document.getElementById('forward-btn');
    const refreshBtn = document.getElementById('refresh-btn');
    const homeBtn = document.getElementById('home-btn');
    const tabsBtn = document.getElementById('tabs-btn');
    const menuBtn = document.getElementById('menu-btn');
    const moreBtn = document.getElementById('more-btn');
    const addTabBtn = document.getElementById('add-tab-btn');
    const statusText = document.getElementById('status-text');
    const securityInfo = document.getElementById('security-info');
    const tabBar = document.querySelector('.tab-bar');
    const menuOverlay = document.getElementById('menu-overlay');
    const downloadsPanel = document.getElementById('downloads-panel');
    const tabsPanel = document.getElementById('tabs-panel');
    const downloadsList = document.getElementById('downloads-list');
    const tabsGrid = document.getElementById('tabs-grid');
    
    // Menu buttons
    const newTabMenuBtn = document.getElementById('new-tab-menu');
    const bookmarksMenuBtn = document.getElementById('bookmarks-menu');
    const historyMenuBtn = document.getElementById('history-menu');
    const downloadsMenuBtn = document.getElementById('downloads-menu');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const clearDataMenuBtn = document.getElementById('clear-data-menu');
    const settingsMenuBtn = document.getElementById('settings-menu');
    const closeMenuBtn = document.getElementById('close-menu');
    const addTabPanelBtn = document.getElementById('add-tab-panel-btn');
    
    // Browser state
    let tabs = [];
    let currentTabId = 1;
    let downloads = [];
    let isDarkMode = localStorage.getItem('darkMode') === 'true';
    
    // Initialize browser
    initBrowser();
    
    // Event listeners
    backBtn.addEventListener('click', goBack);
    forwardBtn.addEventListener('click', goForward);
    refreshBtn.addEventListener('click', refreshPage);
    homeBtn.addEventListener('click', goHome);
    tabsBtn.addEventListener('click', showTabsPanel);
    menuBtn.addEventListener('click', showMenu);
    moreBtn.addEventListener('click', showQuickMenu);
    addTabBtn.addEventListener('click', createNewTab);
    addressBar.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') navigate(addressBar.value);
    });
    
    // Menu event listeners
    newTabMenuBtn.addEventListener('click', function() {
        createNewTab();
        hideMenu();
    });
    
    bookmarksMenuBtn.addEventListener('click', function() {
        alert('Bookmarks feature coming soon!');
        hideMenu();
    });
    
    historyMenuBtn.addEventListener('click', function() {
        alert('History feature coming soon!');
        hideMenu();
    });
    
    downloadsMenuBtn.addEventListener('click', function() {
        showDownloadsPanel();
        hideMenu();
    });
    
    darkModeToggle.addEventListener('click', toggleDarkMode);
    clearDataMenuBtn.addEventListener('click', clearBrowsingData);
    settingsMenuBtn.addEventListener('click', showSettings);
    closeMenuBtn.addEventListener('click', hideMenu);
    addTabPanelBtn.addEventListener('click', function() {
        createNewTab();
        hideTabsPanel();
    });
    
    // Panel close buttons
    document.querySelectorAll('.close-panel').forEach(btn => {
        btn.addEventListener('click', function() {
            const panelId = this.getAttribute('data-panel');
            document.getElementById(panelId).style.display = 'none';
        });
    });
    
    // Initialize functions
    function initBrowser() {
        // Set dark mode if enabled
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
        }
        
        // Create first tab
        createNewTab();
        
        // Load homepage
        navigate('https://www.google.com');
    }
    
    function createNewTab(url = 'about:blank', title = 'New Tab') {
        const tabId = currentTabId++;
        const tabElement = document.createElement('div');
        tabElement.className = 'tab';
        tabElement.dataset.tabId = tabId;
        
        const tabTitle = document.createElement('span');
        tabTitle.textContent = title;
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-tab';
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        closeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            closeTab(tabId);
        });
        
        tabElement.appendChild(tabTitle);
        tabElement.appendChild(closeBtn);
        
        tabElement.addEventListener('click', function() {
            switchTab(tabId);
        });
        
        tabBar.insertBefore(tabElement, addTabBtn);
        
        // Add to tabs array
        tabs.push({
            id: tabId,
            element: tabElement,
            url: url,
            title: title,
            favicon: ''
        });
        
        // Switch to the new tab
        switchTab(tabId);
        
        // Update tabs panel if open
        updateTabsPanel();
    }
    
    function switchTab(tabId) {
        // Find the tab
        const tab = tabs.find(t => t.id === tabId);
        if (!tab) return;
        
        // Update UI
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.element.classList.add('active');
        
        // Update frame
        frame.src = tab.url;
        addressBar.value = tab.url;
        statusText.textContent = `Loaded ${tab.title}`;
        
        // Update security info
        updateSecurityInfo(tab.url);
    }
    
    function closeTab(tabId) {
        if (tabs.length <= 1) {
            alert("You can't close the last tab");
            return;
        }
        
        const tabIndex = tabs.findIndex(t => t.id === tabId);
        if (tabIndex === -1) return;
        
        // Remove from DOM
        tabBar.removeChild(tabs[tabIndex].element);
        
        // Remove from array
        tabs.splice(tabIndex, 1);
        
        // Switch to another tab
        if (tabs.length > 0) {
            switchTab(tabs[0].id);
        }
        
        // Update tabs panel if open
        updateTabsPanel();
    }
    
    function navigate(url) {
        if (!url) return;
        
        // Add https:// if no protocol is specified
        if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('about:')) {
            url = 'https://' + url;
        }
        
        try {
            // Update current tab
            const currentTab = tabs.find(t => t.element.classList.contains('active'));
            if (currentTab) {
                currentTab.url = url;
                currentTab.title = 'Loading...';
                currentTab.element.querySelector('span').textContent = 'Loading...';
            }
            
            frame.src = url;
            addressBar.value = url;
            statusText.textContent = `Loading ${url}...`;
            
            // Update security info
            updateSecurityInfo(url);
            
            // Listen for frame load
            frame.onload = function() {
                try {
                    const title = frame.contentDocument?.title || new URL(url).hostname;
                    statusText.textContent = `Loaded ${title}`;
                    
                    // Update current tab
                    if (currentTab) {
                        currentTab.title = title;
                        currentTab.element.querySelector('span').textContent = title;
                        
                        // Try to get favicon
                        const favicon = frame.contentDocument?.querySelector('link[rel="icon"]')?.href || 
                                       frame.contentDocument?.querySelector('link[rel="shortcut icon"]')?.href;
                        
                        if (favicon) {
                            currentTab.favicon = favicon;
                        }
                    }
                    
                    // Update tabs panel if open
                    updateTabsPanel();
                } catch (e) {
                    console.error('Error updating tab info:', e);
                }
            };
            
            frame.onerror = function() {
                statusText.textContent = `Error loading ${url}`;
                if (currentTab) {
                    currentTab.title = 'Error';
                    currentTab.element.querySelector('span').textContent = 'Error';
                }
            };
        } catch (e) {
            statusText.textContent = `Error: ${e.message}`;
        }
    }
    
    function goBack() {
        try {
            frame.contentWindow.history.back();
        } catch (e) {
            statusText.textContent = "Cannot go back";
        }
    }
    
    function goForward() {
        try {
            frame.contentWindow.history.forward();
        } catch (e) {
            statusText.textContent = "Cannot go forward";
        }
    }
    
    function refreshPage() {
        frame.contentWindow.location.reload();
    }
    
    function goHome() {
        navigate('https://www.google.com');
    }
    
    function updateSecurityInfo(url) {
        if (url.startsWith('https://')) {
            securityInfo.innerHTML = '<i class="fas fa-lock"></i> Secure';
            securityInfo.style.color = '#0a8043';
        } else if (url.startsWith('http://')) {
            securityInfo.innerHTML = '<i class="fas fa-unlock"></i> Not Secure';
            securityInfo.style.color = '#d93025';
        } else {
            securityInfo.innerHTML = '';
        }
    }
    
    function showMenu() {
        menuOverlay.style.display = 'block';
    }
    
    function hideMenu() {
        menuOverlay.style.display = 'none';
    }
    
    function showQuickMenu() {
        // In a real app, this would show a context menu with common actions
        alert('Quick menu: Add more actions here');
    }
    
    function showDownloadsPanel() {
        updateDownloadsList();
        downloadsPanel.style.display = 'block';
    }
    
    function showTabsPanel() {
        updateTabsPanel();
        tabsPanel.style.display = 'block';
    }
    
    function hideTabsPanel() {
        tabsPanel.style.display = 'none';
    }
    
    function updateDownloadsList() {
        downloadsList.innerHTML = '';
        
        if (downloads.length === 0) {
            downloadsList.innerHTML = '<p style="padding: 20px; text-align: center;">No downloads yet</p>';
            return;
        }
        
        downloads.forEach(download => {
            const item = document.createElement('div');
            item.className = 'download-item';
            
            const icon = document.createElement('div');
            icon.className = 'download-icon';
            icon.innerHTML = '<i class="fas fa-file-download"></i>';
            
            const info = document.createElement('div');
            info.className = 'download-info';
            
            const name = document.createElement('div');
            name.className = 'download-name';
            name.textContent = download.name;
            
            const status = document.createElement('div');
            status.className = 'download-status';
            status.textContent = `${download.size} • ${download.status}`;
            
            info.appendChild(name);
            info.appendChild(status);
            
            item.appendChild(icon);
            item.appendChild(info);
            
            downloadsList.appendChild(item);
        });
    }
    
    function updateTabsPanel() {
        tabsGrid.innerHTML = '';
        
        tabs.forEach(tab => {
            const thumbnail = document.createElement('div');
            thumbnail.className = 'tab-thumbnail';
            thumbnail.dataset.tabId = tab.id;
            
            // In a real app, you would capture the actual page thumbnail
            // This is just a placeholder
            const img = document.createElement('div');
            img.style.background = '#f1f3f4';
            img.style.height = '100%';
            img.style.display = 'flex';
            img.style.alignItems = 'center';
            img.style.justifyContent = 'center';
            img.innerHTML = '<i class="fas fa-globe" style="font-size: 40px; color: #5f6368;"></i>';
            
            const title = document.createElement('div');
            title.className = 'tab-thumbnail-title';
            title.textContent = tab.title;
            
            thumbnail.appendChild(img);
            thumbnail.appendChild(title);
            
            thumbnail.addEventListener('click', function() {
                switchTab(tab.id);
                hideTabsPanel();
            });
            
            tabsGrid.appendChild(thumbnail);
        });
    }
    
    function toggleDarkMode() {
        isDarkMode = !isDarkMode;
        document.body.classList.toggle('dark-mode', isDarkMode);
        
        if (isDarkMode) {
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
        } else {
            darkModeToggle.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
        }
        
        localStorage.setItem('darkMode', isDarkMode);
    }
    
    function clearBrowsingData() {
        if (confirm('Clear all browsing data (history, cookies, cache)?')) {
            // In a real app, you would clear actual data storage
            alert('Browsing data cleared');
            hideMenu();
        }
    }
    
    function showSettings() {
        alert('Settings panel coming soon!');
        hideMenu();
    }
    
    // Simulate a download (for demo purposes)
    function simulateDownload() {
        const downloadId = downloads.length + 1;
        const fileName = `file_${downloadId}.pdf`;
        const fileSize = `${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 99)} MB`;
        
        downloads.unshift({
            id: downloadId,
            name: fileName,
            size: fileSize,
            status: 'Completed',
            date: new Date().toLocaleString()
        });
        
        // Show download notification
        statusText.textContent = `Download complete: ${fileName}`;
        
        // Update downloads panel if open
        if (downloadsPanel.style.display === 'block') {
            updateDownloadsList();
        }
    }
    
    // Demo: Add some sample downloads
    setTimeout(() => {
        downloads = [
            {
                id: 1,
                name: 'document.pdf',
                size: '2.45 MB',
                status: 'Completed',
                date: '2023-05-15 10:30'
            },
            {
                id: 2,
                name: 'presentation.pptx',
                size: '4.12 MB',
                status: 'Completed',
                date: '2023-05-14 15:45'
            }
        ];
    }, 1000);
    
    // For demo purposes - simulate a download every 30 seconds
    setInterval(simulateDownload, 30000);
});
