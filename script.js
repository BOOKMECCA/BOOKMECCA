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

/* CSV */
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

/* 홈 복귀 (PC / 모바일 동일) */
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

/* 렌더 */
function renderBooks() {
  if (isSearchMode) {
    const term = searchInput.value.toLowerCase();

    filteredBooks = books.filter(book =>
      ["도서명", "작가", "출판사", "ISBN", "설명"]
        .some(k => book[k] && book[k].toLowerCase().includes(term))
    );
  } else {
    filteredBooks = books.filter(b => b["카테고리"] === currentCategory);
  }

  bookList.innerHTML = "";

  filteredBooks.forEach((book, i) => {
    const card = document.createElement("div");
    card.className = "book-card";
    card.innerHTML = `
      <img src="${book["메인"]}">
      <h3>${book["도서명"]}</h3>
      <p>${book["설명"] || ""}</p>
    `;
    card.onclick = () => openDetail(i);
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
