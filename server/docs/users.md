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

  ## Get Single User

There are 2 methods that get a single user, the first one uses the user_id. They both have the same successful return structure:

### Get Single User by user_id

- **Method**: GET
- **Endpoint**: `/users/:id`
- **Successful Response**:
  ```json
  {
    "message": "User found",
    "user": {
      "username": "string",
      "email": "string",
      "major": "string",
      "clubs": "string[]"
    }
  }
  ```

### Get Single user by username

- **Method**: GET
- **Endpoint**: `/users/username/:username`
- **Successful Response**:

  ```json
  {
    "message": "User found",
    "user": {
      "username": "string",
      "email": "string",
      "major": "string",
      "clubs": "string[]"
    }
  }
  ```
