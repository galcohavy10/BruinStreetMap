# BruinStreetMap: A Location-Based Social Platform for UCLA Students
## Demo Script - Duration: ~9 minutes

### Introduction (30 seconds) - Gal
* Welcome audience to the demonstration of BruinStreetMap, a full-stack web app for UCLA CS 35L
* Explain purpose: helping UCLA students share location-specific campus information
* Highlight tech stack: React frontend, Node.js/Express backend, PostgreSQL database
* Preview key features: location-based notes/posts, commenting, voting, filtering by major/clubs
* Mention Google OAuth authentication for security
* Transition to team member contributions

### Backend Architecture and Database Design (90 seconds) - Brandon
* Present PostgreSQL database schema with five interconnected tables (Users, Posts, Comments, Notes, Votes)
* Explain table relationships and how foreign key constraints maintain data integrity
* Showcase RESTful API endpoints for each resource (display key endpoints on screen)
* Describe how ACID properties are guaranteed through database transactions
* Present database diagram visualizing entity relationships
* Demonstrate search functionality through server-side filtering (major/clubs, coordinates, content)
* Show the bounding-box query in action for location-based content discovery

### Authentication and UI/UX (75 seconds) - Jonathan
* Explain Google OAuth implementation for UCLA student authentication
* Demonstrate user onboarding flow collecting major and club information
* Show how profile data is transmitted to backend and stored securely
* Explain JWT token strategy for maintaining authentication state
* Demonstrate logout functionality and session management
* Showcase UCLA campus boundary restriction for post creation
* Show what happens when users attempt to create content outside boundaries

### UI Enhancements and Location Features (75 seconds) - Darsh
* Demonstrate optimistic UI updates for immediate user feedback
* Show collapsible campus notes sidebar for better map visibility
* Present user's current location feature with blue dot indicator
* Showcase the database of UCLA building coordinates
* Explain campus boundary system using polygon visualization
* Demonstrate how these features enhance navigation and usability
* Show zooming to current location and discovering nearby notes

### Advanced Map Features and Note Visualization (90 seconds) - Samagra
* Explain note visualization as React Leaflet polygons with user-defined boundaries
* Demonstrate the priority system for overlapping notes based on upvotes
* Show tooltip hover functionality displaying note information
* Explain the algorithm for handling split polygons when notes overlap
* Demonstrate note interaction by clicking to view comment threads
* Show comment functionality on notes creating location-specific discussions
* Demonstrate coordinate-based search finding all relevant notes at a location

### Application Demo (90 seconds) - Gal
* Walk through complete user journey beginning with Google login
* Show profile creation with major and club selection
* Demonstrate map navigation and zooming to points of interest
* Create a new location-based note with custom text
* Add comments to existing notes about campus locations
* Show upvoting/downvoting functionality on notes and comments
* Demonstrate search capability for finding specific content
* Show filtering options by major and clubs for personalized experience
* Highlight how the complete experience creates a useful campus resource

### Technical Challenges and Solutions (50 seconds) - Brandon
* Discuss polygon rendering challenges with overlapping notes
* Explain the custom polygon splitting algorithm based on vote counts
* Address authentication state persistence challenges
* Describe optimistic UI update synchronization with backend
* Share database schema evolution and normalization process
* Explain polling strategy for quasi-real-time updates
* Highlight how these solutions improved overall application performance

### Conclusion (40 seconds) - Jonathan
* Summarize core features: interactive map, location notes, comments, voting, profiles
* Connect implementation to project requirements with visual checklist
* Discuss future enhancements: WebSockets, mobile responsiveness, time filtering
* Thank the audience and invite questions
* Provide GitHub repository information for code access
* Show team contact details for follow-up

### Technical Requirements Addressed
* Dynamic data display: Map interface with database-driven content
* Data upload: Note/post/comment creation stored in PostgreSQL
* Meaningful search: Location, text, and attribute-based filtering
* Security: Google OAuth implementation with proper token management
* Additional features: Voting system, polygon visualization, threaded comments, major/club filtering, boundary restrictions
