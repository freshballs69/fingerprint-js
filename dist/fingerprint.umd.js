(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Fingerprint = {}));
})(this, (function (exports) { 'use strict';

    async function sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    function murmur3(str, seed = 0) {
        let h1 = seed >>> 0;
        const c1 = 0xcc9e2d51;
        const c2 = 0x1b873593;
        for (let i = 0; i < str.length; i++) {
            let k1 = str.charCodeAt(i);
            k1 = Math.imul(k1, c1);
            k1 = (k1 << 15) | (k1 >>> 17);
            k1 = Math.imul(k1, c2);
            h1 ^= k1;
            h1 = (h1 << 13) | (h1 >>> 19);
            h1 = Math.imul(h1, 5) + 0xe6546b64;
        }
        h1 ^= str.length;
        h1 ^= h1 >>> 16;
        h1 = Math.imul(h1, 0x85ebca6b);
        h1 ^= h1 >>> 13;
        h1 = Math.imul(h1, 0xc2b2ae35);
        h1 ^= h1 >>> 16;
        return h1 >>> 0;
    }

    function getUserAgent() {
        return navigator.userAgent;
    }
    function getLanguage() {
        return navigator.language;
    }
    function getLanguages() {
        return Array.from(navigator.languages || [navigator.language]);
    }
    function getPlatform() {
        return navigator.platform;
    }
    function getVendor() {
        return navigator.vendor || '';
    }
    function getVendorFlavors() {
        const dominated = [];
        const domPropNames = Object.getOwnPropertyNames(window);
        const vendorChecks = {
            chrome: ['chrome'],
            firefox: ['InstallTrigger'],
            safari: ['safari'],
            edge: ['msWriteProfilerMark'],
            opera: ['opr', 'opera'],
        };
        for (const [browser, props] of Object.entries(vendorChecks)) {
            for (const prop of props) {
                if (domPropNames.includes(prop) || prop in window) {
                    dominated.push(browser);
                    break;
                }
            }
        }
        return dominated;
    }
    function getDoNotTrack() {
        return navigator.doNotTrack || null;
    }
    function getCookiesEnabled() {
        try {
            document.cookie = 'fp_test=1';
            const result = document.cookie.indexOf('fp_test=') !== -1;
            document.cookie = 'fp_test=1; expires=Thu, 01 Jan 1970 00:00:00 UTC';
            return result;
        }
        catch (_a) {
            return false;
        }
    }
    function getWebdriverPresent() {
        const signals = [];
        // Standard WebDriver flag (Selenium, Puppeteer, Playwright)
        if (navigator.webdriver === true) {
            signals.push('navigator.webdriver');
        }
        // ChromeDriver detection
        const docKeys = Object.keys(document);
        for (const key of docKeys) {
            if (key.startsWith('$cdc_') || key.startsWith('$wdc_')) {
                signals.push('chromedriver');
                break;
            }
        }
        // Window-based automation detection
        const win = window;
        if (win.callPhantom || win._phantom || win.phantom) {
            signals.push('phantomjs');
        }
        if (win.__nightmare) {
            signals.push('nightmare');
        }
        if (win.domAutomation || win.domAutomationController) {
            signals.push('domAutomation');
        }
        // Selenium-specific
        if (win._selenium || win.__webdriver_script_fn || win.__driver_evaluate ||
            win.__webdriver_evaluate || win.__selenium_evaluate || win.__fxdriver_evaluate ||
            win.__driver_unwrapped || win.__webdriver_unwrapped || win.__selenium_unwrapped ||
            win.__fxdriver_unwrapped || win._Selenium_IDE_Recorder || win._WEBDRIVER_ELEM_CACHE) {
            signals.push('selenium');
        }
        // Webdriver async executor (Selenium)
        if (win.__$webdriverAsyncExecutor) {
            signals.push('webdriverAsyncExecutor');
        }
        // Generic webdriver property on window
        if (win.webdriver || win.__webdriverFunc) {
            signals.push('webdriverWindow');
        }
        // Cypress
        if (win.Cypress) {
            signals.push('cypress');
        }
        // Check for headless indicators in user agent
        const ua = navigator.userAgent.toLowerCase();
        if (ua.includes('headless')) {
            signals.push('headlessUA');
        }
        return {
            detected: signals.length > 0,
            signals,
        };
    }

    function getColorDepth() {
        return screen.colorDepth;
    }
    function getScreenResolution() {
        return [screen.width, screen.height];
    }
    function getAvailableScreenResolution() {
        return [screen.availWidth, screen.availHeight];
    }

    function getTimezone() {
        try {
            return Intl.DateTimeFormat().resolvedOptions().timeZone;
        }
        catch (_a) {
            return '';
        }
    }
    function getTimezoneOffset() {
        return new Date().getTimezoneOffset();
    }

    function hasSessionStorage() {
        try {
            return !!window.sessionStorage;
        }
        catch (_a) {
            return false;
        }
    }
    function hasLocalStorage() {
        try {
            return !!window.localStorage;
        }
        catch (_a) {
            return false;
        }
    }
    function hasIndexedDb() {
        try {
            return !!window.indexedDB;
        }
        catch (_a) {
            return false;
        }
    }

    function getHardwareConcurrency() {
        return navigator.hardwareConcurrency || 0;
    }
    function getDeviceMemory() {
        return navigator.deviceMemory || null;
    }
    function getMaxTouchPoints() {
        return navigator.maxTouchPoints || 0;
    }

    function getCanvasFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx)
                return '';
            canvas.width = 200;
            canvas.height = 50;
            // Draw text with specific styling
            ctx.textBaseline = 'alphabetic';
            ctx.font = '14px Arial';
            ctx.fillStyle = '#f60';
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = '#069';
            ctx.fillText('Fingerprint', 2, 15);
            ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
            ctx.fillText('Canvas Test', 4, 45);
            // Draw shapes
            ctx.globalCompositeOperation = 'multiply';
            ctx.fillStyle = 'rgb(255,0,255)';
            ctx.beginPath();
            ctx.arc(50, 50, 50, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = 'rgb(0,255,255)';
            ctx.beginPath();
            ctx.arc(100, 50, 50, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();
            const dataUrl = canvas.toDataURL();
            return murmur3(dataUrl).toString(16);
        }
        catch (_a) {
            return '';
        }
    }

    function getWebGLInfo() {
        const result = {
            vendor: '',
            renderer: '',
            version: '',
        };
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (!gl || !(gl instanceof WebGLRenderingContext)) {
                return result;
            }
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                result.vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '';
                result.renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
            }
            result.version = gl.getParameter(gl.VERSION) || '';
        }
        catch (_a) {
            // WebGL not available
        }
        return result;
    }

    const FONT_LIST = [
        'Arial',
        'Arial Black',
        'Arial Narrow',
        'Bookman Old Style',
        'Century',
        'Century Gothic',
        'Comic Sans MS',
        'Courier',
        'Courier New',
        'Georgia',
        'Helvetica',
        'Impact',
        'Lucida Console',
        'Lucida Sans Unicode',
        'Microsoft Sans Serif',
        'Palatino Linotype',
        'Tahoma',
        'Times',
        'Times New Roman',
        'Trebuchet MS',
        'Verdana',
        'Wingdings',
    ];
    const BASE_FONTS = ['monospace', 'sans-serif', 'serif'];
    const TEST_STRING = 'mmmmmmmmmmlli';
    const TEST_SIZE = '72px';
    function getAvailableFonts() {
        const available = [];
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return available;
        const getWidth = (fontFamily) => {
            ctx.font = `${TEST_SIZE} ${fontFamily}`;
            return ctx.measureText(TEST_STRING).width;
        };
        const baseWidths = {};
        for (const baseFont of BASE_FONTS) {
            baseWidths[baseFont] = getWidth(baseFont);
        }
        for (const font of FONT_LIST) {
            let detected = false;
            for (const baseFont of BASE_FONTS) {
                const testWidth = getWidth(`"${font}", ${baseFont}`);
                if (testWidth !== baseWidths[baseFont]) {
                    detected = true;
                    break;
                }
            }
            if (detected) {
                available.push(font);
            }
        }
        return available;
    }

    async function getAudioFingerprint() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext)
                return 0;
            const context = new AudioContext();
            const oscillator = context.createOscillator();
            const analyser = context.createAnalyser();
            const gain = context.createGain();
            const scriptProcessor = context.createScriptProcessor(4096, 1, 1);
            const destination = context.destination;
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(10000, context.currentTime);
            gain.gain.setValueAtTime(0, context.currentTime);
            oscillator.connect(analyser);
            analyser.connect(scriptProcessor);
            scriptProcessor.connect(gain);
            gain.connect(destination);
            oscillator.start(0);
            const fingerprint = await new Promise((resolve) => {
                const frequencyData = new Float32Array(analyser.frequencyBinCount);
                analyser.getFloatFrequencyData(frequencyData);
                const dataString = frequencyData.slice(0, 50).join(',');
                resolve(murmur3(dataString));
            });
            oscillator.disconnect();
            analyser.disconnect();
            scriptProcessor.disconnect();
            gain.disconnect();
            context.close();
            return fingerprint;
        }
        catch (_a) {
            return 0;
        }
    }

    function getPlugins() {
        const plugins = [];
        if (!navigator.plugins)
            return plugins;
        for (let i = 0; i < navigator.plugins.length; i++) {
            const plugin = navigator.plugins[i];
            if (plugin) {
                plugins.push(plugin.name);
            }
        }
        return plugins.sort();
    }

    function getStunServerHost() {
        if (typeof window !== 'undefined' && window.__stunServerUrl) {
            return window.__stunServerUrl;
        }
        return '';
    }
    function setStunServerHost(url) {
        if (typeof window !== 'undefined') {
            window.__stunServerUrl = url;
        }
    }
    async function getWebRTCInfo(reqId) {
        const result = {
            available: false,
            localIPs: [],
        };
        if (typeof RTCPeerConnection === 'undefined') {
            return result;
        }
        result.available = true;
        // Use STUN URL directly from init response (format: "stun:host:port")
        const stunUrl = getStunServerHost();
        const iceServers = stunUrl ? [{ urls: stunUrl }] : [];
        // Debug logging
        if (typeof console !== 'undefined') {
            console.log('[Fingerprint] WebRTC STUN URL:', stunUrl);
            console.log('[Fingerprint] ICE servers:', JSON.stringify(iceServers));
        }
        try {
            const pc = new RTCPeerConnection({
                iceServers,
            });
            const ips = new Set();
            return new Promise((resolve) => {
                const timeout = setTimeout(() => {
                    pc.close();
                    result.localIPs = Array.from(ips);
                    resolve(result);
                }, 1000);
                pc.onicecandidate = (event) => {
                    if (!event.candidate) {
                        if (typeof console !== 'undefined') {
                            console.log('[Fingerprint] ICE gathering complete, IPs found:', Array.from(ips));
                        }
                        clearTimeout(timeout);
                        pc.close();
                        result.localIPs = Array.from(ips);
                        resolve(result);
                        return;
                    }
                    if (typeof console !== 'undefined') {
                        console.log('[Fingerprint] ICE candidate:', event.candidate.candidate);
                    }
                    const candidate = event.candidate.candidate;
                    const ipMatch = candidate.match(/(\d{1,3}\.){3}\d{1,3}/);
                    if (ipMatch) {
                        ips.add(ipMatch[0]);
                    }
                    const ipv6Match = candidate.match(/([a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/i);
                    if (ipv6Match) {
                        ips.add(ipv6Match[0]);
                    }
                };
                pc.createDataChannel('');
                pc.createOffer()
                    .then((offer) => pc.setLocalDescription(offer))
                    .catch(() => {
                    clearTimeout(timeout);
                    pc.close();
                    resolve(result);
                });
            });
        }
        catch (_a) {
            return result;
        }
    }

    const DEFAULT_BASE_URL = 'http://127.0.0.1:5001';
    function getConfig() {
        var _a, _b;
        let baseUrl = DEFAULT_BASE_URL;
        let trackUrl = null;
        // Check for environment variable (build-time injection via bundlers)
        if (typeof process !== 'undefined') {
            if ((_a = process.env) === null || _a === void 0 ? void 0 : _a.FINGERPRINT_BASE_URL) {
                baseUrl = process.env.FINGERPRINT_BASE_URL;
            }
            if ((_b = process.env) === null || _b === void 0 ? void 0 : _b.TRACK_API) {
                trackUrl = process.env.TRACK_API;
            }
        }
        // Check for window global (runtime configuration) - overrides env vars
        if (typeof window !== 'undefined') {
            const win = window;
            if (win.FINGERPRINT_BASE_URL) {
                baseUrl = win.FINGERPRINT_BASE_URL;
            }
            if (win.TRACK_API) {
                trackUrl = win.TRACK_API;
            }
        }
        // Remove trailing slash if present
        baseUrl = baseUrl.replace(/\/$/, '');
        return {
            baseUrl,
            trackUrl,
        };
    }
    function getInitUrl(publicKey) {
        const config = getConfig();
        const url = new URL(`${config.baseUrl}/api/v2/init`);
        if (publicKey) {
            url.searchParams.set('public_key', publicKey);
        }
        return url.toString();
    }
    function getEndpointUrl() {
        const config = getConfig();
        return `${config.baseUrl}/api/v2/fingerprint`;
    }

    async function sendFingerprint(result, options) {
        const { url, method = 'POST', headers = {} } = options;
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
            body: JSON.stringify(result),
        });
        return response;
    }

    async function collectComponents(options = {}, reqId) {
        const exclude = new Set(options.excludeComponents || []);
        const webglInfo = !exclude.has('webglVendor') || !exclude.has('webglRenderer') || !exclude.has('webglVersion')
            ? getWebGLInfo()
            : { vendor: '', renderer: '', version: '' };
        const audioFingerprint = !exclude.has('audio')
            ? await getAudioFingerprint()
            : 0;
        const webrtcInfo = !exclude.has('webrtcAvailable') || !exclude.has('webrtcLocalIPs')
            ? await getWebRTCInfo()
            : { available: false, localIPs: [] };
        return {
            userAgent: !exclude.has('userAgent') ? getUserAgent() : '',
            language: !exclude.has('language') ? getLanguage() : '',
            languages: !exclude.has('languages') ? getLanguages() : [],
            colorDepth: !exclude.has('colorDepth') ? getColorDepth() : 0,
            screenResolution: !exclude.has('screenResolution') ? getScreenResolution() : [0, 0],
            availableScreenResolution: !exclude.has('availableScreenResolution') ? getAvailableScreenResolution() : [0, 0],
            timezone: !exclude.has('timezone') ? getTimezone() : '',
            timezoneOffset: !exclude.has('timezoneOffset') ? getTimezoneOffset() : 0,
            sessionStorage: !exclude.has('sessionStorage') ? hasSessionStorage() : false,
            localStorage: !exclude.has('localStorage') ? hasLocalStorage() : false,
            indexedDb: !exclude.has('indexedDb') ? hasIndexedDb() : false,
            cookiesEnabled: !exclude.has('cookiesEnabled') ? getCookiesEnabled() : false,
            platform: !exclude.has('platform') ? getPlatform() : '',
            hardwareConcurrency: !exclude.has('hardwareConcurrency') ? getHardwareConcurrency() : 0,
            deviceMemory: !exclude.has('deviceMemory') ? getDeviceMemory() : null,
            maxTouchPoints: !exclude.has('maxTouchPoints') ? getMaxTouchPoints() : 0,
            vendor: !exclude.has('vendor') ? getVendor() : '',
            vendorFlavors: !exclude.has('vendorFlavors') ? getVendorFlavors() : [],
            canvas: !exclude.has('canvas') ? getCanvasFingerprint() : '',
            webglVendor: !exclude.has('webglVendor') ? webglInfo.vendor : '',
            webglRenderer: !exclude.has('webglRenderer') ? webglInfo.renderer : '',
            webglVersion: !exclude.has('webglVersion') ? webglInfo.version : '',
            fonts: !exclude.has('fonts') ? getAvailableFonts() : [],
            audio: !exclude.has('audio') ? audioFingerprint : 0,
            plugins: !exclude.has('plugins') ? getPlugins() : [],
            doNotTrack: !exclude.has('doNotTrack') ? getDoNotTrack() : null,
            webrtcAvailable: !exclude.has('webrtcAvailable') ? webrtcInfo.available : false,
            webrtcLocalIPs: !exclude.has('webrtcLocalIPs') ? webrtcInfo.localIPs : [],
            webdriver: !exclude.has('webdriver') ? getWebdriverPresent() : { detected: false, signals: [] },
        };
    }
    async function getFingerprint(options = {}, reqId) {
        const components = await collectComponents(options);
        const componentsString = JSON.stringify(components);
        const hash = await sha256(componentsString);
        return {
            hash,
            components,
            timestamp: Date.now(),
        };
    }
    function buildTrackUrl(trackUrl, reqId) {
        const url = new URL(trackUrl);
        if (!url.searchParams.has('req_id')) {
            url.searchParams.set('req_id', reqId);
        }
        return url.toString();
    }
    function fireAndForget(trackUrl, reqId) {
        if (!trackUrl) {
            return;
        }
        const url = buildTrackUrl(trackUrl, reqId);
        fetch(url).catch(() => { });
    }
    async function initRequest(publicKey) {
        const initUrl = getInitUrl(publicKey);
        const response = await fetch(initUrl);
        if (!response.ok) {
            throw new Error(`Init failed: ${response.status}`);
        }
        const data = await response.json();
        return {
            reqId: typeof data.req_id === 'string' ? data.req_id : null,
            trackUrl: typeof data.track_url === 'string' ? data.track_url : null,
            stun: typeof data.stun === 'string' ? data.stun : null,
        };
    }
    async function collect(options = {}) {
        const initData = await initRequest(options.public_key);
        if (!initData.reqId) {
            return null;
        }
        // Set STUN server if provided by init response
        if (initData.stun) {
            setStunServerHost(initData.stun);
        }
        const result = await new Promise((resolve, reject) => {
            if (document.readyState === 'complete' || document.readyState === 'interactive') {
                getFingerprint(options, initData.reqId || undefined).then(resolve).catch(reject);
            }
            else {
                document.addEventListener('DOMContentLoaded', () => {
                    getFingerprint(options, initData.reqId || undefined).then(resolve).catch(reject);
                });
            }
        });
        const config = getConfig();
        let reqId = initData.reqId;
        const trackUrl = initData.trackUrl || config.trackUrl;
        const endpointUrl = getEndpointUrl();
        try {
            result.req_id = reqId;
            const response = await sendFingerprint(result, { url: endpointUrl });
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                const data = await response.json();
                if (data && typeof data.req_id === 'string') {
                    reqId = data.req_id;
                }
            }
        }
        catch (_a) {
            // Silently fail if endpoint is unavailable
        }
        fireAndForget(trackUrl, reqId);
        return reqId;
    }
    function createAPI(defaultOptions = {}) {
        return {
            getFingerprint: (options, reqId) => getFingerprint({ ...defaultOptions, ...options }),
            collect: (options) => collect({ ...defaultOptions, ...options }),
            sendFingerprint,
            setStunServerHost,
        };
    }
    const Fingerprint = Object.assign((options) => createAPI(options), {
        getFingerprint,
        collect,
        sendFingerprint,
        setStunServerHost,
    });
    // Auto-initialize when loaded via script tag
    if (typeof window !== 'undefined') {
        window.Fingerprint = Fingerprint;
    }

    exports.collect = collect;
    exports.default = Fingerprint;
    exports.getFingerprint = getFingerprint;
    exports.getStunServerHost = getStunServerHost;
    exports.sendFingerprint = sendFingerprint;
    exports.setStunServerHost = setStunServerHost;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=fingerprint.umd.js.map
