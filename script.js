const bookGrid = document.getElementById("book-grid");
const tabs = document.querySelectorAll(".tab");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modal-body");
const closeModal = document.querySelector(".close");
const arSelect = document.getElementById("ar-level");
const authorSelect = document.getElementById("author");

let currentCategory = "readers";
let books = [];

// CSV 불러오기 (PapaParse 사용)
Papa.parse("booklist.csv", {
  download: true,
  header: true,
  skipEmptyLines: true,
  complete: function(results) {
    books = results.data;

    // 필터 옵션 자동 추가
    const arSet = new Set();
    const authorSet = new Set();
    books.forEach(b => {
      if(b.ar) arSet.add(b.ar);
      if(b.author) authorSet.add(b.author);
    });

    Array.from(arSet).sort().forEach(ar => {
      const option = document.createElement("option");
      option.value = ar;
      option.textContent = ar;
      arSelect.appendChild(option);
    });

    Array.from(authorSet).sort().forEach(author => {
      const option = document.createElement("option");
      option.value = author;
      option.textContent = author;
      authorSelect.appendChild(option);
    });

    renderBooks();
  },
  error: function(err) {
    console.error("CSV 불러오기 실패:", err);
  }
});

function renderBooks() {
  const arFilter = arSelect.value;
  const authorFilter = authorSelect.value;

  bookGrid.innerHTML = "";

  books
    .filter(book => book.category === currentCategory)
    .filter(book => arFilter === "all" || book.ar == arFilter)
    .filter(book => authorFilter === "all" || book.author === authorFilter)
    .forEach(book => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${book.thumb || ''}" alt="${book.title}">
        <h3>${book.title}</h3>
        <p>AR 레벨: ${book.ar}</p>
        <p>리뷰: ${book.review}</p>
        <p>작가: ${book.author}</p>
        <p>${book.desc}</p>
      `;
      card.onclick = () => showModal(book);
      bookGrid.appendChild(card);
    });
}

function showModal(book) {
  modalBody.innerHTML = `
    <div class="close">X</div>
    <h2>${book.title}</h2>
    <p>AR 레벨: ${book.ar}</p>
    <p>리뷰: ${book.review}</p>
    <p>작가: ${book.author}</p>
    <p>출판사: ${book.publisher}</p>
    <p>ISBN: ${book.isbn}</p>
    <p>${book.desc}</p>
    <img src="${book.img || ''}" alt="${book.title}">
  `;
  modal.style.display = "flex";

  // 모달 닫기 이벤트 재바인딩
  modalBody.querySelector(".close").onclick = () => modal.style.display = "none";
}

window.onclick = e => { if(e.target === modal) modal.style.display = "none"; };

// 탭 클릭
tabs.forEach(tab => {
  tab.onclick = () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentCategory = tab.dataset.category;
    renderBooks();
  };
});

// 필터 변경
arSelect.onchange = renderBooks;
authorSelect.onchange = renderBooks;

