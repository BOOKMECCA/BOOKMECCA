const bookGrid = document.getElementById("book-grid");
const tabs = document.querySelectorAll(".tab");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modal-body");
const closeBtnGlobal = document.querySelector(".close");

let currentCategory = "readers";
let books = [];

// 📌 CSV 파일 경로
const csvPath = "booklist.csv"; // 네 파일명 그대로

// 1) PapaParse로 CSV 읽기
Papa.parse(csvPath, {
  download: true,   // 반드시 필요
  header: true,     // 첫 줄을 헤더로 인식
  skipEmptyLines: true,
  complete: function(results) {
    console.log("CSV 파싱 완료:", results.data);
    books = results.data;

    // 필터 select 채우기
    populateFilters();

    // 초기 렌더
    renderBooks();
  },
  error: function(err) {
    console.error("CSV 로딩 오류:", err);
  }
});

function populateFilters() {
  const arSelect = document.getElementById("ar-level");
  const authorSelect = document.getElementById("author");
  const arSet = new Set();
  const authSet = new Set();

  books.forEach(b => {
    if (b.ar) arSet.add(b.ar);
    if (b.author) authSet.add(b.author);
  });

  Array.from(arSet).sort().forEach(ar => {
    const opt = document.createElement("option");
    opt.value = ar;
    opt.textContent = ar;
    arSelect.appendChild(opt);
  });

  Array.from(authSet).sort().forEach(a => {
    const opt = document.createElement("option");
    opt.value = a;
    opt.textContent = a;
    authorSelect.appendChild(opt);
  });
}

function renderBooks() {
  const arFilter = document.getElementById("ar-level").value;
  const authorFilter = document.getElementById("author").value;
  bookGrid.innerHTML = "";

  const list = books
    .filter(b => b.category === currentCategory)
    .filter(b => arFilter === "all" || b.ar == arFilter)
    .filter(b => authorFilter === "all" || b.author === authorFilter);

  if (list.length === 0) {
    bookGrid.innerHTML = `<p style="width:100%;text-align:center;">등록된 책이 없습니다.</p>`;
    return;
  }

  list.forEach(book => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${book.thumb || ""}" alt="${book.title}">
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
    <img src="${book.img || ""}" alt="">
  `;
  modal.style.display = "flex";

  modalBody.querySelector(".close").onclick = () => modal.style.display = "none";
}

window.onclick = e => {
  if (e.target === modal) modal.style.display = "none";
}

tabs.forEach(tab => {
  tab.onclick = () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentCategory = tab.dataset.category;
    renderBooks();
  };
});

document.getElementById("ar-level").onchange = renderBooks;
document.getElementById("author").onchange = renderBooks;
