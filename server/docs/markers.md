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

---

# Markers API Endpoints

## Create Marker

- **Method**: POST
- **Endpoint**: `/markers`
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
- **Response**:
  ```json
  {
    "message": "Marker created!",
    "marker": {marker object}
  }
  ```

## Get All Markers

- **Method**: GET
- **Endpoint**: `/markers`
- **Response**:
  ```json
  {
    "message": "Markers retrieved successfully!",
    "markers": [array of marker objects]
  }
  ```

## Update Marker

- **Method**: PUT
- **Endpoint**: `/markers/:id`
- **Request Body**:
  ```json
  {
    "text": "string (optional)",
    "color": "string (optional)",
    "fontSize": "string (optional)"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Marker updated successfully!",
    "marker": {updated marker object}
  }
  ```

## Delete Marker

- **Method**: DELETE
- **Endpoint**: `/markers/:id`
- **Response**:
  ```json
  {
    "message": "Marker deleted successfully"
  }
  ```
