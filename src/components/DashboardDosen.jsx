import { useState, useEffect } from "react";

function DashboardDosen() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setData({ nama: "Dr. Budi", jumlahMahasiswa: 30 });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Dashboard Dosen</h1>
      <p>Selamat datang, {data?.nama}</p>
      <p>Jumlah mahasiswa: {data?.jumlahMahasiswa}</p>
    </div>
  );
}

export default DashboardDosen;
