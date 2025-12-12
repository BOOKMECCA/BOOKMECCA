let books = [];
let currentCategory = "리더스";
let filteredBooks = [];
let currentDetailIndex = 0;

// CSV 불러오기
Papa.parse("books.csv", {
  download: true,
  header: true,
  complete: function(results) {
    books = results.data;
    renderBooks();
  }
});

// 탭 클릭
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", (e) => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    e.target.classList.add("active");
    currentCategory = e.target.dataset.category;
    renderBooks();
  });
});

// AR 레벨 필터
document.getElementById("arFilter").addEventListener("change", renderBooks);

function renderBooks() {
  const arValue = document.getElementById("arFilter").value;
  filteredBooks = books.filter(book => book.category === currentCategory);

  if (arValue !== "all") {
    if (arValue === "6") {
      filteredBooks = filteredBooks.filter(book => Number(book.ar_level) >= 6);
    } else {
      filteredBooks = filteredBooks.filter(book => Math.floor(Number(book.ar_level)) === Number(arValue));
    }
  }

  const bookList = document.getElementById("bookList");
  bookList.innerHTML = "";
  filteredBooks.forEach((book, index) => {
    const card = document.createElement("div");
    card.className = "book-card";
    card.innerHTML = `
      <img src="${book.thumbnail}" alt="${book.title}">
      <h3>${book.title}</h3>
      <p>AR 레벨: ${book.ar_level}</p>
      <p>아마존 리뷰: ${book.amazon_review}</p>
      <p>작가명: ${book.author}</p>
      <p>${book.description}</p>
    `;
    card.addEventListener("click", () => openDetail(index));
    bookList.appendChild(card);
  });
}

// 상세보기
const modal = document.getElementById("detailModal");
const closeBtn = document.querySelector(".close");
closeBtn.onclick = () => modal.style.display = "none";

function openDetail(index) {
  currentDetailIndex = index;
  showDetail();
  modal.style.display = "flex";
}

function showDetail() {
  const book = filteredBooks[currentDetailIndex];
  document.getElementById("detailTitle").textContent = book.title;
  document.getElementById("detailAR").textContent = book.ar_level;
  document.getElementById("detailReview").textContent = book.amazon_review;
  document.getElementById("detailAuthor").textContent = book.author;
  document.getElementById("detailPublisher").textContent = book.publisher;
  document.getElementById("detailISBN").textContent = book.isbn;
  document.getElementById("detailDesc").textContent = book.description;
  document.getElementById("detailImage").src = book.detail_image;
}

// 좌우 버튼
document.getElementById("prevBtn").addEventListener("click", () => {
  currentDetailIndex = (currentDetailIndex - 1 + filteredBooks.length) % filteredBooks.length;
  showDetail();
});
document.getElementById("nextBtn").addEventListener("click", () => {
  currentDetailIndex = (currentDetailIndex + 1) % filteredBooks.length;
  showDetail();
});

// 모달 외부 클릭 시 닫기
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}
