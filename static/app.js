const maddeListesi = document.getElementById('madde-listesi');
const detayBaslik = document.getElementById('detay-baslik');
const anlamlarContainer = document.getElementById('anlamlar-container');
const btnMaddeEkle = document.getElementById('btn-madde-ekle');
const btnAnlamEkle = document.getElementById('btn-anlam-ekle');
const btnMaddeSil = document.getElementById('btn-madde-sil');
const btnMaddeDuzenle = document.getElementById('btn-madde-duzenle');
const btnExportWord = document.getElementById('btn-export-word');
const maddeButtons = document.getElementById('madde-buttons');
const harfFilter = document.getElementById('harf-filter');
const btnExportAll = document.getElementById('btn-export-all');
const btnKavramHaritasi = document.getElementById('btn-kavram-haritasi');
const graphContainer = document.getElementById('graph-container');
const btnTumunuGoster = document.createElement('button');
let seciliMaddeId = null;

// Alfabe harfleri
const alfabe = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ';

// Harf butonları oluştur
btnTumunuGoster.type = 'button';
btnTumunuGoster.className = 'btn btn-outline-dark btn-sm me-2';
btnTumunuGoster.textContent = 'Tümünü Göster';
btnTumunuGoster.onclick = () => maddeBasliklariniGetir();
harfFilter.appendChild(btnTumunuGoster);
for (let harf of alfabe) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn-outline-secondary btn-sm';
  btn.textContent = harf;
  btn.onclick = () => maddeBasliklariniGetir(harf);
  harfFilter.appendChild(btn);
}

// Madde başlıklarını getir
function maddeBasliklariniGetir(harf = '') {
  fetch(`/api/maddebasilar${harf ? '?harf=' + harf : ''}`)
    .then(res => res.json())
    .then(data => {
      maddeListesi.innerHTML = '';
      data.forEach(madde => {
        const div = document.createElement('div');
        div.className = 'madde-item list-group-item list-group-item-action';
        div.textContent = madde.baslik;
        div.onclick = () => maddeSec(madde.id, div);
        maddeListesi.appendChild(div);
      });

      if (data.length > 0) {
        maddeListesi.children[0].click();
      } else {
        seciliMaddeId = null;
        detayBaslik.textContent = 'Bir madde seçiniz';
        anlamlarContainer.innerHTML = '';
        maddeButtons.style.display = 'none';
        updateExportButton();
      }
    });
}

// Madde seçildiğinde detayları getir
function maddeSec(id, element) {
  seciliMaddeId = id;

  document.querySelectorAll('.madde-item').forEach(item => item.classList.remove('active'));
  element.classList.add('active');

  fetch(`/api/maddebasi/${id}`)
    .then(res => {
      if (!res.ok) throw new Error('Veri çekilemedi');
      return res.json();
    })
    .then(data => {
      detayBaslik.textContent = data.baslik;
      anlamlarContainer.innerHTML = '';
      maddeButtons.style.display = 'block';

      data.anlamlar.forEach(anlam => {
        const card = document.createElement('div');
        card.className = 'card mb-2 p-2';

        const metinEl = document.createElement('p');
        metinEl.textContent = anlam.metin;
        card.appendChild(metinEl);

        if (anlam.kunyeler.length > 0) {
          const künyeEl = document.createElement('ul');
          anlam.kunyeler.forEach(künye => {
            const li = document.createElement('li');
            li.textContent = künye;
            künyeEl.appendChild(li);
          });
          card.appendChild(künyeEl);
        }

        const btnGroup = document.createElement('div');
        btnGroup.className = 'mt-2';

        const btnDuzenle = document.createElement('button');
        btnDuzenle.textContent = 'Düzenle';
        btnDuzenle.className = 'btn btn-sm btn-warning me-2';
        btnDuzenle.onclick = () => anlamDuzenle(anlam.id);

        const btnSil = document.createElement('button');
        btnSil.textContent = 'Sil';
        btnSil.className = 'btn btn-sm btn-danger';
        btnSil.onclick = () => anlamSil(anlam.id);

        btnGroup.appendChild(btnDuzenle);
        btnGroup.appendChild(btnSil);
        card.appendChild(btnGroup);

        anlamlarContainer.appendChild(card);
      });

      updateExportButton();
    })
    .catch(err => {
      console.error(err);
      detayBaslik.textContent = 'Detaylar yüklenemedi';
      anlamlarContainer.innerHTML = '';
      maddeButtons.style.display = 'none';
      updateExportButton();
    });
}

// Yeni madde ekle
btnMaddeEkle.onclick = () => {
  const baslik = prompt("Yeni madde başlığı:");
  if (baslik) {
    fetch('/api/maddebasi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baslik })
    })
    .then(res => {
      if (!res.ok) return res.text().then(text => Promise.reject(text));
      return res.json();
    })
    .then(() => maddeBasliklariniGetir())
    .catch(err => alert("Hata: " + err));
  }
};

// Madde sil
btnMaddeSil.onclick = () => {
  if (!seciliMaddeId) return alert("Önce madde seçiniz.");
  if (confirm("Bu madde silinsin mi?")) {
    fetch(`/api/maddebasi/${seciliMaddeId}`, { method: 'DELETE' })
    .then(res => res.json())
    .then(() => {
      seciliMaddeId = null;
      detayBaslik.textContent = 'Bir madde seçiniz';
      anlamlarContainer.innerHTML = '';
      maddeButtons.style.display = 'none';
      updateExportButton();
      maddeBasliklariniGetir();
    });
  }
};

// Madde düzenle
btnMaddeDuzenle.onclick = () => {
  if (!seciliMaddeId) return alert("Önce madde seçiniz.");
  const yeniBaslik = prompt("Yeni başlık:");
  if (yeniBaslik) {
    fetch(`/api/maddebasi/${seciliMaddeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baslik: yeniBaslik })
    })
    .then(res => res.json())
    .then(() => {
      maddeBasliklariniGetir();
      detayBaslik.textContent = yeniBaslik;
    });
  }
};

// Anlam ekle
btnAnlamEkle.onclick = () => {
  if (!seciliMaddeId) return alert("Önce madde seçiniz.");
  const metin = prompt("Anlam metni:");
  if (!metin) return;
  const künyeMetin = prompt("Künye (virgülle ayır):");
  const kunyeler = künyeMetin ? künyeMetin.split(',').map(s => s.trim()).filter(Boolean) : [];

  fetch('/api/anlam', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ maddebasi_id: seciliMaddeId, metin, kunyeler })
  })
  .then(res => res.json())
  .then(() => maddeSec(seciliMaddeId, document.querySelector('.madde-item.active')));
};

// Anlam sil
function anlamSil(anlamId) {
  if (confirm("Bu anlam silinsin mi?")) {
    fetch(`/api/anlam/${anlamId}`, { method: 'DELETE' })
    .then(res => res.json())
    .then(() => maddeSec(seciliMaddeId, document.querySelector('.madde-item.active')));
  }
}

// Anlam düzenle
function anlamDuzenle(anlamId) {
  const metin = prompt("Yeni anlam metni:");
  if (!metin) return;
  const künyeMetin = prompt("Yeni künye (virgülle ayır):");
  const kunyeler = künyeMetin ? künyeMetin.split(',').map(s => s.trim()).filter(Boolean) : [];

  fetch(`/api/anlam/${anlamId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ metin, kunyeler })
  })
  .then(res => res.json())
  .then(() => maddeSec(seciliMaddeId, document.querySelector('.madde-item.active')));
}

// Word'e Aktar butonu
btnExportWord.onclick = () => {
  if (!seciliMaddeId) return;
  window.open(`/api/maddebasi/${seciliMaddeId}/export-word`, '_blank');
};

// Word butonunu aktif/pasif et
function updateExportButton() {
  btnExportWord.disabled = !seciliMaddeId;
}

// Sayfa yüklendiğinde başlat
window.onload = () => {
  maddeBasliklariniGetir();
  updateExportButton();
}
btnExportAll.onclick = () => {
  window.open('/api/export-all', '_blank');
};

document.getElementById('btn-kavram-haritasi').onclick = () => {
  if (!seciliMaddeId) return alert("Lütfen önce bir madde seçiniz.");

  const container = document.getElementById('graph-container');
  if (container.style.display === 'block') {
    container.style.display = 'none';
    return;
  }

  fetch(`/api/maddebasi/${seciliMaddeId}/kavram-haritasi`)
    .then(res => res.json())
    .then(graph => {
      container.style.display = 'block';
      const dataSet = {
        nodes: new vis.DataSet(graph.nodes),
        edges: new vis.DataSet(graph.edges)
      };
      const options = {
        layout: { hierarchical: { enabled: false } },
        nodes: { shape: 'ellipse', font: { size: 16 } },
        edges: { arrows: 'to' },
        physics: { enabled: true }
      };
      const network = new vis.Network(container, dataSet, options);

      // ⬇️ Yeni: Harita düğmesine tıklanınca detayları getir
      network.on("click", function (params) {
        if (params.nodes.length === 1) {
          const nodeId = params.nodes[0];
          const nodeLabel = dataSet.nodes.get(nodeId).label;

          fetch(`/api/maddebasi/by-baslik/${encodeURIComponent(nodeLabel)}`)
            .then(res => res.json())
            .then(madde => {
              if (!madde.id) {
                alert("Madde bulunamadı.");
                return;
              }

              // ⬇️ Listeye dön, varsa oradan seç ve detay getir
              const maddeDiv = Array.from(document.querySelectorAll('.madde-item'))
                .find(div => div.textContent.trim().toLowerCase() === madde.baslik.trim().toLowerCase());

              if (maddeDiv) {
                maddeSec(madde.id, maddeDiv);
                maddeDiv.scrollIntoView({ behavior: "smooth", block: "center" });
              } else {
                // Listede yoksa, başlığı tekrar yüklemeden doğrudan göster
                seciliMaddeId = madde.id;
                detayBaslik.textContent = madde.baslik;
                anlamlarContainer.innerHTML = '';
                maddeButtons.style.display = 'block';

                madde.anlamlar.forEach(anlam => {
                  const card = document.createElement('div');
                  card.className = 'card mb-2 p-2';

                  const metinEl = document.createElement('p');
                  metinEl.textContent = anlam.metin;
                  card.appendChild(metinEl);

                  if (anlam.kunyeler.length > 0) {
                    const künyeEl = document.createElement('ul');
                    anlam.kunyeler.forEach(künye => {
                      const li = document.createElement('li');
                      li.textContent = künye;
                      künyeEl.appendChild(li);
                    });
                    card.appendChild(künyeEl);
                  }

                  const btnGroup = document.createElement('div');
                  btnGroup.className = 'mt-2';

                  const btnDuzenle = document.createElement('button');
                  btnDuzenle.textContent = 'Düzenle';
                  btnDuzenle.className = 'btn btn-sm btn-warning me-2';
                  btnDuzenle.onclick = () => anlamDuzenle(anlam.id);

                  const btnSil = document.createElement('button');
                  btnSil.textContent = 'Sil';
                  btnSil.className = 'btn btn-sm btn-danger';
                  btnSil.onclick = () => anlamSil(anlam.id);

                  btnGroup.appendChild(btnDuzenle);
                  btnGroup.appendChild(btnSil);
                  card.appendChild(btnGroup);

                  anlamlarContainer.appendChild(card);
                });

                updateExportButton();
              }
            })
            .catch(err => {
              console.error("Hata:", err);
              alert("Veri alınamadı.");
            });
        }
      });
    });
};

// Yeni anlam alanı ekle
document.getElementById('btnAnlamEkleModal').onclick = () => {
  const anlamGrup = document.createElement('div');
  anlamGrup.className = 'anlam-grubu mb-3';
  anlamGrup.innerHTML = `
    <label class="form-label">Anlam</label>
    <textarea class="form-control anlam-metin" rows="2" required></textarea>
    <label class="form-label mt-2">Künye (virgülle ayır)</label>
    <input type="text" class="form-control anlam-kunye">
  `;
  document.getElementById('anlamlarContainer').appendChild(anlamGrup);
};

// Madde ve anlamları kaydet
document.getElementById('maddeEkleForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const baslik = document.getElementById('maddeBaslikInput').value.trim();
  const anlamDivler = document.querySelectorAll('.anlam-grubu');
  const anlamlar = [];

  anlamDivler.forEach(div => {
    const metin = div.querySelector('.anlam-metin').value.trim();
    const künyeText = div.querySelector('.anlam-kunye').value.trim();
    const kunyeler = künyeText ? künyeText.split(',').map(s => s.trim()).filter(Boolean) : [];

    if (metin) {
      anlamlar.push({ metin, kunyeler });
    }
  });

  if (!baslik || anlamlar.length === 0) {
    alert("Başlık ve en az bir anlam gerekli.");
    return;
  }

  fetch('/api/madde-ekle-tam', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ baslik, anlamlar })
  })
  .then(res => {
    if (!res.ok) return res.json().then(err => Promise.reject(err));
    return res.json();
  })
  .then(() => {
    document.getElementById('maddeEkleForm').reset();
    document.getElementById('anlamlarContainer').innerHTML = '';
    document.getElementById('maddeEkleModal').classList.remove('show');
    document.querySelector('.modal-backdrop')?.remove();
    document.body.classList.remove('modal-open');
    document.body.style = '';
    maddeBasliklariniGetir();
  })
  .catch(err => alert("Hata: " + (err?.error || JSON.stringify(err))));
});





