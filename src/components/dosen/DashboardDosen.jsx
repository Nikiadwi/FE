function DashboardDosen() {
  return (
    <div className="animate-fade-in">
      {/* Welcome Card */}
      <div className="card border-0 shadow-sm rounded-4 bg-primary text-white overflow-hidden mb-4">
        <div className="card-body p-4 p-md-5 position-relative">
          <div className="row align-items-center position-relative z-1">
            <div className="col-md-8">
              <h2 className="fw-bold mb-2">Selamat Datang, Riki👋</h2>
              <p className="mb-0 opacity-75">
                Manajemen Nilai • Manajemen Basis Data
              </p>
            </div>
          </div>
          <i
            className="bi bi-person-workspace position-absolute end-0 bottom-0 opacity-10 me-4 mb-n2"
            style={{ fontSize: "150px" }}
          ></i>
        </div>
      </div>

      {/* Row */}
      <div className="row g-4">
        {/* Aksi Cepat */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4 d-flex flex-column justify-content-center">
              <h5 className="fw-bold mb-4 text-center text-muted small text-uppercase">
                Aksi Cepat
              </h5>
              <button
                className="btn btn-primary p-4 border-0 rounded-4 shadow d-flex flex-column align-items-center w-100"
                onClick={() => {
                  // Navigasi ke Input Nilai (nanti dihandle di parent)
                  document.dispatchEvent(
                    new CustomEvent("menuChange", { detail: "inputnilai" }),
                  );
                }}
              >
                <i className="bi bi-pencil-square fs-1 mb-3"></i>
                <span className="fw-bold">Input Nilai</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mata Kuliah Aktif */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 h-100 p-4">
            <h5 className="fw-bold mb-4 text-muted small text-uppercase">
              Mata Kuliah Aktif
            </h5>
            <div className="p-4 rounded-4 border border-2 border-light shadow-sm">
              <span className="badge bg-primary-subtle text-primary mb-3 fw-bold">
                INF-202
              </span>
              <h3 className="fw-bold text-dark mb-4">Manajemen Basis Data</h3>
              <div className="row g-3">
                <div className="col-md-4 small">
                  <i className="bi bi-clock me-2 text-primary"></i>Selasa, 08:00
                </div>
                <div className="col-md-4 small">
                  <i className="bi bi-geo-alt me-2 text-primary"></i>Lab Komp 03
                </div>
                <div className="col-md-4 small">
                  <i className="bi bi-people me-2 text-primary"></i>42 Mahasiswa
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardDosen;
