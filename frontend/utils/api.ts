import axios from "axios";

// Create an Axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_API_URL,
  withCredentials: true, // Include credentials if needed for cross-origin requests
});

console.log("BASE URL", process.env.NEXT_PUBLIC_BACKEND_API_URL)

// Add an interceptor to include the token
api.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (!token && refreshToken) {
      try {
        // Attempt to refresh the access token
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/users/token/refresh/`,
          { refresh: refreshToken }
        );
        
        console.log("RES")
        console.log(response)

        token = response.data.access; // Get the new access token
        localStorage.setItem("accessToken", token); // Save the new access token
      } catch (error) {
        console.error("Failed to refresh token:", error);
        // Optionally clear tokens and redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login"; // Redirect to login page
        return Promise.reject(error);
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Export the configured Axios instance
export default api;
