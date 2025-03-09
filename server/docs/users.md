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
