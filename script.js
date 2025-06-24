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
    const securityIndicator = document.getElementById('security-indicator');
    const progressBar = document.getElementById('progress-bar');
    const tabsContainer = document.getElementById('tabs-container');
    
    // Overlays
    const menuOverlay = document.getElementById('menu-overlay');
    const themesPanel = document.getElementById('themes-panel');
    const downloadsPanel = document.getElementById('downloads-panel');
    const tabsPanel = document.getElementById('tabs-panel');
    const errorOverlay = document.getElementById('error-overlay');
    
    // Menu buttons
    const newTabMenuBtn = document.getElementById('new-tab-menu');
    const bookmarksMenuBtn = document.getElementById('bookmarks-menu');
    const historyMenuBtn = document.getElementById('history-menu');
    const downloadsMenuBtn = document.getElementById('downloads-menu');
    const themesMenuBtn = document.getElementById('themes-menu');
    const incognitoMenuBtn = document.getElementById('incognito-menu');
    const settingsMenuBtn = document.getElementById('settings-menu');
    const closeMenuBtn = document.getElementById('close-menu');
    const addTabPanelBtn = document.getElementById('add-tab-panel-btn');
    
    // Error handling
    const errorTitle = document.getElementById('error-title');
    const errorMessage = document.getElementById('error-message');
    const errorCloseBtn = document.getElementById('error-close');
    
    // Browser state
    let tabs = [];
    let currentTabId = 1;
    let downloads = [];
    let currentTheme = localStorage.getItem('theme') || 'default-theme';
    let isIncognito = false;
    
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
        showError('Coming Soon', 'Bookmarks feature will be available in the next update!');
        hideMenu();
    });
    
    historyMenuBtn.addEventListener('click', function() {
        showError('Coming Soon', 'History feature will be available in the next update!');
        hideMenu();
    });
    
    downloadsMenuBtn.addEventListener('click', function() {
        showDownloadsPanel();
        hideMenu();
    });
    
    themesMenuBtn.addEventListener('click', function() {
        showThemesPanel();
        hideMenu();
    });
    
    incognitoMenuBtn.addEventListener('click', toggleIncognito);
    settingsMenuBtn.addEventListener('click', showSettings);
    closeMenuBtn.addEventListener('click', hideMenu);
    addTabPanelBtn.addEventListener('click', function() {
        createNewTab();
        hideTabsPanel();
    });
    
    // Panel close buttons
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const panelId = this.getAttribute('data-panel');
            if (panelId) {
                document.getElementById(panelId).style.display = 'none';
            } else {
                hideMenu();
            }
        });
    });
    
    // Theme selection
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            setTheme(theme);
        });
    });
    
    // Error close button
    errorCloseBtn.addEventListener('click', hideError);
    
    // Initialize functions
    function initBrowser() {
        // Set current theme
        document.body.className = currentTheme;
        
        // Create first tab
        createNewTab();
        
        // Load homepage
        navigate('https://www.google.com');
        
        // Simulate some downloads for demo
        setTimeout(() => {
            downloads = [
                {
                    id: 1,
                    name: 'document.pdf',
                    size: '2.45 MB',
                    status: 'Completed',
                    date: new Date().toLocaleString()
                },
                {
                    id: 2,
                    name: 'presentation.pptx',
                    size: '4.12 MB',
                    status: 'Completed',
                    date: new Date().toLocaleString()
                }
            ];
        }, 1000);
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
        
        tabsContainer.appendChild(tabElement);
        
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
        updateSecurityInfo(tab.url);
        
        // Update progress bar
        resetProgressBar();
    }
    
    function closeTab(tabId) {
        if (tabs.length <= 1) {
            showError('Cannot Close Tab', "You can't close the last tab");
            return;
        }
        
        const tabIndex = tabs.findIndex(t => t.id === tabId);
        if (tabIndex === -1) return;
        
        // Remove from DOM
        tabsContainer.removeChild(tabs[tabIndex].element);
        
        // Remove from array
        const removedTab = tabs.splice(tabIndex, 1)[0];
        
        // Switch to another tab
        if (tabs.length > 0) {
            // Try to switch to the next tab, or the previous one
            const newTabIndex = Math.min(tabIndex, tabs.length - 1);
            switchTab(tabs[newTabIndex].id);
        }
        
        // Update tabs panel if open
        updateTabsPanel();
    }
    
    function navigate(url) {
        if (!url) return;
        
        const currentTab = tabs.find(t => t.element.classList.contains('active'));
        if (!currentTab) return;
        
        // Handle about:blank
        if (url === 'about:blank') {
            frame.src = 'about:blank';
            currentTab.url = 'about:blank';
            currentTab.title = 'New Tab';
            currentTab.element.querySelector('span').textContent = 'New Tab';
            addressBar.value = '';
            resetProgressBar();
            return;
        }
        
        // Handle search queries
        if (!url.includes(' ') && !url.includes('.') && !url.startsWith('http')) {
            url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
        }
        // Add https:// if no protocol is specified
        else if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        
        try {
            // Show loading state
            currentTab.url = url;
            currentTab.title = 'Loading...';
            currentTab.element.querySelector('span').textContent = 'Loading...';
            addressBar.value = url;
            
            // Show progress bar
            startProgressBar();
            
            // Try to load directly first
            frame.src = url;
            
            frame.onload = function() {
                try {
                    const title = frame.contentDocument?.title || new URL(url).hostname;
                    currentTab.title = title;
                    currentTab.element.querySelector('span').textContent = title;
