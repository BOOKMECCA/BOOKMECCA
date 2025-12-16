let books = [];
let filteredBooks = [];
let currentCategory = "리더스";
let currentDetailIndex = 0;
let searchMode = false;

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
const barcodeBtn = document.getElementById("barcodeBtn");
const barcodeScanner = document.getElementById("barcodeScanner");
const scannerContainer = document.getElementById("scannerContainer");
const barcodeClose = document.getElementById("barcodeClose");

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

// 탭 클릭
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentCategory = tab.dataset.category;
    searchInput.value = "";
    searchMode = false;
    renderBooks();
  });
});

// AR 필터
arFilter.addEventListener("change", () => renderBooks(searchMode));

// 검색
function doSearch() {
  searchMode = true;
  renderBooks(searchMode);
}
searchBtn.addEventListener("click", doSearch);
searchInput.addEventListener("keydown", e => {
  if(e.key === "Enter"){ e.preventDefault(); doSearch(); }
});

// renderBooks
function renderBooks(isSearch=false){
  let arValue = arFilter.value;
  let term = searchInput.value.trim().toLowerCase();

  if(isSearch && term!==""){
    filteredBooks = books.filter(book=>{
      return Object.keys(book).some(key=>{
        const val = book[key];
        return val && val.toString().toLowerCase().includes(term);
      });
    });
  } else {
    filteredBooks = books.filter(book=>book["카테고리"]===currentCategory);
    if(arValue!=="all"){
      filteredBooks = filteredBooks.filter(book=>{
        const arStr = book["AR레벨"];
        if(!arStr) return false;
        let minAR,maxAR;
        if(arStr.includes("~")){
          [minAR,maxAR]=arStr.split("~").map(p=>parseFloat(p));
        } else minAR=maxAR=parseFloat(arStr);
        const filterMin=parseInt(arValue,10);
        const filterMax=arValue==="6"?Infinity:filterMin+0.9;
        return !(maxAR<filterMin||minAR>filterMax);
      });
    }
  }

  bookList.innerHTML="";
  filteredBooks.forEach((book,idx)=>{
    if(!book["도서명"]) return;
    let html=`<img src="${book["메인"]}" alt="${book["도서명"]}" /><h3>${book["도서명"]}</h3>`;
    if(book["AR레벨"]) html+=`<p>AR 레벨: ${book["AR레벨"]}</p>`;
    if(book["출판사"]) html+=`<p>출판사: ${book["출판사"]}</p>`;
    if(book["ISBN"]) html+=`<p>ISBN: ${book["ISBN"]}</p>`;
    if(book["설명"]) html+=`<p>${book["설명"].replace(/\n/g,"<br>")}</p>`;
    const card=document.createElement("div");
    card.className="book-card";
    card.innerHTML=html;
    card.addEventListener("click",()=>openDetail(idx));
    bookList.appendChild(card);
  });

  // 검색 모드일 때 탭 숨기기
  document.getElementById("tabs").style.display = (searchMode && term!=="") ? "none" : "flex";
}

// 모달
function openDetail(idx){ currentDetailIndex=idx; showDetail(); modal.style.display="flex"; }
function showDetail(){
  const book = filteredBooks[currentDetailIndex];
  if(!book) return;
  detailTitle.textContent=book["도서명"];
  detailAR.parentElement.style.display=book["AR레벨"]?"block":"none";
  detailAR.textContent=book["AR레벨"]||"";
  detailPublisher.parentElement.style.display=book["출판사"]?"block":"none";
  detailPublisher.textContent=book["출판사"]||"";
  detailISBN.parentElement.style.display=book["ISBN"]?"block":"none";
  detailISBN.textContent=book["ISBN"]||"";
  detailDesc.style.display=book["설명"]?"block":"none";
  detailDesc.innerHTML=book["설명"]?book["설명"].replace(/\n/g,"<br>"):"";
  detailImage.src=book["상세페이지"]||"";
}
closeBtn.addEventListener("click",()=>modal.style.display="none");
prevBtn.addEventListener("click",()=>{currentDetailIndex=(currentDetailIndex-1+filteredBooks.length)%filteredBooks.length;showDetail();});
nextBtn.addEventListener("click",()=>{currentDetailIndex=(currentDetailIndex+1)%filteredBooks.length;showDetail();});
window.addEventListener("click",e=>{if(e.target===modal) modal.style.display="none";});

// 바코드 스캔
barcodeBtn.addEventListener("click",()=>{
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
    alert("PC에서는 카메라 사용 불가. 모바일에서 시도하세요."); return;
  }
  barcodeScanner.style.display="flex";
  const html5QrCode=new Html5Qrcode("scannerContainer");
  Html5Qrcode.getCameras().then(cameras=>{
    if(cameras && cameras.length){
      html5QrCode.start({facingMode:"environment"},{fps:10,qrbox:250},
        decodedText=>{
          const idx = books.findIndex(b=>b["ISBN"]===decodedText);
          if(idx!==-1){ searchMode=false; openDetail(idx); }
          html5QrCode.stop().then(()=>{ barcodeScanner.style.display="none"; });
        },
        errorMsg=>{}
      );
    } else alert("카메라를 찾을 수 없습니다.");
  }).catch(err=>{console.error(err); alert("카메라 접근 실패:"+err); });
});
barcodeClose.addEventListener("click",()=>{barcodeScanner.style.display="none";});
