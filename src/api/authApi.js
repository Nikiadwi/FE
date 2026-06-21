import axios from "axios";

const API_URL = "http://localhost/backend/api";

export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth.php`, {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      return error.response.data;
    }
    throw error;
  }
};
