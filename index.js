const searchForm = document.getElementById("search")
const searchInput = document.getElementById("search-input")
const LS = localStorage
let content = Array(0)
let module = Array(0)
export const key = "198a7499";






// check if we have something in watclist and pushing this items to module
if(LS.key('data')){
  JSON.parse(LS.data).map(x=>module.push(x))
}

// if clicked on "add to watchlist" adding things to localstorage.data
document.addEventListener("click", e=>{
  if(e.target.dataset.watch){
    
    module.push(e.target.dataset.watch)
    const makeUniq = (arr) => {const uniqSet = new Set(arr);return uniqSet;}
   LS.setItem('data',JSON.stringify(Array.from(makeUniq(module))))
    
  }
})



//1) asking search input about value, and if value more then 3 simbols going to fetch function

if(searchForm){
searchForm.addEventListener("submit",e=>{
  e.preventDefault()

  if(searchInput.value.length > 2){ 
    content = Array(0)
    getSearch(searchInput.value)
  }

})
}



//2) fending fetch with input value to get total result information and to send it to next etap
async function getSearch(input){
  const res = await fetch(`https://www.omdbapi.com/?apikey=${key}&s=${input}`)
  const data = await res.json()
  if(data.Response === "True"){
    getListofId(data.totalResults,input)
  }
  else if (data.Response === "False"){
    if(data.Error === 'Request limit reached!'){
    console.log(data) 
    document.getElementById("movies-cantainer").innerHTML = `<div class="empty">
    <p>It's beta and i have only 1000 reasuts-per day limit...</p>
    <img src="Photos/Oops_.svg">`}
  else{
    document.getElementById("movies-cantainer").innerHTML = `<div class="empty">
    <p>Try something else...</p>
    <img src="Photos/Oops_.svg">`
  }
  }

}
// 3) getting all results in one search and sending all id to next function

function getListofId(numRes,input){
  if(numRes > 50){
    numRes = 50
  }
      let num = Array.from(Array(Math.ceil(numRes/10)).keys()).map(x=> x+1)
      num.forEach(x=> {
        fetch(`https://www.omdbapi.com/?apikey=${key}&s=${input}&page=${x}`)
        .then(res=> res.json())
        .then(data => {
          
data.Search.map(x=> {
  if(x.Poster != "N/A"){
    getSearchArr(x.imdbID)
  }
})
        })
      })

}
// 4) rendering all

async function getSearchArr(id){
  const res = await fetch(`https://www.omdbapi.com/?apikey=${key}&i=${id}`)
  const data = await res.json()
  if(data.Response === "True" & data.Plot !== "N/A" & data.Runtime !== "N/A"){
  if(data.Plot.length > 169){
    content.push(`
    <div class="card">
        <div class="movie">
        <div class="img">
            <img src=${data.Poster} class="poster" onerror="this.onerror=null; this.src='Photos/error.jpg'"/>
        </div>
    
            <div class="content ">
                <div class="flex title-container">
                    <h2 class="title">${data.Title}</h1> 
                    <p><img src="Photos/star.svg">${data.imdbRating}</p>
                </div>

                <div class="flex info">
                    <div class="flex">
                      <p>${data.Runtime}</p> 
                      <p>${data.Genre}</p>
                    </div> 
                    <button data-watch=${id}><img src="Photos/Icon.svg"> Watchlist</button>
                </div>
                
                <div class="plot">
                    <p>${data.Plot.slice(0,169)}<span style="display: none;" id="${id}">${data.Plot.slice(169)}</span> <a onclick="openMore('${id}', '${id.slice(0,5)}')" id="${id.slice(0,5)}">Read more...</a></p>
                </div>
            </div>
        </div>
    </div>`)
 
}

  else{
    content.push(`
    
    <div class="card">
    <div class="movie">
      <div class="img">
        <img src=${data.Poster} class="poster" onerror="this.onerror=null; this.src='Photos/error.jpg'"/>
      </div>
  
        <div class="content ">
            <div class="flex title-container">
                <h2 class="title">${data.Title}</h1> <p><img src="Photos/star.svg">${data.imdbRating}</p>
            </div>
            
            <div class="flex info">
                <div class="flex">
                    <p>${data.Runtime}</p> 
                    <p>${data.Genre}</p> 
                </div>
                <button data-watch=${id}><img src="Photos/Icon.svg"> Watchlist</button>
            </div>

            <div class="plot">
                <p>${data.Plot}</p>
            </div>
        </div>
    </div>
    </div>`)
  }}
document.getElementById("movies-cantainer").innerHTML = content.join('')
start()
}





// pagination

function getPageList(totalPages, page, maxLength){
  function range(start, end){
    return Array.from(Array(end - start + 1), (_, i) => i + start);
  }

  var sideWidth = maxLength < 9 ? 1 : 2;
  var leftWidth = (maxLength - sideWidth * 2 - 3) >> 1;
  var rightWidth = (maxLength - sideWidth * 2 - 3) >> 1;

  if(totalPages <= maxLength){
    return range(1, totalPages);
  }

  if(page <= maxLength - sideWidth - 1 - rightWidth){
    return range(1, maxLength - sideWidth - 1).concat(0, range(totalPages - sideWidth + 1, totalPages));
  }

  if(page >= totalPages - sideWidth - 1 - rightWidth){
    return range(1, sideWidth).concat(0, range(totalPages- sideWidth - 1 - rightWidth - leftWidth, totalPages));
  }

  return range(1, sideWidth).concat(0, range(page - leftWidth, page + rightWidth), 0, range(totalPages - sideWidth + 1, totalPages));
}

export function start(){
  var numberOfItems =  $(".card-content .card").length;
  var limitPerPage = 6; //How many card items visible per a page
  var totalPages = Math.ceil(numberOfItems / limitPerPage);
  var paginationSize = 7; //How many page elements visible in the pagination
  var currentPage;
  function showPage(whichPage){
    if(whichPage < 1 || whichPage > totalPages) return false;
    currentPage = whichPage;

    $(".card-content .card").hide().slice((currentPage - 1) * limitPerPage, currentPage * limitPerPage).show();

    $(".pagination li").slice(1, -1).remove();

    getPageList(totalPages, currentPage, paginationSize).forEach(item => {
      $("<li>").addClass("page-item").addClass(item ? "current-page" : "dots")
      .toggleClass("active", item === currentPage).append($("<a>").addClass("page-link")
      .attr({href: "javascript:void(0)"}).text(item || "...")).insertBefore(".next-page");
    });

    $(".previous-page").toggleClass("disable", currentPage === 1);
    $(".next-page").toggleClass("disable", currentPage === totalPages);
    return true;
  }

  $(".pagination").append(
    $("<li>").addClass("page-item").addClass("previous-page").append($("<a>").addClass("page-link").attr({href: "javascript:void(0)"}).text("Prev")),
    $("<li>").addClass("page-item").addClass("next-page").append($("<a>").addClass("page-link").attr({href: "javascript:void(0)"}).text("Next"))
  );

  $(".card-content").show();
  showPage(1);

  $(document).on("click", ".pagination li.current-page:not(.active)", function(){
    return showPage(+$(this).text());
  });

  $(".next-page").on("click", function(){
    return showPage(currentPage + 1);
  });

  $(".previous-page").on("click", function(){
    return showPage(currentPage - 1);
  });
};

























