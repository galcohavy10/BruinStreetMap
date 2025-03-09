# Users API Endpoints

## Get All Users

- **Method**: GET
- **Endpoint**: `/users`
- **Response**:
  ```json
  {
    "message": "Users found",
    "users": [array of user objects]
  }
  ```

## Register New User

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

## Update User

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

---

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
