# Notes API Endpoints

## Get All Notes

- **Method**: GET
- **Endpoint**: `/notes`
- **Response**:

  ```json
  {
    "message": "Notes retrieved successfully!",
    "notes": [array of notes objects]
  }
  ```

## Create Note

- **Method**: POST
- **Endpoint**: `/notes`
- **Request Body**:
  ```json
  {
    "message": "Note created!",
    "note": {
      "user_id": "number",
      "title": "string",
      "latitude": "number",
      "longitude": "number",
      "bounds": "array of numbers"
    }
  }
  ```
- **Response**: Created note object, including it's id

## Update Note

- **Method**: PUT
- **Endpoint**: `/notes/:id`
- **Request Body**:
  ```json
  {
    "message": "Note updated successfully!",
    "note": {
      "lat": "number",
      "lng": "number",
      "text": "string",
      "color": "string (hex color)",
      "fontSize": "string"
      // Rest of new note parameters
    }
  }
  ```
- **Response**: Updated note object

## Delete Note

- **Method**: DELETE
- **Endpoint**: `/notes/:id`
- **Response**:
  ```json
  {
    "message": "Note deleted successfully"
  }
  ```

## Get Note Bounds

### `GET /:id/bounds`

Retrieves the bounds of a specific note identified by its ID.

#### Parameters

- `id` (path parameter): The unique identifier of the note.

#### Request Example

```http
GET /123/bounds
```

#### Response

- **200 OK**: Returns the bounds of the note.
  - **Body**:
    ```json
    {
      "message": "Bounds retrieved successfully!",
      "bounds": [[lat1, lng1], [lat2, lng2], ...]
    }
    ```
- **404 Not Found**: If the note with the specified ID does not exist.
  - **Body**:
    ```json
    {
      "error": "Note not found"
    }
    ```
- **500 Internal Server Error**: If there is an error retrieving the bounds.
  - **Body**:
    ```json
    {
      "error": "Error retrieving bounds: <error_message>"
    }
    ```

## Update Note Bounds

### `PUT /:id/bounds`

Updates the bounds of a specific note identified by its ID.

#### Parameters

- `id` (path parameter): The unique identifier of the note.
- `bounds` (body parameter): An array of arrays representing the new bounds. Each inner array should contain two numbers (latitude and longitude).

#### Request Example

```http
PUT /123/bounds
Content-Type: application/json

{
  "bounds": [[lat1, lng1], [lat2, lng2]]
}
```

#### Response

- **200 OK**: Returns the updated note with the new bounds.
  - **Body**:
    ```json
    {
      "message": "Bounds updated successfully!",
      "note": {
        "id": 123,
        "bounds": [[lat1, lng1], [lat2, lng2]],
        // other note properties...
      }
    }
    ```
- **400 Bad Request**: If the provided bounds are invalid (e.g., not an array of arrays of length 2).
  - **Body**:
    ```json
    {
      "error": "Bounds must be an array of arrays of length 2 with numbers."
    }
    ```
- **404 Not Found**: If the note with the specified ID does not exist.
  - **Body**:
    ```json
    {
      "error": "Note not found"
    }
    ```
- **500 Internal Server Error**: If there is an error updating the bounds.
  - **Body**:
    ```json
    {
      "error": "Error updating bounds: <error_message>"
    }
    ```
