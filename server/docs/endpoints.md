# API Endpoints Documentation

## Users

### Get All Users

- **Method**: GET
- **Endpoint**: `/users`
- **Response**:
  ```json
  {
    "message": "Users found",
    "users": [array of user objects]
  }
  ```

### Register New User

- **Method**: POST
- **Endpoint**: `/users/register`
- **Request Body**:
  ```json
  {
    "username": "string",
    "email": "string",
    "major": "string",
    "clubs": "array"
  }
  ```
- **Response**:
  ```json
  {
    "message": "User registered successfully!",
    "user": {user object}
  }
  ```

### Update User

- **Method**: PUT
- **Endpoint**: `/users/:id`
- **Request Body**:
  ```json
  {
    "username": "string (optional)",
    "email": "string (optional)",
    "major": "string (optional)",
    "clubs": "array (optional)"
  }
  ```
- **Response**:
  ```json
  {
    "message": "User updated successfully!"
  }
  ```

## Posts

### Get All Posts

- **Method**: GET
- **Endpoint**: `/posts`
- **Response**:
  ```json
  {
    "message": "Posts retrieved successfully!",
    "posts": [array of post objects]
  }
  ```

### Create New Post

- **Method**: POST
- **Endpoint**: `/posts`
- **Request Body**:
  ```json
  {
    "user_id": "integer",
    "title": "string",
    "latitude": "number",
    "longitude": "number"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Post created!",
    "post": {post object}
  }
  ```

### Get Post by ID

- **Method**: GET
- **Endpoint**: `/posts/:id`
- **Response**: Post object

### Update Post

- **Method**: PUT
- **Endpoint**: `/posts/:id`
- **Request Body**:
  ```json
  {
    "title": "string (optional)",
    "latitude": "number (optional)",
    "longitude": "number (optional)"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Post updated successfully!",
    "post": {post object}
  }
  ```

### Filter Posts

- **Method**: GET
- **Endpoint**: `/posts/filter`
- **Query Parameters**:
  - `major`: string
  - `clubs`: array
- **Response**: Array of filtered posts

### Get Posts in Bounding Box

- **Method**: GET
- **Endpoint**: `/posts/bounding-box`
- **Query Parameters**:
  - `lat_min`: number
  - `lat_max`: number
  - `lon_min`: number
  - `lon_max`: number
- **Response**:
  ```json
  {
    "message": "Posts retrieved successfully!",
    "posts": [array of post objects]
  }
  ```

## Comments

### Create Comment

- **Method**: POST
- **Endpoint**: `/comments`
- **Request Body**:
  ```json
  {
    "user_id": "integer",
    "post_id": "integer",
    "parent_comment_id": "integer (optional)",
    "body": "string"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Comment posted!",
    "comment": {comment object}
  }
  ```

### Get Post Comments

- **Method**: GET
- **Endpoint**: `/posts/:id/comments`
- **Response**:
  ```json
  {
    "message": "Comments retrieved successfully!",
    "comments": [array of comment objects with earliest first]
  }
  ```

## Votes

### Get Post Votes

- **Method**: GET
- **Endpoint**: `/posts/:id/votes`
- **Response**:
  ```json
  {
    "upvotes": "integer",
    "downvotes": "integer"
  }
  ```

### Get Comment Votes

- **Method**: GET
- **Endpoint**: `/comments/:id/votes`
- **Response**:
  ```json
  {
    "upvotes": "integer",
    "downvotes": "integer"
  }
  ```

### Vote Operations (Posts)

- **Upvote Post**: POST `/posts/:id/upvote`
- **Downvote Post**: POST `/posts/:id/downvote`
- **Remove Post Vote**: POST `/posts/:id/remove-vote`
- **Request Body** (for all vote operations):
  ```json
  {
    "user_id": "integer"
  }
  ```

### Vote Operations (Comments)

- **Upvote Comment**: POST `/comments/:id/upvote`
- **Downvote Comment**: POST `/comments/:id/downvote`
- **Remove Comment Vote**: POST `/comments/:id/remove-vote`
- **Request Body** (for all vote operations):
  ```json
  {
    "user_id": "integer"
  }
  ```

## Notes

### Get All Notes

- **Method**: GET
- **Endpoint**: `/notes`
- **Response**: Array of note objects

### Create Note

- **Method**: POST
- **Endpoint**: `/notes`
- **Request Body**:
  ```json
  {
    "lat": "number",
    "lng": "number",
    "text": "string",
    "color": "string (hex color)",
    "fontSize": "string"
  }
  ```
- **Response**: Created note object

### Update Note

- **Method**: PUT
- **Endpoint**: `/notes/:id`
- **Request Body**:
  ```json
  {
    "text": "string (optional)",
    "color": "string (optional)",
    "fontSize": "string (optional)"
  }
  ```
- **Response**: Updated note object

### Delete Note

- **Method**: DELETE
- **Endpoint**: `/notes/:id`
- **Response**:
  ```json
  {
    "message": "Note deleted successfully"
  }
  ```

### Note Votes

- **Get Note Votes**: GET `/notes/:id/votes`
- **Upvote Note**: POST `/notes/:id/upvote`
- **Downvote Note**: POST `/notes/:id/downvote`
- **Remove Note Vote**: POST `/notes/:id/remove-vote`
- **Request Body** (for vote operations):
  ```json
  {
    "user_id": "integer"
  }
  ```
