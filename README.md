# Startup

[Notes](Notes/notes.md)

## Description deliverable

### Elevator pitch
Have you ever wanted to test how well you know a song's lyrics or see which one of your friends knows a song the best? The Ditty application lets you race against the clock and against your friends to see how fast you can type out a song's lyrics. You can race your friends in real time and can even see your past scores. You will be able to pick any song and what percentage of the song you want to type. 

### Design
![Mock](website_idea.JPG)

### Key features
- Secure login over HTTPS
- Ability to search for song to select
- Ability to race friends in real time
- Displays current percentage of song typed
- Scores are persistently stored
- Ability to request a hint when user is stuck

### Technologies
I am going to use the required technologies in the following ways.
- **HTML** - Uses correct HTML structure for application. Four HTML pages. One for login, song selection, game play, and to see past scores. Hyperlinks to choice artifact.
- **CSS** - Application styling that looks good on different screen sizes, uses good whitespace, color choice and contrast.
- **JavaScript** - Provides login, choice of song display, real time status of typed lyrics for both the user and the friend.
- **Service** - Backend service with endpoints for:
    - login
    - retrieving lyrics
    - updating lyric progress
    - retrieving lyric progress
    - updating new scores
    - retrieving old scores
- **DB** - Stores users, lyrics, user's lyrics progress, and scores in database. 
- **Login** - Register and login users. Credentials securely stored in database. Can't play or see scores until authenticated. 
- **WebSocket**
    - Each user is updated with the other user's current progress.
    - Makes a call to a the *Genuis API* to get song lyrics.
- **React** - Application ported to use the React web framework.

## HTML Deliverable
For this deliverable I added the application structure.
- **HTML Pages** - Four HTML pages that represent the ability to login, select a song, play, and see past scores.
- **Links** - The pages have links to each other and there is a link at the bottom for GitHub.
- **Text** - All of the headings are text.
- **Images** - The GitHub link at the bottom is represented by a GitHub image.
- **Login** - There are input boxes for login. 
- **Database** - The svg represents where the lyrics will be pulled from the database and displayed.
- **Websocket** - The friend's percentage represents where the friend's real time data will be displayed.

## CSS Deliverable
For this deliverable I properly styled the application into its final appearance.
- **Header, footer, and main content body** - These main elements are properly in place as well as their content.
- **Navigation elements** - I used Bootstrap to make a nice looking navigation bar at the top of the necessary pages.
- **Responsive to window resizing** - My app looks good on all window sizes.
- **Application elements** - Used good whitespace and contrast.
- **Application text content** - Used fonts that worked well together and are consistent.
- **Application images** - Properly sized the Github logo to work as the link to my Github repository.

## JavaScript Deliverable
For this deliverable I made my application functional to type out the lyrics to a song and keep track of scores.
- **Login** - When you press the login button it takes you to the select a song page and will display the user's username in the play screen.
- **Database** - Displays the saved scores. Currently stored in localStorage but will be replaced with the database data later.
- **Websocket** - I created a simulateFriend function to simulate retrieving real-time data from the other player. I also stored song lyrics in an object to simulate the data that will be retrieved from an API.
- **Application Logic** - You can select a song and type the lyrics out as it displays a timer and the current percent you're done with the song. When you finish, your score is recorded.