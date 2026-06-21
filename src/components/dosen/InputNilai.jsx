import { useState } from "react";

function InputNilai() {
  const [dataNilai, setDataNilai] = useState([
    { nama: "Ahmad Syarif", nim: "202601", h: 100, t: 85, uts: 80, uas: 90 },
    { nama: "Siti Aminah", nim: "202602", h: 95, t: 75, uts: 85, uas: 80 },
    { nama: "Budi Santoso", nim: "202603", h: 80, t: 70, uts: 75, uas: 75 },
  ]);

  const hitungFinal = (h, t, uts, uas) => {
    return (h * 0.1 + t * 0.2 + uts * 0.3 + uas * 0.4).toFixed(1);
  };

  const handleNilaiChange = (index, field, value) => {
    const newData = [...dataNilai];
    newData[index][field] = Number(value);
    setDataNilai(newData);
  };

  const handleReset = () => {
    setDataNilai([
      { nama: "Ahmad Syarif", nim: "202601", h: 100, t: 85, uts: 80, uas: 90 },
      { nama: "Siti Aminah", nim: "202602", h: 95, t: 75, uts: 85, uas: 80 },
      { nama: "Budi Santoso", nim: "202603", h: 80, t: 70, uts: 75, uas: 75 },
    ]);
  };

  const handleSimpan = () => {
    alert("Nilai berhasil disimpan!");
    console.log("Data Nilai:", dataNilai);
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold mb-1">Input Nilai Mahasiswa</h3>
          <p className="text-muted small mb-0">
            Silakan pilih kelas dan isi komponen nilai di bawah ini.
          </p>
        </div>

        <div className="d-flex gap-2">
          <select
            className="form-select border-0 shadow-sm rounded-3"
            style={{ minWidth: "200px" }}
          >
            <option>F</option>
            <option>I</option>
            <option>A</option>
          </select>
          <button className="btn btn-primary rounded-3 px-4 shadow-sm">
            <i className="bi bi-filter me-2"></i>Filter
          </button>
        </div>
      </div>

      {/* Card Info Kelas */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 bg-primary text-white overflow-hidden">
        <div className="card-body p-4 position-relative">
          <div className="row align-items-center position-relative z-1">
            <div className="col-md-8">
              <span className="badge bg-white text-primary rounded-pill px-3 mb-2 fw-bold">
                INF-202
              </span>
              <h4 className="fw-bold mb-1">Basis Data</h4>
              <p className="mb-0 opacity-75 small">
                <i className="bi bi-people me-2"></i>Total 42 Mahasiswa
                Terdaftar
              </p>
            </div>
          </div>
          <i
            className="bi bi-database position-absolute end-0 bottom-0 opacity-25 me-3"
            style={{ fontSize: "80px", transform: "translateY(20%)" }}
          ></i>
        </div>
      </div>

      {/* Tabel Nilai */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr
                className="text-muted small text-uppercase fw-bold"
                style={{ fontSize: "11px" }}
              >
                <th className="ps-4 py-3">Mahasiswa</th>
                <th className="text-center">Tugas</th>
                <th className="text-center">UTS</th>
                <th className="text-center">UAS</th>
                <th className="text-center">Presensi</th>
                <th className="text-center pe-4">Nilai Akhir</th>
              </tr>
            </thead>
            <tbody>
              {dataNilai.map((item, index) => {
                const final = hitungFinal(item.h, item.t, item.uts, item.uas);
                return (
                  <tr key={index}>
                    <td className="ps-4 py-3">
                      <p className="fw-bold mb-0 text-dark">{item.nama}</p>
                      <p className="text-muted mb-0 small">{item.nim}</p>
                    </td>
                    <td className="text-center">
                      <input
                        type="number"
                        className="form-control form-control-sm mx-auto text-center border-0 bg-light"
                        value={item.h}
                        onChange={(e) =>
                          handleNilaiChange(index, "h", e.target.value)
                        }
                        style={{ width: "60px" }}
                      />
                    </td>
                    <td className="text-center">
                      <input
                        type="number"
                        className="form-control form-control-sm mx-auto text-center border-0 bg-light"
                        value={item.t}
                        onChange={(e) =>
                          handleNilaiChange(index, "t", e.target.value)
                        }
                        style={{ width: "60px" }}
                      />
                    </td>
                    <td className="text-center">
                      <input
                        type="number"
                        className="form-control form-control-sm mx-auto text-center border-0 bg-light"
                        value={item.uts}
                        onChange={(e) =>
                          handleNilaiChange(index, "uts", e.target.value)
                        }
                        style={{ width: "60px" }}
                      />
                    </td>
                    <td className="text-center">
                      <input
                        type="number"
                        className="form-control form-control-sm mx-auto text-center border-0 bg-light"
                        value={item.uas}
                        onChange={(e) =>
                          handleNilaiChange(index, "uas", e.target.value)
                        }
                        style={{ width: "60px" }}
                      />
                    </td>
                    <td className="text-center pe-4 fw-bold">
                      <span
                        className={
                          final >= 75 ? "text-success" : "text-primary"
                        }
                      >
                        {final}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="card-footer bg-white border-0 p-4 text-end">
          <button
            className="btn btn-outline-secondary rounded-3 me-2 px-4"
            onClick={handleReset}
          >
            Batalkan
          </button>
          <button
            className="btn btn-primary rounded-3 px-4 shadow-sm"
            onClick={handleSimpan}
          >
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
}

export default InputNilai;
