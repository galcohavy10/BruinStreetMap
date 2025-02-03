Project Proposal - BruinStreetMap
Team Information
Darsh Verma (1C)
Brandon Bogoniewski (1C)
Gal Cohavy (1A)
Jonathan Levi (1A)
Samagra Pandey (1B)

Team Name: BruinStreetMap
Project Introduction
Platform
BruinStreetMap will be an interactive web application geared toward UCLA students. The development stack for the app is React.Js and React Router V6 on the frontend,  Flask for server-side communication, and a PostgresQL database to store user information and queries. Additionally, we will integrate the Google Maps Embed API to enable users to interactively zoom into certain areas for higher granularity.
Motivation
Current maps of UCLA are seemingly high-resolution, but fail to provide useful information that students can provide. The solution is having user-generated descriptors littered across the map with the highest ranking descriptions floating to the top. This would create a map like the one below, full of relevant information like best places to eat, study, or meet people. This idea was inspired by the open-source project “Hoodmaps” created by Pieter Levels, which fails to include any detail about UCLA.

Detailed Description
Bruins will be able to report information about different areas of UCLA, information can be any of the following:
Safety
Lighting
Feel/Vibe

When signing up for an account users will be recommended to input information like major, clubs, sports, and hobbies which other users will be able to filter reports on. For example, a user may want to filter for reports made by CS majors. User’s personal information will not be revealed on the front end.

All reports will offer an upvote and downvote option, and the ability to add comments. 

There will be an option to merge multiple similar reports into one report, and while users are writing in reports, if the report looks similar to another report, we will recommend that they upvote the other one.

Moderation:
Only Bruins will be able to make reports or interact with the server-side data in any way (verified by @g.ucla.edu emails), but anyone can view the data of the map.
Posts made by Bruins can be flagged by other users if made inappropriate or offensive
Plan to use some AI moderator API to check posts before allowing user posts to be viewed. 
If a user's posts are taken down multiple times, we will offer a system to ban the user. Because we require UCLA emails to verify Bruin status, users who are banned will not be able to report anymor
