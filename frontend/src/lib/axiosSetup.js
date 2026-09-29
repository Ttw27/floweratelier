import axios from "axios";

// FastAPI validation errors (422) return `detail` as a list of objects. Many screens show
// `err.response.data.detail` in a toast, and rendering an object there crashes React.
// Normalise it to a readable sentence once, for every request in the app.
axios.interceptors.response.use(undefined, (error) => {
  const data = error?.response?.data;
  // A saved login that is no longer valid (expired, or the site's login secret changed):
  // forget it and send the person to sign in again instead of showing "Invalid token".
  if (error?.response?.status === 401 && ["Invalid token", "Token expired"].includes(data?.detail)) {
    let hadToken = false;
    try { hadToken = !!localStorage.getItem("token"); localStorage.removeItem("token"); } catch {}
    delete axios.defaults.headers.common["Authorization"];
    if (hadToken && !window.location.pathname.startsWith("/login")) {
      const back = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.assign(`/login?expired=1&next=${back}`);
    }
    data.detail = "Your session has expired — please sign in again";
  }
  if (data && Array.isArray(data.detail)) {
    const first = data.detail[0] || {};
    const field = Array.isArray(first.loc) ? first.loc[first.loc.length - 1] : "";
    const msg = String(first.msg || "Please check the form and try again").replace(/^Value error, /, "");
    data.detail = field && typeof field === "string" ? `${field.replace(/_/g, " ")}: ${msg}` : msg;
  } else if (data && data.detail && typeof data.detail !== "string") {
    data.detail = "Something went wrong — please try again";
  }
  return Promise.reject(error);
});
