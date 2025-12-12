// 1️⃣ 구글 시트 ID
const sheetId = "18fgqBSXFcZgN7udsSnPw6DjIxdsy7D24w72w13czpdQ"; // 확인한 구글 시트 ID 넣기
const sheetUrl = `https://docs.google.com/spreadsheets/d/18fgqBSXFcZgN7udsSnPw6DjIxdsy7D24w72w13czpdQ/gviz/tq?tqx=out:json`;

const bookGrid = document.getElementById("book-grid");
const tabs = document.querySelectorAll(".tab");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modal-body");
const closeModal = document.querySelector(".close");

let currentCategory = "readers";
let books = []; // 시트에서 받아올 데이터

// 2️⃣ 구글 시트에서 데이터 불러오기
fetch(sheetUrl)
  .then(res => res.text())
  .then(dataText => {
    const jsonStr = dataText.match(/.*?({.*}).*/s)[1];
    const data = JSON.parse(jsonStr);

    books = data.table.rows.map(row => ({
      title: row.c[0]?.v || "",
      category: row.c[1]?.v || "",
      ar: row.c[2]?.v || "",
      author: row.c[3]?.v || "",
      review: row.c[4]?.v || "",
      publisher: row.c[5]?.v || "",
      isbn: row.c[6]?.v || "",
      desc: row.c[7]?.v || "",
      thumb: row.c[8]?.v || "", // 썸네일
      img: row.c[9]?.v || ""    // 상세 이미지
    }));

    renderBooks(); // 시트 데이터 불러온 후 초기 렌더링
  })
  .catch(err => console.error("구글 시트 불러오기 실패:", err));

// 3️⃣ 책 카드 렌더링
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

// 4️⃣ 모달 띄우기
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

// 5️⃣ 모달 닫기
closeModal.onclick = () => modal.style.display = "none";
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
document.getElementById("ar-level").onchange = renderBooks;
document.getElementById("author").onchange = renderBooks;
