const bookGrid = document.getElementById("book-grid");
const tabs = document.querySelectorAll(".tab");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modal-body");
const closeModal = document.querySelector(".close");

let currentCategory = "readers";
let books = [];

// CSV 불러오기
Papa.parse("booklist.csv", {
  download: true,
  header: true,
  skipEmptyLines: true,
  complete: function(results) {
    books = results.data;
    populateFilters();
    renderBooks();
  },
  error: function(err){
    console.error("CSV 로딩 실패:", err);
  }
});

// 필터 옵션 채우기
function populateFilters() {
  const arSelect = document.getElementById("ar-level");
  const authorSelect = document.getElementById("author");

  const arSet = new Set();
  const authorSet = new Set();

  books.forEach(book => {
    if(book.ar) arSet.add(book.ar);
    if(book.author) authorSet.add(book.author);
  });

  Array.from(arSet).sort().forEach(ar => {
    const opt = document.createElement("option");
    opt.value = ar;
    opt.textContent = ar;
    arSelect.appendChild(opt);
  });

  Array.from(authorSet).sort().forEach(author => {
    const opt = document.createElement("option");
    opt.value = author;
    opt.textContent = author;
    authorSelect.appendChild(opt);
  });
}

// 책 카드 렌더링
function renderBooks() {
  const arFilter = document.getElementById("ar-level").value;
  const authorFilter = document.getElementById("author").value;

  bookGrid.innerHTML = "";

  books
    .filter(book => book.category === currentCategory)
    .filter(book => arFilter === "all" || book.ar == arFilter)
    .filter(book => authorFilter === "all" || book.author === authorFilter)
    .forEach(book => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${book.thumb}" alt="${book.title}">
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

// 모달 띄우기
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
    <img src="${book.img}" alt="${book.title}">
  `;
  modal.style.display = "flex";

  // 모달 닫기
  document.querySelector("#modal .close").onclick = () => modal.style.display = "none";
}

window.onclick = e => { if(e.target === modal) modal.style.display = "none"; };

// 탭 클릭
tabs.forEach(tab => {
  tab.onclick = () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentCategory = tab.dataset.category;
    renderBooks();
  }
});

// 필터 변경
document.getElementById("ar-level").onchange = renderBooks;
document.getElementById("author").onchange = renderBooks;
