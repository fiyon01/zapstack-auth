// ZapAuth module
const { jwtDecode } = require("jwt-decode");

let config = {
  backendUrl: "",
  redirectUrl: "",
  zapKey: "",
};

const ZapAuth = {
  init({ backendUrl, redirectUrl, zapKey }) {
    config.backendUrl = backendUrl;
    config.redirectUrl = redirectUrl;
    config.zapKey = zapKey;
    
    // Debug: Log the config to verify zapKey is set
    console.log("ZapAuth initialized with config:", config);
  },

  loginWithGoogle() {
    if (!config.zapKey) {
      console.error("ZapAuth not initialized or zapKey missing");
      return;
    }
    
    const url = `${config.backendUrl}/auth/google?zap_key=${config.zapKey}&redirect_url=${encodeURIComponent(config.redirectUrl)}`;
    console.log("Redirecting to Google auth URL:", url);
    window.location.href = url;
  },

  loginWithGithub() {
    if (!config.zapKey) {
      console.error("ZapAuth not initialized or zapKey missing");
      return;
    }
    
    const url = `${config.backendUrl}/auth/github?zap_key=${config.zapKey}&redirect_url=${encodeURIComponent(config.redirectUrl)}`;
    console.log("Redirecting to Github auth URL:", url);
    window.location.href = url;
  },

  decodeToken(token) {
    return jwtDecode(token);
  },
};

module.exports = ZapAuth;