# Votes API Endpoints

## Get Post Votes

- **Method**: GET
- **Endpoint**: `/posts/:id/votes`
- **Response**:
  ```json
  {
    "upvotes": "integer",
    "downvotes": "integer"
  }
  ```

## Get Comment Votes

- **Method**: GET
- **Endpoint**: `/comments/:id/votes`
- **Response**:
  ```json
  {
    "upvotes": "integer",
    "downvotes": "integer"
  }
  ```

## Vote Operations (Posts)

- **Upvote Post**: POST `/posts/:id/upvote`
- **Downvote Post**: POST `/posts/:id/downvote`
- **Remove Post Vote**: POST `/posts/:id/remove-vote`
- **Request Body** (for all vote operations):
  ```json
  {
    "user_id": "integer"
  }
  ```

## Vote Operations (Comments)

- **Upvote Comment**: POST `/comments/:id/upvote`
- **Downvote Comment**: POST `/comments/:id/downvote`
- **Remove Comment Vote**: POST `/comments/:id/remove-vote`
- **Request Body** (for all vote operations):
  ```json
  {
    "user_id": "integer"
  }
  ```
