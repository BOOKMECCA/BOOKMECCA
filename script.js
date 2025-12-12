// ==== 구글 시트 JSON API URL ====
const sheetId = "18fgqBSXFcZgN7udsSnPw6DjIxdsy7D24w72w13czpdQ";
const sheetRange = "Sheet1"; // 시트 이름이 Sheet1이면 그대로, 아니면 정확한 시트 이름
const sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetRange}?key=AIzaSyD-XXXXX`; // → 아래 방법으로 키 생성 필요

let books = [];
let currentCategory = "readers";

const bookGrid = document.getElementById("book-grid");
const tabs = document.querySelectorAll(".tab");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modal-body");
const arSelect = document.getElementById("ar-level");
const authorSelect = document.getElementById("author");

// ====== 데이터 불러오기 =====
fetch(sheetUrl)
  .then(res => res.json())
  .then(data => {
    const values = data.values;

    // 첫 줄이 헤더
    const headers = values[0];
    books = values.slice(1).map(row => {
      let obj = {};
      headers.forEach((h, i) => obj[h] = row[i] || "");
      return obj;
    });

    renderBooks();
  })
  .catch(err => console.error("Error fetching sheet:", err));

// ====== 렌더링 함수 =====
function renderBooks() {
  const arFilter = arSelect.value;
  const authorFilter = authorSelect.value;
  bookGrid.innerHTML = "";

  books
    .filter(b => b.category === currentCategory)
    .filter(b => arFilter === "all" || b.ar == arFilter)
    .filter(b => authorFilter === "all" || b.author === authorFilter)
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

// ====== 모달 =====
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
  modalBody.querySelector(".close").onclick = () => modal.style.display = "none";
}

window.onclick = e => { if(e.target === modal) modal.style.display = "none"; };

tabs.forEach(tab => {
  tab.onclick = () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentCategory = tab.dataset.category;
    renderBooks();
  };
});

arSelect.onchange = renderBooks;
authorSelect.onchange = renderBooks;
