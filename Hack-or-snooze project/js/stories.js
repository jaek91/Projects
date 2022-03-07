"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. **/

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();
  putStoriesOnPage();
}

/**When Hack or Snooze link is clicked, it refreshes the page with all the current stories */

$navHomePage.on("click", putCuratedStoriesOnPage);

function putCuratedStoriesOnPage() {
  $UserStoriesList.empty();
  $favStoriesList.empty();
  putStoriesOnPage();
}



//quick helper function to check if user is logged in or not
function userExistsOrNot() {
  if (currentUser) {
    return true;
  }
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, showDeleteBtn=false) {
  // console.debug("generateStoryMarkup", story);
  const showStar = userExistsOrNot();
  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        ${showStar ? createStarHTML(story,currentUser) : ""}
        ${showDeleteBtn ? getDeleteButtonHTML() : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

function getDeleteButtonHTML() {
  return `<span class="fas fa-trash-alt" id="delete-button"></span>`;
}

///////////////////////////////////////////////////////////////////////////                                                                      
///////////////Section for Deleting stories////////////////////////////////
/////////////////////////////////////////////////////////////////////////// 

async function deleteStoriesOnPage(evt) {
  console.debug("deleteStoriesOnPage");
  evt.preventDefault();

  const $clickedDelete = $(evt.target);
  const storyId = $clickedDelete.closest("li").attr("id");
  await storyList.deleteStory(currentUser,storyId);
  await AddUserStoriesOnPage(); 
}

$allStoriesList.on("click", "#delete-button", deleteStoriesOnPage);
$UserStoriesList.on("click", "#delete-button", deleteStoriesOnPage);

///////////////////////////////////////////////////////////////////////////                                                                      
///////////////Section for adding user's own stories///////////////////////s
/////////////////////////////////////////////////////////////////////////// 

async function AddUserStoriesOnPage() {
  console.debug("AddUserStoriesOnPage");

  $allStoriesList.empty();
  $UserStoriesList.empty();
  $favStoriesList.empty();
  
  if (currentUser.ownStories.length === 0 ) {
    $UserStoriesList.append("<p> No Stories added by User! </p>");
  }
  else {
    for (let story of currentUser.ownStories) {
      const $storytoAdd = generateStoryMarkup(story, true);
      $UserStoriesList.append($storytoAdd);
    }
  }
  
  $UserStoriesList.show();

}

$navMyStories.on("click", AddUserStoriesOnPage);

///////////////////////////////////////////////////////////////////////////                                                                      
///////////////Section for favoriting/unfavoriting stories/////////////////
/////////////////////////////////////////////////////////////////////////// 

//create star html for each story
function createStarHTML(story, user) {
  const isFavorite = user.isFavorite(story.id);
  const starType = isFavorite ? "fas" : "far";
  return `<i class="${starType} fa-star fav-button"></i>`;
}

//allows for toggling a story as a favorite or not. Also deletes stories as favorite or not
async function ToggleFavWithStars(evt) {
  console.debug("ToggleFavWithStars");
  const $starClicked = $(evt.target);
  const storyId = $starClicked.closest("li").attr("id");

  if (!$starClicked.hasClass("fas")) {
    await currentUser.AddOrDeleteFavorites(storyId); //this case we add to the favorites
    $starClicked.toggleClass("fas far");
  }
 
  else {
    await currentUser.AddOrDeleteFavorites(storyId); //this time we delete story from favorites
    $starClicked.toggleClass("fas far");
  }

}
//adds an event listener to the clicking of the stars and toggles accordingly
$allStoriesList.on("click", ".fav-button", ToggleFavWithStars);


/** Gets information about a user's favorite stories, and puts in on the page */
function addFavoriteStoriesOnPage() {
console.debug("addFavoriteStoriesOnPage");

$allStoriesList.empty();
$UserStoriesList.empty();
$favStoriesList.empty();

if (currentUser.favorites.length === 0 ) {
  $favStoriesList.append("<p> No Favorite Stories added by User! </p>");
}
else {
  for (let story of currentUser.favorites) {
    const $storytoAdd = generateStoryMarkup(story);
    $favStoriesList.append($storytoAdd);
  }
}

$favStoriesList.show();

}

$navFavStories.on("click", addFavoriteStoriesOnPage);



/** Gets information for submitting a new story, and puts it on the page */

async function addNewStory(evt) {
    console.debug("addNewStory");
    evt.preventDefault();

    //clear out any residual messages/lists from other lists
    $favStoriesList.empty();

    const storytitle = $newStoryTitle.val();
    const author = $newAuthor.val();
    const url = $StoryUrl.val();
    const newStoryData = {"title": storytitle, "author": author, "url": url};
    
    const newStory = await storyList.addStory(currentUser, newStoryData);
    const $newStory = generateStoryMarkup(newStory);
    $allStoriesList.prepend($newStory);

    $storyForm.slideUp("fast");
    $storyForm.trigger("reset");
}

$storyForm.on("submit", addNewStory)


/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");
  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
  
}
