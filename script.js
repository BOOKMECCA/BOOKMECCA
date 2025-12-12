// 1️⃣ 구글 시트 CSV URL
const sheetCsvUrl = "https://docs.google.com/spreadsheets/d/18fgqBSXFcZgN7udsSnPw6DjIxdsy7D24w72w13czpdQ/export?format=csv";

// 요소 선택
const bookGrid = document.getElementById("book-grid");
const tabs = document.querySelectorAll(".tab");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modal-body");
const arSelect = document.getElementById("ar-level");
const authorSelect = document.getElementById("author");

let currentCategory = "readers";
let books = [];

// 2️⃣ 구글 시트 CSV 불러오기
fetch(sheetCsvUrl)
  .then(res => res.text())
  .then(csvText => {
    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    
    // 컬럼 이름 기준으로 데이터 정리
    books = parsed.data.map(book => ({
      title: book.title || "",
      category: book.category || "",
      ar: book.ar || "",
      author: book.author || "",
      review: book.review || "",
      publisher: book.publisher || "",
      isbn: book.isbn || "",
      desc: book.desc || "",
      thumb: book.thumb || "",
      img: book.img || ""
    }));

    // AR 레벨, 작가 필터 옵션 자동 생성
    const arSet = new Set();
    const authorSet = new Set();
    books.forEach(book => {
      if(book.ar) arSet.add(book.ar);
      if(book.author) authorSet.add(book.author);
    });

    arSet.forEach(ar => {
      const option = document.createElement("option");
      option.value = ar;
      option.textContent = ar;
      arSelect.appendChild(option);
    });

    authorSet.forEach(author => {
      const option = document.createElement("option");
      option.value = author;
      option.textContent = author;
      authorSelect.appendChild(option);
    });

    renderBooks();
  })
  .catch(err => console.error("구글 시트 불러오기 실패:", err));

// 3️⃣ 책 카드 렌더링
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

// 4️⃣ 모달 띄우기
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

// 5️⃣ 모달 배경 클릭 시 닫기
window.onclick = e => { if(e.target === modal) modal.style.display = "none"; };

// 6️⃣ 탭 클릭
tabs.forEach(tab => {
  tab.onclick = () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentCategory = tab.dataset.category;
    renderBooks();
  }
});

// 7️⃣ 필터 변경
arSelect.onchange = renderBooks;
authorSelect.onchange = renderBooks;
