# Project Proposal - BruinStreetMap

## Team Information
- **Darsh Verma** (1C)
- **Brandon Bogoniewski** (1C)
- **Gal Cohavy** (1A)
- **Jonathan Levi** (1A)
- **Samagra Pandey** (1B)

**Team Name:** BruinStreetMap

## Project Introduction

### Platform
BruinStreetMap will be an interactive web application geared toward UCLA students. The development stack for the app is:
- **Frontend:** React.js and React Router V6
- **Server-Side:** Flask
- **Database:** PostgreSQL (to store user information and queries)

Additionally, the application will integrate the **Google Maps Embed API** to enable users to interactively zoom into specific areas for higher granularity.

### Motivation
Current maps of UCLA appear high-resolution but fail to provide useful, student-generated information. The proposed solution is to have user-generated descriptors placed across the map, with the highest-ranking descriptions floating to the top. This will create a map enriched with relevant information such as the best places to eat, study, or meet people. This idea is inspired by the open-source project “Hoodmaps” by Pieter Levels, which notably lacks detailed UCLA information.

### Detailed Description
- **User Reports:** Bruins will be able to report information about various areas of UCLA. The types of information include:
  - Safety
  - Lighting
  - Feel/Vibe

- **User Profiles:** During sign-up, users will be encouraged to input details such as major, clubs, sports, and hobbies. This information allows for filtering reports (e.g., filtering for reports made by CS majors). Note that personal information will remain confidential on the front end.

- **Interaction:** 
  - All reports will feature upvote and downvote options.
  - Users will have the ability to add comments to reports.
  - There will be an option to merge similar reports.
  - When submitting a report, if the system detects a similar existing report, it will recommend that users upvote the existing report instead.


Moderation:
Only Bruins will be able to make reports or interact with the server-side data in any way (verified by @g.ucla.edu emails), but anyone can view the data of the map.
Posts made by Bruins can be flagged by other users if made inappropriate or offensive
Plan to use some AI moderator API to check posts before allowing user posts to be viewed. 
If a user's posts are taken down multiple times, we will offer a system to ban the user. Because we require UCLA emails to verify Bruin status, users who are banned will not be able to report anymor
