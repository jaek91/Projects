# Conceptual Exercise

Answer the following questions below:

- What are important differences between Python and JavaScript?

--Python is a scripting language used for both desktop and web applications whereas Javascript is a client side scripting language
--Python uses indentation to create scope for code where as Javascript uses brackets to indicate a code block
--Python has built in hash tables (e.g. dictionaries and sets) where as Javascript doesn't have.

- Given a dictionary like ``{"a": 1, "b": 2}``: , list two ways you
  can try to get a missing key (like "c") *without* your programming
  crashing.

--if given a dictionary say d = {"a": 1, "b": 2}. One way you can try to get a missing key is to use d.get("c",default) where default is a value that's displayed if the key doesn't associate to any value in d

- What is a unit test?

--An unit test is a test that's testing one unit of functionality which is typically one function or method

- What is an integration test?

--An integration test is a test to see that various components work together, say a function that's called within another function

- What is the role of web application framework, like Flask?

--It's role is to provide a set of functions, classes etc that help you to define which requests to respond to (e.g. routes for different links on a website) and how to respond to them (e.g. Showing an About Us paage)

- You can pass information to Flask either as a parameter in a route URL
  (like '/foods/pretzel') or using a URL query param (like
  'foods?type=pretzel'). How might you choose which one is a better fit
  for an application?

--You could choose which is better by determining whether if the web page is focused on being an description or the subject of the page or whether the user is allowed extra information about a page given their query term. With that being said, an URL query param would work better for the description of the page whereas using an URL query param would better for additional searchable information.

- How do you collect data from a URL placeholder parameter using Flask?
--Using request.args

- How do you collect data from the query string using Flask?
--Using request.args

- How do you collect data from the body of the request using Flask?
--Using request.form

- What is a cookie and what kinds of things are they commonly used for?

--Cookies are a text file (more specifically an name/string-value pair stored by the client (browser)). Cookies also help to improve the user's web browsing experience by remembering user information such as user id and passwords as well as save information about their session on the website

- What is the session object in Flask?
--An cryptographically signed dictionary that contain information about the current browser

- What does Flask's `jsonify()` do?
--It takes data in form of arguments and returns an Response object with a JSON type
