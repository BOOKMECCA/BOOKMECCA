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

// AR 레벨 필터만 채우기 (점대 단위)
function populateFilters() {
  const arSelect = document.getElementById("ar-level");
  const arSet = new Set();

  books.forEach(b => {
    if (b.ar) {
      const major = Math.floor(parseFloat(b.ar));
      if (!isNaN(major)) arSet.add(major);
    }
  });

  Array.from(arSet).sort((a,b)=>a-b).forEach(major => {
    const opt = document.createElement("option");
    opt.value = major;
    opt.textContent = `${major}점대`;
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
    if (arFilter !== "all" && b.ar) {
      const major = Math.floor(parseFloat(b.ar));
      arMatch = major == arFilter;
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
