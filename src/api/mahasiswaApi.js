import axios from "axios";

const API_URL = "http://localhost/backend/api";

export const getMahasiswa = async () => {
  try {
    const response = await axios.get(`${API_URL}/mahasiswa.php`);
    return response.data;
  } catch (error) {
    console.error("Error fetching mahasiswa:", error);
    throw error;
  }
};

export const getMahasiswaById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/mahasiswa.php?id=${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching mahasiswa by id:", error);
    throw error;
  }
};

export const addMahasiswa = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/mahasiswa.php`, data);
    return response.data;
  } catch (error) {
    console.error("Error adding mahasiswa:", error);
    throw error;
  }
};

export const updateMahasiswa = async (id, data) => {
  try {
    const response = await axios.put(`${API_URL}/mahasiswa.php?id=${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating mahasiswa:", error);
    throw error;
  }
};

export const deleteMahasiswa = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/mahasiswa.php?id=${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting mahasiswa:", error);
    throw error;
  }
};
