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
  },
  loginWithGoogle() {
    const url = `${config.backendUrl}/auth/google?zap_key=${config.zapKey}`;
    window.location.href = url;
  },
  loginWithGithub() {
    const url = `${config.backendUrl}/auth/github?zap_key=${config.zapKey}`;
    window.location.href = url;
  },
  decodeToken(token) {
    return jwtDecode(token);
  },
};

module.exports = ZapAuth;



