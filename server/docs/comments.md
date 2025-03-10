# Comments API Endpoints

## Create Comment

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

## Get Post Comments

- **Method**: GET
- **Endpoint**: `/posts/:id/comments`
- **Response**:
  ```json
  {
    "message": "Comments retrieved successfully!",
    "comments": [array of comment objects with earliest first]
  }
  ```

## Update Comment

- **Method**: PUT
- **Endpoint**: `/comments/:id`
- **Request Body**:
  ```json
  {
    "body": "string (optional)"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Comment updated successfully!",
    "comment": {updated comment object}
  }
  ```

## Delete Comment

- **Method**: DELETE
- **Endpoint**: `/comments/:id`
- **Response**:
  ```json
  {
    "message": "Comment deleted successfully"
  }
  ```
