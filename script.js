let books = [];
let currentCategory = "리더스";
let filteredBooks = [];
let currentDetailIndex = 0;

// CSV 불러오기
Papa.parse("https://raw.githubusercontent.com/bookmecca/BOOKMECCA/main/booklist.csv", {
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
  filteredBooks = books.filter(book => book["카테고리"] === currentCategory);

  if (arValue !== "all") {
    filteredBooks = filteredBooks.filter(book => {
      let ar = book["AR레벨"];
      let num = parseFloat(ar);
      if (arValue === "6") return num >= 6;
      return Math.floor(num) === Number(arValue);
    });
  }

  const bookList = document.getElementById("bookList");
  bookList.innerHTML = "";

  filteredBooks.forEach((book, index) => {
    const card = document.createElement("div");
    card.className = "book-card";
    card.innerHTML = `
      <img src="${book["메인"]}" alt="${book["도서명"]}">
      <h3>${book["도서명"]}</h3>
      <p>AR 레벨: ${book["AR레벨"]}</p>
      <p>리뷰: ${book["리뷰"]}</p>
      <p>작가명: ${book["작가"]}</p>
      <p>${book["설명"]}</p>
    `;
    card.addEventListener("click", () => openDetail(index));
    bookList.appendChild(card);
  });
}

// 상세보기 모달
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
  if (!book) return;
  document.getElementById("detailTitle").textContent = book["도서명"];
  document.getElementById("detailAR").textContent = book["AR레벨"];
  document.getElementById("detailReview").textContent = book["리뷰"];
  document.getElementById("detailAuthor").textContent = book["작가"];
  document.getElementById("detailPublisher").textContent = book["출판사"];
  document.getElementById("detailISBN").textContent = book["ISBN"];
  document.getElementById("detailDesc").textContent = book["설명"];
  document.getElementById("detailImage").src = book["상세페이지"];
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
