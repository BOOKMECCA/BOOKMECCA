let books = [];
let filteredBooks = [];
let currentCategory = "리더스";
let currentDetailIndex = 0;

const bookList = document.getElementById("bookList");
const arFilter = document.getElementById("arFilter");
const tabs = document.querySelectorAll("#tabs .tab");
const modal = document.getElementById("detailModal");
const closeBtn = modal.querySelector(".close");

const detailTitle = document.getElementById("detailTitle");
const detailAR = document.getElementById("detailAR");
const detailReview = document.getElementById("detailReview");
const detailAuthor = document.getElementById("detailAuthor");
const detailPublisher = document.getElementById("detailPublisher");
const detailISBN = document.getElementById("detailISBN");
const detailDesc = document.getElementById("detailDesc");
const detailImage = document.getElementById("detailImage");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

// CSV 불러오기
Papa.parse("https://raw.githubusercontent.com/bookmecca/BOOKMECCA/main/booklist.csv", {
  download: true,
  header: true,
  skipEmptyLines: true,
  complete: function(results) {
    books = results.data;
    renderBooks();
  }
});

// 탭 클릭 이벤트
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentCategory = tab.dataset.category;
    renderBooks();
  });
});

// AR 필터 변경 이벤트
arFilter.addEventListener("change", () => {
  renderBooks();
});

function renderBooks() {
  const arValue = arFilter.value;
  filteredBooks = books.filter(book => book["카테고리"] === currentCategory);

  if (arValue !== "all") {
    filteredBooks = filteredBooks.filter(book => {
      const arStr = book["AR레벨"];
      if (!arStr) return false;

      // AR 값이 범위인지 체크
      let minAR, maxAR;
      if (arStr.includes("~")) {
        const parts = arStr.split("~").map(p => parseFloat(p));
        minAR = parts[0];
        maxAR = parts[1];
      } else {
        minAR = maxAR = parseFloat(arStr);
      }

      const filterMin = parseInt(arValue, 10);
      const filterMax = arValue === "6" ? Infinity : filterMin + 0.9;

      // 범위 겹침 체크
      return !(maxAR < filterMin || minAR > filterMax);
    });
  }

  bookList.innerHTML = "";

  filteredBooks.forEach((book, idx) => {
    if (!book["도서명"]) return;

    const card = document.createElement("div");
    card.className = "book-card";
    card.innerHTML = `
      <img src="${book["메인"]}" alt="${book["도서명"]}" />
      <h3>${book["도서명"]}</h3>
      <p>AR 레벨: ${book["AR레벨"]}</p>
      <p>리뷰: ${book["리뷰"]}</p>
      <p>작가명: ${book["작가"]}</p>
      <p>${book["설명"] ? book["설명"].replace(/\n/g, "<br>") : ""}</p>
    `;

    card.addEventListener("click", () => openDetail(idx));
    bookList.appendChild(card);
  });
}

function openDetail(idx) {
  currentDetailIndex = idx;
  showDetail();
  modal.style.display = "flex";
}

function showDetail() {
  const book = filteredBooks[currentDetailIndex];
  if (!book) return;

  detailTitle.textContent = book["도서명"];
  detailAR.textContent = book["AR레벨"];
  detailReview.textContent = book["리뷰"];
  detailAuthor.textContent = book["작가"];
  detailPublisher.textContent = book["출판사"];
  detailISBN.textContent = book["ISBN"];
  detailDesc.innerHTML = book["설명"] ? book["설명"].replace(/\n/g, "<br>") : "";
  detailImage.src = book["상세페이지"];
}

closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

prevBtn.addEventListener("click", () => {
  currentDetailIndex = (currentDetailIndex - 1 + filteredBooks.length) % filteredBooks.length;
  showDetail();
});

nextBtn.addEventListener("click", () => {
  currentDetailIndex = (currentDetailIndex + 1) % filteredBooks.length;
  showDetail();
});

window.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
});
