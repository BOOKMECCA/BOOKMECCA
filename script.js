const books = [
  {title: "책1", category: "readers", ar: 1, author: "a", review: "⭐️⭐️⭐️", publisher: "출판사A", isbn: "123", desc: "간단소개", img: "https://via.placeholder.com/150"},
  {title: "책2", category: "chapterbooks", ar: 2, author: "b", review: "⭐️⭐️", publisher: "출판사B", isbn: "456", desc: "간단소개", img: "https://via.placeholder.com/150"},
  // 필요하면 20~30개 더 추가
];

const bookGrid = document.getElementById("book-grid");
const tabs = document.querySelectorAll(".tab");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modal-body");
const closeModal = document.querySelector(".close");

let currentCategory = "readers";

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
        <img src="${book.img}" alt="${book.title}">
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

tabs.forEach(tab => {
  tab.onclick = () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentCategory = tab.dataset.category;
    renderBooks();
  }
});

document.getElementById("ar-level").onchange = renderBooks;
document.getElementById("author").onchange = renderBooks;

// 초기 렌더링
renderBooks();
