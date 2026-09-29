import axios from "axios";

// FastAPI validation errors (422) return `detail` as a list of objects. Many screens show
// `err.response.data.detail` in a toast, and rendering an object there crashes React.
// Normalise it to a readable sentence once, for every request in the app.
axios.interceptors.response.use(undefined, (error) => {
  const data = error?.response?.data;
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
