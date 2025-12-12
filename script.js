const bookGrid = document.getElementById("book-grid");
const tabs = document.querySelectorAll(".tab");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modal-body");

let currentCategory = "리더스";
let books = [];

// CSV 파일 경로
const csvPath = "booklist.csv";

// CSV 파싱
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

// AR 레벨 필터
function populateFilters() {
  const arSelect = document.getElementById("ar-level");
  arSelect.innerHTML = "";

  const options = ["전체", "1점대", "2점대", "3점대", "4점대", "5점대", "6점대 이상"];
  options.forEach(optText => {
    const opt = document.createElement("option");
    opt.value = optText;
    opt.textContent = optText;
    arSelect.appendChild(opt);
  });
}

// 카드 렌더링
function renderBooks() {
  const arFilter = document.getElementById("ar-level").value;
  bookGrid.innerHTML = "";

  const filteredBooks = books.filter(b => {
    const categoryMatch = (b.category || "").trim() === currentCategory;

    let arMatch = true;
    if (arFilter !== "AR레벨" && b.ar) {
      const ar = parseFloat(b.ar);
      if (isNaN(ar)) return false;

      const major = Math.floor(ar);
      switch(arFilter) {
        case "1점대": arMatch = major === 1; break;
        case "2점대": arMatch = major === 2; break;
        case "3점대": arMatch = major === 3; break;
        case "4점대": arMatch = major === 4; break;
        case "5점대": arMatch = major === 5; break;
        case "6점대 이상": arMatch = major >= 6; break;
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

// 모달
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

// 모달 외부 클릭 시 닫기
window.onclick = e => { if(e.target === modal) modal.style.display = "none"; };

// 탭 클릭
tabs.forEach(tab => {
  tab.onclick = () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentCategory = tab.dataset.category || "리더스";
    renderBooks();
  };
});

// AR 필터 변경 시
document.getElementById("ar-level").onchange = renderBooks;
