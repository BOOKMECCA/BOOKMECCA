const bookGrid = document.getElementById("book-grid");
const tabs = document.querySelectorAll(".tab");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modal-body");

let currentCategory = "리더스";
let books = [];

// CSV 파일 경로
const csvPath = "booklist.csv";

// AR 점대 옵션
const arRanges = ["전체", "1점대", "2점대", "3점대", "4점대", "5점대", "6점대 이상"];

Papa.parse(csvPath, {
  download: true,
  header: true,
  skipEmptyLines: true,
  complete: function(results) {
    books = results.data.filter(b => Object.values(b).some(v => v && v.trim() !== ""));
    populateFilters();
    renderBooks();
  },
  error: function(err) {
    console.error("CSV 로딩 오류:", err);
  }
});

function populateFilters() {
  const arSelect = document.getElementById("ar-level");
  arSelect.innerHTML = "";

  arRanges.forEach(range => {
    const opt = document.createElement("option");
    opt.value = range;
    opt.textContent = range;
    arSelect.appendChild(opt);
  });
}

function renderBooks() {
  const arFilter = document.getElementById("ar-level").value;
  bookGrid.innerHTML = "";

  const filteredBooks = books.filter(b => {
    const bookCat = (b.category || "").trim();
    const categoryMatch = bookCat === currentCategory;

    let arMatch = true;
    if (arFilter !== "전체" && b.ar) {
      const arNum = parseFloat(b.ar);
      switch (arFilter) {
        case "1점대": arMatch = arNum >= 1 && arNum < 2; break;
        case "2점대": arMatch = arNum >= 2 && arNum < 3; break;
        case "3점대": arMatch = arNum >= 3 && arNum < 4; break;
        case "4점대": arMatch = arNum >= 4 && arNum < 5; break;
        case "5점대": arMatch = arNum >= 5 && arNum < 6; break;
        case "6점대 이상": arMatch = arNum >= 6; break;
        default: arMatch = true;
      }
    }

    return categoryMatch && arMatch;
  });

  if (filteredBooks.length === 0) {
    bookGrid.innerHTML = `<p style="width:100%; text-align:center;">등록된 책이 없습니다.</p>`;
    return;
  }

  filteredBooks.forEach(book => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${book.thumb || ''}" alt="${book.title || '도서 이미지'}">
      <h3>${book.title || ''}</h3>
      <p>AR 레벨: ${book.ar || '-'}</p>
      <p>리뷰: ${book.review || '-'}</p>
      <p>작가: ${book.author || '-'}</p>
      <p>${book.desc || ''}</p>
    `;
    card.onclick = () => showModal(book);
    bookGrid.appendChild(card);
  });
}

function showModal(book) {
  modalBody.innerHTML = `
    <div class="close">X</div>
    <h2>${book.title || ''}</h2>
    <p>AR 레벨: ${book.ar || '-'}</p>
    <p>리뷰: ${book.review || '-'}</p>
    <p>작가: ${book.author || '-'}</p>
    <p>출판사: ${book.publisher || '-'}</p>
    <p>ISBN: ${book.isbn || '-'}</p>
    <p>${book.desc || ''}</p>
    <img src="${book.img || ''}" alt="${book.title || '도서 이미지'}" style="max-width:100%; margin-top:10px;">
  `;

  modal.style.display = "flex";

  const closeBtn = modalBody.querySelector(".close");
  if (closeBtn) closeBtn.onclick = () => { modal.style.display = "none"; };
}

window.onclick = e => {
  if (e.target === modal) modal.style.display = "none";
};

tabs.forEach(tab => {
  tab.onclick = () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentCategory = tab.dataset.category || "리더스";
    renderBooks();
  };
});

document.getElementById("ar-level").onchange = renderBooks;
