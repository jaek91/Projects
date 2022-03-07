// categories is the main data structure for the app; it looks like this:
//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];
let idArr = []; //array to hold our idArr for ease of access
const NUM_CATEGORIES = 6;

for (let i = 0; i < NUM_CATEGORIES; i++) {
    let col = categories[i];
    for (let j = 0; j < NUM_CATEGORIES -1; j++) {
        categories[j][i] = null;
    }
}

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

function getCategoryIds() { //are these functions intended to follow async-await pattern?
   
    return axios.get("http://jservice.io/api/categories", {params: {count: 30}})
    .then((fetchedData)=>{
        let categoryData = fetchedData.data;
        let shuffledData =_.shuffle(categoryData); //use lodash's built in shuffle method

        
        if (idArr.length > 0) {
            idArr = []; //clears idArr to allow for new categories when restart button is clicked
        } 
        for (let i = 0; i < NUM_CATEGORIES; i++) {
            idArr.push(shuffledData[i].id);
        }
        return idArr;
    })
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

 function getCategory(catId) {

    let catArr = [];
    return axios.get("http://jservice.io/api/category", {params: {id: catId}})
    .then((fetchedData) => {
        let categoryData = fetchedData.data;
        let finalData = 
        {
            title: categoryData.title, 
            clues: categoryData.clues.map((obj) =>({
                question: obj.question, 
                answer: obj.answer,
                showing: null
            }))
            .slice(0,5) //extract only 5 clues this way
        } 
        catArr.push(finalData);
        return catArr[0];
    })
    .catch( err => 
        {console.log(err)
         return err;
        }
    ) 
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
    let tHead = document.createElement('thead');
    let tBody = document.createElement('tbody');
    tBody.setAttribute("id", "table-body");
    let tHeadContainer = document.createElement("tr");
    const headTitles = categories.map(val => val.title.toUpperCase());

    //check to see if array of categories is full => if size of list > 0, clear and then draw new ones
    
    for (let i = 0; i < NUM_CATEGORIES; i++) {
        //append header info
        let tdHead = document.createElement('td');
        tdHead.innerText = headTitles[i];
        tHeadContainer.append(tdHead);
        tHead.append(tHeadContainer);
        $("#jeopardy").append(tHead);
    }

     for (let x = 0; x < NUM_CATEGORIES-1; x++) {       //x is number of rows and y is the number of columns
        const tableRow = document.createElement("tr"); //create each row element
        tBody.append(tableRow);
        for (let y = 0; y < NUM_CATEGORIES; y++) {
          const cell = document.createElement("td");   //create 5 elements for each row
          cell.setAttribute("id", `${y}-${x}`); //set the id of each element in each row
          cell.innerText = "?";
          tableRow.append(cell);
          cell.addEventListener("click", handleClick);
          
        }
        $("#jeopardy").append(tBody);
      }
} 

function getCluesInCatOrder() { 
    let allclues = [];
    for (let i = 0; i < NUM_CATEGORIES-1; i++) {
        let info = categories.map(({clues}) => clues[i]); //maps clues so that the ith element corresponds to the ith category's question
        allclues.push(info);
    }
    return allclues;
}


/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */
 function handleClick(evt) {
    evt.preventDefault();
    let clues = getCluesInCatOrder();
    let clickedCell = evt.target;
    let cellid = clickedCell.id; 

    $("#table-body").find('tr').each(function(i){
        for (let j = 0; j < NUM_CATEGORIES; j++) {
            if (cellid == `${j}-${i}`) {

                if(clues[i][j]["showing"] == null) {
                    $(`#${j}-${i}`).html(clues[i][j]["question"]);
                    categories[j].clues[i]["showing"] = "question";
                }

                else if (clues[i][j]["showing"] == "question") {
                    $(`#${j}-${i}`).html(clues[i][j]["answer"]);
                    categories[j].clues[i]["showing"] = "answer";
                    clickedCell.style.backgroundColor = "#008b00";
                }

                else {
                    return;
                }
            }
        }
    })
}


/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */


//**didnt implement spinner so didnt implement showLoadingView and hideLoadingView**//

function showLoadingView() {

}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {

}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {

    let idArr = await getCategoryIds();

    //check to see if catagories are filled
    if (categories.length > 0) {
        categories = [];  //empty the old categories from the former game;
    }

    for (let id of idArr) {
        let category = await getCategory(id);
        categories.push(category);
    }
    //create the table
    createTable();

    //fill the html table
    fillTable();
}

/** On click of start / restart button, set up game. */

function createTable() {
    let $table = $(document.createElement('table')).prop({
        id: "jeopardy",
        class: "jeopardy-table"
    });
    $("script:first-of-type").before($table);
}

let $startButton = $(document.createElement('button')).prop({
    type: 'button',
    innerHTML: 'Start Game',
    class: 'start-button'
});

let $restartButton = $(document.createElement('button')).prop({
    type: 'button',
    innerHTML: 'Restart Game',
    class: 'restart-button'
});

$(document).ready(
    $(document.body).append($startButton)
)

$startButton.click(function(){
  
  $("button").remove(".start-button");
  setupAndStart();
  $(document.body).append($restartButton);

})

$restartButton.click(function(){
 $("table").remove("#jeopardy");
 setupAndStart();
})

