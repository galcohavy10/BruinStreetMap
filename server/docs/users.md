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

## Create new User

- **Method**: POST
- **Endpoint**: `/users/login`
- **Request Body**:
  ```json
  {
    "email": "string",
    "username": "string"
  }
  ```
- **Successful Response**:
  ```json
  {
    "message": "Login successful!",
    "user": {
      "id": "number",
      "username": "string",
      "email": "string",
      "major": "string",
      "clubs": "string[]"
    },
    "incompleteUser": "boolean" // I don't know why this is here -- Brandon
  }
  ```

## Get user Notes

- **Method**: GET
- **Endpoint**: `/users/:user_id/notes`
- **Successful Response**:

  ```json
  {
    "message": "User note(s) found",
    "notes": "array of notes"
  }
  ```

  The returned notes have these attributes: id, user_id, title, latitude, longitude, bounds, body

  Not all attributes are guaranteed to be defined.

  If no notes are found endpoint will return:

  ```json
  {
    "message": "No notes found for this user.",
    "notes": "empty array"
  }
  ```
