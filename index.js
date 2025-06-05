const {jwtDecode} = require("jwt-decode");

const ZapAuth = {
  init({ backendUrl, redirectUrl, zapKey }) {
    this.backendUrl = backendUrl;
    this.redirectUrl = redirectUrl;
    this.zapKey = zapKey;
  },
  loginWithGoogle() {
    window.location.href = `${this.backendUrl}/auth/google?zap_key=${this.zapKey}`;
  },
  loginWithGithub() {
    window.location.href = `${this.backendUrl}/auth/github?zap_key=${this.zapKey}`;
  },
  decodeToken(token) {
    return jwtDecode(token);
  },
};

module.exports = ZapAuth;
