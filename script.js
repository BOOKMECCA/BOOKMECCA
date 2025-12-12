const bookGrid = document.getElementById("book-grid");
const tabs = document.querySelectorAll(".tab");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modal-body");
const closeModal = document.querySelector(".close");

let currentCategory = "readers";
let books = [];

// CSV 파일 불러오기
fetch("도서추천목록.csv") // 경로 확인
  .then(res => res.text())
  .then(text => {
    const lines = text.trim().split("\n");
    const headers = lines[0].split(",");
    books = lines.slice(1).map(line => {
      const cols = line.split(",");
      let obj = {};
      headers.forEach((h, i) => obj[h] = cols[i]);
      return obj;
    });
    renderBooks();
  })
  .catch(err => console.error("책 데이터 로드 실패:", err));

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
}

closeModal.onclick = () => modal.style.display = "none";
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

