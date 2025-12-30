// ===== MobileEliteControl Class =====
class MobileEliteControl {
    constructor() {
        if (window.mobileControllerInstance) return window.mobileControllerInstance;
        window.mobileControllerInstance = this;

        this.isProcessing = false;
        this.vibrationEnabled = true;
        this.currentProgress = 0;
        this.init();
        this.setupEventListeners();
        this.restoreState();
    }

    init() {
        // Time update every second
        setInterval(() => this.updateTime(), 1000);

        // Password toggle
        const togglePasswordBtn = document.querySelector('.toggle-password');
        if (togglePasswordBtn) {
            togglePasswordBtn.addEventListener('click', (e) => {
                const input = document.getElementById('password');
                const icon = e.currentTarget.querySelector('i');
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
                this.vibrate(30);
            });
        }

        // Number input update preview
        const numberInput = document.getElementById('numberInput');
        if (numberInput) {
            numberInput.addEventListener('input', (e) => this.updateNumberPreview(e.target.value));
        }

        // Vibration toggle
        const vibrationToggle = document.getElementById('vibrationToggle');
        if (vibrationToggle) {
            vibrationToggle.addEventListener('change', (e) => {
                this.vibrationEnabled = e.target.checked;
            });
        }

        // Autofocus username
        setTimeout(() => {
            const usernameInput = document.getElementById('username');
            if (usernameInput) usernameInput.focus();
        }, 500);
        
        // Update progress from localStorage
        this.currentProgress = parseInt(localStorage.getItem('progressValue') || 0);
        this.updateProgressDisplay();
    }

    setupEventListeners() {
        // Enter key login
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    login();
                }
            });
        }

        const usernameInput = document.getElementById('username');
        if (usernameInput) {
            usernameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    document.getElementById('password').focus();
                }
            });
        }

        // Prevent zoom on double-tap
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) e.preventDefault();
            lastTouchEnd = now;
        }, false);

        // Prevent context menu
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        // Handle escape key for reset
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById("mainPanel") && 
                !document.getElementById("mainPanel").classList.contains("hidden")) {
                resetProgress();
            }
        });
    }

    updateTime() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });
        const shortTimeStr = now.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        const currentTime = document.getElementById('currentTime');
        const headerTime = document.getElementById('headerTime');
        if (currentTime) currentTime.textContent = timeStr;
        if (headerTime) headerTime.textContent = shortTimeStr;
    }

    vibrate(duration) {
        if (this.vibrationEnabled && navigator.vibrate) {
            try { 
                if (Array.isArray(duration)) {
                    navigator.vibrate(duration);
                } else {
                    navigator.vibrate(duration);
                }
            } catch(e) {
                console.log("Vibration not supported or error:", e);
            }
        }
    }

    updateNumberPreview(number) {
        const preview = document.getElementById('numberPreview');
        if (!preview) return;
        if (number && number.trim() !== '') {
            preview.innerHTML = `<span style="color: #ff4444">${this.formatPhoneNumber(number)}</span>`;
        } else {
            preview.innerHTML = '<span style="color: #ff8888">No number entered</span>';
        }
    }

    formatPhoneNumber(number) {
        if (!number) return '';
        const cleaned = number.replace(/\D/g,'');
        if (cleaned.startsWith('62')) {
            const part1 = cleaned.substring(2,5);
            const part2 = cleaned.substring(5,9);
            const part3 = cleaned.substring(9,13);
            let result = `+62`;
            if (part1) result += ` ${part1}`;
            if (part2) result += ` ${part2}`;
            if (part3) result += ` ${part3}`;
            return result.trim();
        }
        return number;
    }

    showToast(message, duration=3000) {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }

    addStatusLog(message) {
        const statusContent = document.getElementById('status');
        if (!statusContent) return;
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });
        const statusLine = document.createElement('div');
        statusLine.className = 'status-line';
        statusLine.innerHTML = `
            <span class="status-time">[${timeStr}]</span>
            <span class="status-text">${message}</span>
        `;
        statusContent.appendChild(statusLine);
        statusContent.scrollTop = statusContent.scrollHeight;
        
        // Limit status log to 10 entries
        const lines = statusContent.querySelectorAll('.status-line');
        if (lines.length > 10) {
            lines[0].remove();
        }
    }

    saveState(progress=0, loggedIn=false) {
        localStorage.setItem('progressValue', progress);
        localStorage.setItem('loggedIn', loggedIn ? 'true' : 'false');
    }

    restoreState() {
        const savedProgress = parseInt(localStorage.getItem('progressValue') || 0);
        this.currentProgress = savedProgress;
        
        const loggedIn = localStorage.getItem('loggedIn') === 'true';
        const loginPanel = document.getElementById('loginPanel');
        const mainPanel = document.getElementById('mainPanel');
        if (loginPanel && mainPanel) {
            if (loggedIn) { 
                loginPanel.classList.add('hidden'); 
                mainPanel.classList.remove('hidden'); 
            } else { 
                loginPanel.classList.remove('hidden'); 
                mainPanel.classList.add('hidden'); 
            }
        }
        
        this.updateProgressDisplay();
    }
    
    updateProgressDisplay() {
        const bar = document.getElementById("bar");
        const progressValue = document.getElementById("progressValue");
        const steps = document.querySelectorAll('.progress-steps .step');
        
        if (bar) bar.style.width = this.currentProgress + "%";
        if (progressValue) progressValue.textContent = this.currentProgress + "%";
        
        // Update progress steps
        if (steps.length > 0) {
            steps.forEach((step, index) => {
                step.classList.remove('active');
            });
            
            // Activate steps based on progress
            if (this.currentProgress >= 0) steps[0]?.classList.add('active');
            if (this.currentProgress >= 20) steps[1]?.classList.add('active');
            if (this.currentProgress >= 40) steps[2]?.classList.add('active');
            if (this.currentProgress >= 60) steps[3]?.classList.add('active');
            if (this.currentProgress >= 80) steps[4]?.classList.add('active');
        }
    }
    
    resetAll() {
        this.currentProgress = 0;
        localStorage.setItem('progressValue', 0);
        this.updateProgressDisplay();
        
        // Clear number input
        const numberInput = document.getElementById('numberInput');
        if (numberInput) {
            numberInput.value = '';
            this.updateNumberPreview('');
        }
        
        // Close popup if open
        const popup = document.getElementById('popup');
        if (popup && popup.classList.contains('show')) {
            popup.classList.remove('show');
        }
        
        // Reset button state
        const delayBtn = document.getElementById('delayBtn');
        if (delayBtn) {
            delayBtn.disabled = false;
            delayBtn.innerHTML = '<i class="fas fa-clock"></i><span>INITIATE DELAY</span>';
        }
        
        this.isProcessing = false;
        this.addStatusLog("=== SYSTEM RESET COMPLETE ===");
        this.addStatusLog("All progress cleared");
        this.addStatusLog("Ready for new target");
        this.vibrate([100, 50, 100]);
        this.showToast("System fully reset", 2000);
    }
}

// ===== Initialize controller =====
let mobileController;
document.addEventListener('DOMContentLoaded', () => { 
    mobileController = new MobileEliteControl(); 
});

// ===== Show Hint Function =====
function showHint() {
    const hintBox = document.getElementById('hintBox');
    if (hintBox) {
        hintBox.classList.toggle('hidden');
        if (mobileController) {
            mobileController.vibrate(50);
        }
    }
}

// ===== Clear Form Function =====
function clearForm() {
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('loginStatus').textContent = '';
    
    // Hide hint box if open
    const hintBox = document.getElementById('hintBox');
    if (hintBox && !hintBox.classList.contains('hidden')) {
        hintBox.classList.add('hidden');
    }
    
    // Focus on username
    document.getElementById('username').focus();
    
    if (mobileController) {
        mobileController.vibrate(30);
        mobileController.showToast("Form cleared", 1500);
    }
}

// ===== Login Function =====
function login() {
    if (mobileController && mobileController.isProcessing) return;

    const u = document.getElementById("username").value.trim();
    const p = document.getElementById("password").value.trim();
    const status = document.getElementById("loginStatus");
    const loginBtn = document.getElementById("loginBtn");
    
    if (loginBtn) {
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> AUTHENTICATING...';
    }

    mobileController.isProcessing = true;
    
    // Simulate authentication delay
    setTimeout(() => {
        if(u === "azfla" && p === "manusia") {
            if(status) { 
                status.textContent = "ACCESS GRANTED"; 
                status.style.color="#00ff44";
                status.style.textShadow = "0 0 10px #00ff44";
            }
            mobileController.addStatusLog("=== AUTHENTICATION SUCCESSFUL ===");
            mobileController.addStatusLog("User: azfla authorized");
            mobileController.showToast("Access granted", 2000);
            mobileController.saveState(mobileController.currentProgress, true);
            mobileController.vibrate([100, 50, 100]);

            setTimeout(() => {
                document.getElementById("loginPanel").classList.add("hidden");
                document.getElementById("mainPanel").classList.remove("hidden");
                mobileController.isProcessing = false;
                
                if (loginBtn) {
                    loginBtn.disabled = false;
                    loginBtn.innerHTML = '<span class="btn-text">LOGIN</span>';
                }
                
                // Focus on number input
                setTimeout(() => {
                    const numberInput = document.getElementById('numberInput');
                    if (numberInput) numberInput.focus();
                }, 300);
            }, 700);
        } else {
            if(status) { 
                status.textContent="ACCESS DENIED"; 
                status.style.color="#ff4444";
                status.style.textShadow = "0 0 10px #ff4444";
            }
            mobileController.addStatusLog("Authentication failed - Invalid credentials");
            mobileController.vibrate([200, 100, 200, 100, 200]);
            mobileController.isProcessing = false;
            
            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.innerHTML = '<span class="btn-text">LOGIN</span>';
            }
            
            shakeElement(document.getElementById("loginPanel"));
        }
    }, 800);
}

// ===== Logout Function =====
function logout() {
    mobileController.vibrate(100);
    mobileController.isProcessing = false;
    mobileController.saveState(mobileController.currentProgress, false);

    const mainPanel = document.getElementById("mainPanel");
    const loginPanel = document.getElementById("loginPanel");
    if(mainPanel && loginPanel) {
        mainPanel.classList.add("hidden");
        loginPanel.classList.remove("hidden");
        
        // Clear login form
        document.getElementById("username").value = "";
        document.getElementById("password").value = "";
        const loginStatus = document.getElementById("loginStatus");
        if (loginStatus) {
            loginStatus.textContent = "";
            loginStatus.style.color = "";
            loginStatus.style.textShadow = "";
        }
        
        // Reset password visibility
        document.getElementById('password').type = 'password';
        const toggleIcon = document.querySelector('.toggle-password i');
        if(toggleIcon) { 
            toggleIcon.classList.remove('fa-eye-slash'); 
            toggleIcon.classList.add('fa-eye'); 
        }
        
        // Hide hint box
        const hintBox = document.getElementById('hintBox');
        if (hintBox && !hintBox.classList.contains('hidden')) {
            hintBox.classList.add('hidden');
        }
        
        // Focus on username
        setTimeout(() => {
            document.getElementById('username').focus();
        }, 300);
        
        mobileController.showToast("Logged out successfully", 1500);
        mobileController.addStatusLog("=== USER LOGGED OUT ===");
    }
}

// ===== Shake effect =====
function shakeElement(el){
    if(!el) return;
    el.style.animation="shakeMobile 0.5s";
    el.addEventListener("animationend",()=>{ 
        el.style.animation=""; 
    },{once:true});
}

// ===== Start Fake Delay =====
function startFake() {
    if (mobileController && mobileController.isProcessing) return;

    const number = document.getElementById("numberInput").value.trim();
    if (!number || !number.startsWith("+62")) {
        mobileController.showToast("Enter valid +62 number", 2000);
        mobileController.vibrate([100, 50, 100]);
        shakeElement(document.querySelector(".target-input-section"));
        return;
    }

    mobileController.isProcessing = true;
    const bar = document.getElementById("bar");
    const progressValue = document.getElementById("progressValue");
    const popup = document.getElementById("popup");
    const text = document.getElementById("popupText");
    const delayBtn = document.getElementById("delayBtn");
    
    if (delayBtn) {
        delayBtn.disabled = true;
        delayBtn.innerHTML = '<i class="fas fa-cog fa-spin"></i><span>PROCESSING...</span>';
    }

    mobileController.addStatusLog("=== INITIATING DELAY SEQUENCE ===");
    mobileController.addStatusLog(`Target: ${mobileController.formatPhoneNumber(number)}`);
    mobileController.vibrate(200);

    const interval = setInterval(() => {
        mobileController.currentProgress += 2;
        
        // Save to localStorage
        localStorage.setItem('progressValue', mobileController.currentProgress);
        
        // Update display
        if(bar) bar.style.width = mobileController.currentProgress + "%";
        if(progressValue) progressValue.textContent = Math.min(mobileController.currentProgress, 100) + "%";
        
        // Update steps
        const steps = document.querySelectorAll('.progress-steps .step');
        if (steps.length > 0) {
            if (mobileController.currentProgress >= 20) steps[1]?.classList.add('active');
            if (mobileController.currentProgress >= 40) steps[2]?.classList.add('active');
            if (mobileController.currentProgress >= 60) steps[3]?.classList.add('active');
            if (mobileController.currentProgress >= 80) steps[4]?.classList.add('active');
        }
        
        // Status updates at certain percentages
        if (mobileController.currentProgress === 20) {
            mobileController.addStatusLog("Scanning target network...");
            mobileController.vibrate(50);
        }
        if (mobileController.currentProgress === 40) {
            mobileController.addStatusLog("Synchronizing protocols...");
            mobileController.vibrate(50);
        }
        if (mobileController.currentProgress === 60) {
            mobileController.addStatusLog("Injecting delay parameters...");
            mobileController.vibrate(50);
        }
        if (mobileController.currentProgress === 80) {
            mobileController.addStatusLog("Finalizing sequence...");
            mobileController.vibrate(50);
        }
        
        if (mobileController.currentProgress >= 100) {
            clearInterval(interval);
            mobileController.isProcessing = false;
            
            // Success vibration pattern
            mobileController.vibrate([100, 50, 100, 50, 200]);
            
            // Show popup
            if(text && popup) { 
                text.textContent = `${mobileController.formatPhoneNumber(number)} TELAH DI MASUKKAN BUG💀`; 
                popup.classList.add("show"); 
            }
            
            // Update status
            mobileController.addStatusLog("=== DELAY SEQUENCE COMPLETE ===");
            mobileController.addStatusLog("Target successfully compromised");
            mobileController.addStatusLog("System ready for next target");
            
            // Reset button after delay
            setTimeout(() => {
                if (delayBtn) {
                    delayBtn.disabled = false;
                    delayBtn.innerHTML = '<i class="fas fa-clock"></i><span>INITIATE DELAY</span>';
                }
            }, 1000);
        }
    }, 100);
}

// ===== Reset Progress Function =====
function resetProgress() {
    if (mobileController) {
        mobileController.resetAll();
    } else {
        // Fallback reset if controller not initialized
        const bar = document.getElementById("bar");
        const progressValue = document.getElementById("progressValue");
        const steps = document.querySelectorAll('.progress-steps .step');
        const delayBtn = document.getElementById("delayBtn");
        const popup = document.getElementById("popup");
        const numberInput = document.getElementById("numberInput");
        
        // Reset progress bar
        if(bar) bar.style.width = "0%";
        if(progressValue) progressValue.textContent = "0%";
        
        // Reset localStorage
        localStorage.setItem('progressValue', 0);
        
        // Reset progress steps
        if(steps.length > 0) {
            steps.forEach((step, index) => {
                step.classList.remove('active');
                if(index === 0) {
                    step.classList.add('active');
                }
            });
        }
        
        // Reset button state
        if(delayBtn) {
            delayBtn.disabled = false;
            delayBtn.innerHTML = '<i class="fas fa-clock"></i><span>INITIATE DELAY</span>';
        }
        
        // Close popup if open
        if(popup && popup.classList.contains('show')) {
            popup.classList.remove('show');
        }
        
        // Clear number input
        if(numberInput) {
            numberInput.value = '';
            const preview = document.getElementById('numberPreview');
            if(preview) {
                preview.innerHTML = '<span style="color: #ff8888">No number entered</span>';
            }
        }
        
        // Show toast
        const toast = document.getElementById('toast');
        if(toast) {
            toast.textContent = "System reset complete";
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 2000);
        }
        
        // Add status log
        const statusContent = document.getElementById('status');
        if(statusContent) {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
            });
            const statusLine = document.createElement('div');
            statusLine.className = 'status-line';
            statusLine.innerHTML = `
                <span class="status-time">[${timeStr}]</span>
                <span class="status-text">System reset - Ready for new target</span>
            `;
            statusContent.appendChild(statusLine);
        }
        
        // Try to vibrate
        if(navigator.vibrate) {
            try {
                navigator.vibrate([100, 50, 100]);
            } catch(e) {}
        }
    }
}

// ===== Close Popup =====
function closePopup() {
    const popup = document.getElementById("popup");
    if(popup) popup.classList.remove("show");
    if(mobileController) mobileController.vibrate(50);
}

// ===== Prevent enter default behavior =====
document.addEventListener('keydown', e => {
    if(e.key === 'Enter' && e.target.tagName !== 'INPUT') e.preventDefault();
    if(e.key === 'Enter' && e.target.id === 'username') { 
        e.preventDefault(); 
        document.getElementById('password').focus(); 
    }
    if(e.key === 'Enter' && e.target.id === 'password') { 
        e.preventDefault(); 
        login(); 
    }
});

// ===== Android Back Button Handling =====
window.addEventListener('popstate', e => {
    const mainPanel = document.getElementById("mainPanel");
    if(mainPanel && !mainPanel.classList.contains("hidden")){
        e.preventDefault();
        logout();
        window.history.pushState(null, null, window.location.href);
    }
});

// ===== Initialize on load =====
window.addEventListener('load', function() {
    // Add history state
    window.history.pushState(null, null, window.location.href);
    
    // Initialize controller if not already
    if (!mobileController) {
        mobileController = new MobileEliteControl();
    }
    
    // Check if already logged in (for page refresh)
    const mainPanel = document.getElementById("mainPanel");
    const loginPanel = document.getElementById("loginPanel");
    
    if (mainPanel && loginPanel) {
        // Default to login panel
        loginPanel.classList.remove("hidden");
        mainPanel.classList.add("hidden");
    }
    
    // Add initial status
    setTimeout(() => {
        if (mobileController) {
            mobileController.addStatusLog("=== SYSTEM BOOT COMPLETE ===");
            mobileController.addStatusLog("Mobile Elite Control v1.0.0");
            mobileController.addStatusLog("Ready for authentication");
        }
    }, 1000);
});

// ===== Export for testing =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MobileEliteControl, login, logout, resetProgress, startFake };
}