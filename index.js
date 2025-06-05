// zapstack-auth/index.js
import { jwtDecode } from "jwt-decode";
const ZapAuth = {
  init({ backendUrl, redirectUrl }) {
    this.backendUrl = backendUrl;
    this.redirectUrl = redirectUrl;
  },
  loginWithGoogle() {
    window.location.href = `${this.backendUrl}/auth/google`;
  },
  loginWithGithub() {
    window.location.href = `${this.backendUrl}/auth/github`;
  },
  decodeToken(token) {
    return jwtDecode(token);
  },
};

export default ZapAuth;
