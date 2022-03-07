"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {

  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */

  getHostName() {
    return new URL(this.url).host;
  }

}


/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?

    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map(story => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }



  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */

  //token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3RqYWUiLCJpYXQiOjE2NDI2Mjg3MDh9.0o_loGTI-QvI8utES-aTkLgkq4HDfGjF6PBcFLBEFso'
  async addStory(user, {title,author,url}) {

    let userToken = user.loginToken;
    let storyData = await axios.post((BASE_URL + "/stories"),{"token": userToken, "story":{title, author, url}});
    const newStory = new Story(storyData.data.story);
    this.stories.unshift(newStory);
    user.ownStories.unshift(newStory); //adds the new story to the user's ownStories list

    return newStory;
  }

  /** Removes story from the API and from the current storylist
   * - user - the current instance of User who will post the story
   * - storyID - story desired to be removed
   */
  async deleteStory(user, storyID) {
    const userToken = user.loginToken;
    await axios.delete(`${BASE_URL}/stories/${storyID}`, 
    {data: {token: userToken}});

    //set current storylist to contain stories only where the id's dont match the one desired to be deleted
    this.stories = this.stories.filter(story => story.storyId !== storyID);
    //do the same for the current user's stories and favorites as well
    user.ownStories = user.ownStories.filter(story => story.storyId !== storyID);
    user.favorites = user.favorites.filter(story => story.storyId !== storyID);
  }


}


/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor({
                username,
                name,
                createdAt,
                favorites = [],
                ownStories = []
              },
              token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  async AddToFavorites(StoryID) {
    await axios.post(`${BASE_URL}/users/${this.username}/favorites/${StoryID}`, 
    {token: this.loginToken});
    
    return;
  }

  async RemoveFromFavorites(StoryID) {
    const token = this.loginToken;
    await axios.delete(`${BASE_URL}/users/${this.username}/favorites/${StoryID}`, 
    {data: {token}});

    return;
  }

  async AddOrDeleteFavorites(StoryID) {
    let newStory = storyList.stories.filter(story => (story.storyId === StoryID))[0];
    const currentFavoritesIds = this.favorites.map((el)=>(el.storyId));

    //check if we can find the StoryID of the story we want to add in current favorites
    if (currentFavoritesIds.indexOf(StoryID) === -1) {  
      //if we dont have the story within the favorites array then add it
      this.favorites.unshift(newStory);
      this.AddToFavorites(StoryID);
    }

    else { 
      // we delete the story from favorites because it already exists in the list
      this.RemoveFromFavorites(StoryID);
    }
  } 

  //an helper function to determine if the given story by StoryID is a favorite or not
  isFavorite(StoryID) {
    let favoriteStories = currentUser.favorites;
    return favoriteStories.some(el => (el.storyId === StoryID));
  }


  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    let { user } = response.data

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }
}
