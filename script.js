let books = [];
let filteredBooks = [];
let currentCategory = "리더스";
let currentDetailIndex = 0;
let isSearchMode = false;

const bookList = document.getElementById("bookList");
const arFilter = document.getElementById("arFilter");
const tabs = document.querySelectorAll("#tabs .tab");
const modal = document.getElementById("detailModal");
const closeBtn = modal.querySelector(".close");

const detailTitle = document.getElementById("detailTitle");
const detailAR = document.getElementById("detailAR");
const detailPublisher = document.getElementById("detailPublisher");
const detailISBN = document.getElementById("detailISBN");
const detailDesc = document.getElementById("detailDesc");
const detailImage = document.getElementById("detailImage");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const logo = document.getElementById("logo");
const homeBtn = document.getElementById("homeBtn");

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
    currentCategory = tab.dataset.category;
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    isSearchMode = false;
    document.getElementById("tabs").style.display = "flex";
    renderBooks();
  });
});

// AR 필터 변경
arFilter.addEventListener("change", renderBooks);

// 검색 버튼 클릭
searchBtn.addEventListener("click", () => {
  if (!searchInput.value.trim()) return;
  isSearchMode = true;
  document.getElementById("tabs").style.display = "none";
  renderBooks();
});

// 엔터 키 검색
searchInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") searchBtn.click();
});

// 로고 / 홈 클릭 → 홈 복귀
function goHome() {
  isSearchMode = false;
  searchInput.value = "";
  document.getElementById("tabs").style.display = "flex";
  renderBooks();
}
logo.addEventListener("click", goHome);
homeBtn.addEventListener("click", goHome);

function renderBooks() {
  filteredBooks = [];

  if (isSearchMode) {
    const searchTerm = searchInput.value.toLowerCase();
    filteredBooks = books.filter(book => {
      return ["도서명","작가","ISBN","설명"].some(key => book[key] && book[key].toLowerCase().includes(searchTerm));
    });
  } else {
    filteredBooks = books.filter(book => book["카테고리"] === currentCategory);

    const arValue = arFilter.value;
    if (arValue !== "all") {
      filteredBooks = filteredBooks.filter(book => {
        const arStr = book["AR레벨"];
        if (!arStr) return false;

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
        return !(maxAR < filterMin || minAR > filterMax);
      });
    }
  }

  bookList.innerHTML = "";

  filteredBooks.forEach((book, idx) => {
    if (!book["도서명"]) return;

    let cardHTML = `<img src="${book["메인"]}" alt="${book["도서명"]}" />
                    <h3>${book["도서명"]}</h3>`;
    if (book["AR레벨"]) cardHTML += `<p>AR 레벨: ${book["AR레벨"]}</p>`;
    if (book["설명"]) cardHTML += `<p>${book["설명"].replace(/\n/g, "<br>")}</p>`;

    const card = document.createElement("div");
    card.className = "book-card";
    card.innerHTML = cardHTML;
    card.addEventListener("click", () => openDetail(idx));
    bookList.appendChild(card);
  });
}

// 모달 열기
function openDetail(idx) {
  currentDetailIndex = idx;
  showDetail();
  modal.style.display = "flex";
}

// 모달 내용
function showDetail() {
  const book = filteredBooks[currentDetailIndex];
  if (!book) return;

  detailTitle.textContent = book["도서명"];

  if (book["AR레벨"]) {
    detailAR.textContent = book["AR레벨"];
    detailAR.parentElement.style.display = "block";
  } else detailAR.parentElement.style.display = "none";

  if (book["출판사"]) {
    detailPublisher.textContent = book["출판사"];
    detailPublisher.parentElement.style.display = "block";
  } else detailPublisher.parentElement.style.display = "none";

  if (book["ISBN"]) {
    detailISBN.textContent = book["ISBN"];
    detailISBN.parentElement.style.display = "block";
  } else detailISBN.parentElement.style.display = "none";

  if (book["설명"]) {
    detailDesc.innerHTML = book["설명"].replace(/\n/g, "<br>");
    detailDesc.style.display = "block";
  } else detailDesc.style.display = "none";

  detailImage.src = book["상세페이지"] || "";
}

// 모달 닫기
closeBtn.addEventListener("click", () => { modal.style.display = "none"; });
prevBtn.addEventListener("click", () => {
  currentDetailIndex = (currentDetailIndex - 1 + filteredBooks.length) % filteredBooks.length;
  showDetail();
});
nextBtn.addEventListener("click", () => {
  currentDetailIndex = (currentDetailIndex + 1) % filteredBooks.length;
  showDetail();
});
window.addEventListener("click", (e) => { if (e.target === modal) modal.style.display = "none"; });
