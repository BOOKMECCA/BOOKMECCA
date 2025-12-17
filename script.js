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
const detailAuthor = document.getElementById("detailAuthor");
const detailPublisher = document.getElementById("detailPublisher");
const detailISBN = document.getElementById("detailISBN");
const detailAR = document.getElementById("detailAR");
const detailDesc = document.getElementById("detailDesc");
const detailImage = document.getElementById("detailImage");

const arrowPrev = document.getElementById("arrowPrev");
const arrowNext = document.getElementById("arrowNext");

Papa.parse("https://raw.githubusercontent.com/bookmecca/BOOKMECCA/main/booklist.csv", {
  download: true,
  header: true,
  skipEmptyLines: true,
  complete: function(results) {
    books = results.data;
    renderBooks();
  }
});

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentCategory = tab.dataset.category;
    renderBooks();
  });
});

arFilter.addEventListener("change", renderBooks);

function renderBooks() {
  const arValue = arFilter.value;
  filteredBooks = books.filter(book => book["카테고리"] === currentCategory);

  if (arValue !== "all") {
    filteredBooks = filteredBooks.filter(book => {
      const arStr = book["AR레벨"];
      if (!arStr) return false;

      let minAR, maxAR;
      if (arStr.includes("~")) {
        [minAR, maxAR] = arStr.split("~").map(Number);
      } else {
        minAR = maxAR = Number(arStr);
      }

      const filterMin = Number(arValue);
      const filterMax = arValue === "6" ? Infinity : filterMin + 0.9;
      return !(maxAR < filterMin || minAR > filterMax);
    });
  }

  bookList.innerHTML = "";

  filteredBooks.forEach((book, idx) => {
    if (!book["도서명"]) return;

    let html = `<img src="${book["메인"]}" alt="${book["도서명"]}">
                <h3>${book["도서명"]}</h3>`;

    if (book["AR레벨"]) html += `<p>AR 레벨: ${book["AR레벨"]}</p>`;
    if (book["설명"]) html += `<p>${book["설명"].replace(/\n/g,"<br>")}</p>`;

    const card = document.createElement("div");
    card.className = "book-card";
    card.innerHTML = html;
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

  detailTitle.textContent = book["도서명"] || "";
  detailAuthor.textContent = book["작가"] ? `작가: ${book["작가"]}` : "";
  detailPublisher.textContent = book["출판사"] ? `출판사: ${book["출판사"]}` : "";
  detailISBN.textContent = book["ISBN"] ? `ISBN: ${book["ISBN"]}` : "";
  detailAR.textContent = book["AR레벨"] || "";
  detailDesc.innerHTML = book["설명"] ? book["설명"].replace(/\n/g,"<br>") : "";
  detailImage.src = book["상세페이지"] || "";

  arrowPrev.classList.toggle("hidden", currentDetailIndex === 0);
  arrowNext.classList.toggle("hidden", currentDetailIndex === filteredBooks.length - 1);
}

closeBtn.addEventListener("click", () => modal.style.display = "none");

arrowPrev.addEventListener("click", () => {
  if (currentDetailIndex > 0) { currentDetailIndex--; showDetail(); }
});
arrowNext.addEventListener("click", () => {
  if (currentDetailIndex < filteredBooks.length - 1) { currentDetailIndex++; showDetail(); }
});

window.addEventListener("click", e => {
  if (e.target === modal) modal.style.display = "none";
});
