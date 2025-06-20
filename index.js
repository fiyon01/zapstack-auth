import {jwtDecode} from "jwt-decode";

const ZapAuth = (() => {
  const CLIENT_REDIRECT_URL = 'http://localhost:5173/oauth-callback'; // Change to your frontend URL
  const BACKEND_URL = 'http://localhost:4000'; // Your backend URL

  let refreshTimeoutId = null;

  // Start OAuth login by redirecting user to backend with zapKey
  function startOAuth(provider, zapKey) {
    if (!zapKey) throw new Error("zapKey is required");
    window.location.href = `${BACKEND_URL}/auth/${provider}/start?zapKey=${encodeURIComponent(zapKey)}`;
  }

  // Save token securely and setup auto refresh timer
  function saveToken(token) {
    localStorage.setItem("zapToken", token);
    setupRefreshTimer(token, refreshToken);
  }

  // Get token from localStorage
  function getToken() {
    return localStorage.getItem("zapToken");
  }

  // Decode JWT token safely using jwt-decode
  function decodeToken(token) {
    try {
      return jwtDecode(token);
    } catch (e) {
      console.warn("Invalid token:", e);
      return null;
    }
  }

  // Get user info (decoded JWT payload) from stored token
  function getUserInfo() {
    const token = getToken();
    if (!token) return null;
    return decodeToken(token);
  }

  // Setup timer to refresh token 1 minute before expiry
  function setupRefreshTimer(token, refreshFn) {
    clearTimeout(refreshTimeoutId);

    const payload = decodeToken(token);
    if (!payload || !payload.exp) return;

    const expiresAt = payload.exp * 1000; // JWT exp is seconds -> ms
    const now = Date.now();
    const msBeforeExpiry = expiresAt - now;
    const refreshTime = msBeforeExpiry - 60 * 1000; // 1 min before expiry

    if (refreshTime <= 0) {
      // Already expired or close to expiring - refresh now
      refreshFn();
      return;
    }

    refreshTimeoutId = setTimeout(() => {
      refreshFn();
    }, refreshTime);
  }

  // Refresh token by calling backend refresh endpoint
  async function refreshToken() {
    const token = getToken();
    if (!token) {
      console.warn("No token to refresh");
      logout();
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.warn("Token refresh failed, logging out.");
        logout();
        return;
      }

      const data = await response.json();
      if (data.token) {
        saveToken(data.token);
      }
    } catch (error) {
      console.error("Refresh token error:", error);
      logout();
    }
  }

  /**
   * Clear token and refresh timer (logout),
   * then optionally redirect (URL string) or call a callback function.
   * 
   * @param {string|function} redirectOrCallback Optional redirect URL or callback fn.
   */
  function logout(redirectOrCallback) {
    localStorage.removeItem("zapToken");
    clearTimeout(refreshTimeoutId);

    if (typeof redirectOrCallback === "string") {
      window.location.href = redirectOrCallback;
    } else if (typeof redirectOrCallback === "function") {
      redirectOrCallback();
    }
  }

  // Initialize SDK on app load, setup auto refresh if token exists
  function init() {
    const storedToken = getToken();
    if (storedToken) {
      setupRefreshTimer(storedToken, refreshToken);
    }
  }

   /**
   * Handle OAuth callback:
   * - Extract token from `?token=...` in URL (or provided search string)
   * - Save token and setup refresh
   * - Clean URL without reload
   * 
   * @param {string} [search] Optional query string like `?token=abc...` (e.g., from React Router's location.search)
   */
  function handleCallback(search) {
    const query = new URLSearchParams(search || window.location.search);
    const token = query.get("token");

    // If token already exists in storage, assume it was already handled
    const alreadySaved = getToken();
    if (!token && alreadySaved) {
      console.info("✅ Token already saved, skipping callback handling.");
      return;
    }

    if (!token) {
    console.warn("⚠️ No token found in URL, and none saved. Ignoring.");
    return;
    }


    saveToken(token);

    // Clean up URL without reload (removes ?token=...)
    window.history.replaceState({}, document.title, window.location.pathname);
  }



  return {
    startGoogle: (zapKey) => startOAuth("google", zapKey),
    startGitHub: (zapKey) => startOAuth("github", zapKey),
    startFacebook: (zapKey) => startOAuth("facebook", zapKey),
    handleCallback,
    init,
    getToken,
    getUserInfo,
    logout,
  };
})();

export default ZapAuth;
