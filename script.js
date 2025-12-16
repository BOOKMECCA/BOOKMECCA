let books = [];
let filteredBooks = [];
let currentCategory = "리더스";
let currentDetailIndex = 0;
let isSearchMode = false;

const bookList = document.getElementById("bookList");
const tabs = document.querySelectorAll(".tab");
const tabsContainer = document.getElementById("tabs");

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const logo = document.getElementById("logo");
const homeBtn = document.getElementById("homeBtn");

const modal = document.getElementById("detailModal");
const closeBtn = modal.querySelector(".close");

const detailTitle = document.getElementById("detailTitle");
const detailAR = document.getElementById("detailAR");
const detailPublisher = document.getElementById("detailPublisher");
const detailISBN = document.getElementById("detailISBN");
const detailDesc = document.getElementById("detailDesc");
const detailImage = document.getElementById("detailImage");

/* CSV 로딩 – 절대 수정 안 함 */
Papa.parse("https://raw.githubusercontent.com/bookmecca/BOOKMECCA/main/booklist.csv", {
  download: true,
  header: true,
  skipEmptyLines: true,
  complete: r => {
    books = r.data;
    renderBooks();
  }
});

/* 탭 */
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentCategory = tab.dataset.category;
    isSearchMode = false;
    tabsContainer.style.display = "flex";
    renderBooks();
  });
});

/* 검색 */
searchBtn.addEventListener("click", doSearch);
searchInput.addEventListener("keydown", e => {
  if (e.key === "Enter") doSearch();
});

function doSearch() {
  if (!searchInput.value.trim()) return;
  isSearchMode = true;
  tabsContainer.style.display = "none";
  renderBooks();
}

/* 홈 */
function goHome() {
  isSearchMode = false;
  searchInput.value = "";
  tabsContainer.style.display = "flex";

  tabs.forEach(t => t.classList.remove("active"));
  tabs[0].classList.add("active");
  currentCategory = tabs[0].dataset.category;

  renderBooks();
}

logo.addEventListener("click", goHome);
homeBtn.addEventListener("click", goHome);

/* 🔥 핵심 수정된 렌더 함수 */
function renderBooks() {

  const searchTerm = searchInput.value.trim().toLowerCase();

  if (isSearchMode && searchTerm !== "") {

    const SEARCH_KEYS = ["도서명", "작가", "출판사", "ISBN", "설명"];

    filteredBooks = books.filter(book =>
      SEARCH_KEYS.some(key =>
        book[key] &&
        book[key].toString().toLowerCase().includes(searchTerm)
      )
    );

  } else {
    filteredBooks = books.filter(
      book => book["카테고리"] === currentCategory
    );
  }

  bookList.innerHTML = "";

  filteredBooks.forEach((book, idx) => {
    if (!book["도서명"]) return;

    const card = document.createElement("div");
    card.className = "book-card";
    card.innerHTML = `
      <img src="${book["메인"]}">
      <h3>${book["도서명"]}</h3>
      <p>${book["설명"] || ""}</p>
    `;
    card.onclick = () => openDetail(idx);
    bookList.appendChild(card);
  });
}

/* 모달 */
function openDetail(i) {
  const b = filteredBooks[i];
  detailTitle.textContent = b["도서명"];
  detailAR.textContent = b["AR레벨"] || "";
  detailPublisher.textContent = b["출판사"] || "";
  detailISBN.textContent = b["ISBN"] || "";
  detailDesc.innerHTML = (b["설명"] || "").replace(/\n/g, "<br>");
  detailImage.src = b["상세페이지"] || "";
  modal.style.display = "flex";
}

closeBtn.onclick = () => modal.style.display = "none";
window.onclick = e => { if (e.target === modal) modal.style.display = "none"; };
