super quick endpoints tutorial:

Lets say we have this endpoint: /users/:username

using this endpoint would look like:

/users/bogo01

this would give the backend bogo01 as the username.

Variables that have a ":" in from of them are query parameters.

You can have as many query parameters as you want in a url, as long as it is distinct from other urls.

Some endpoints also take a body, lets look at the update a user method. The docs say that the request body looks like this:

```json
{
  "username": "string (optional)",
  "email": "string (optional)",
  "major": "string (optional)",
  "clubs": "array (optional)"
}
```

Using this endpoint would look like this:

```
function getUserByUsername(username) {
  try {
    const response = await fetch(`/users/username/${username}`);
    if (!response.ok) {
      throw new Error(`Error fetching user: ${response.statusText}`);
    }
    const data = await response.json();

	// Verify data integrity, to avoid undefined and null bugs, and do stuff with the data after you return.

	return data;
  } catch (error) {
    console.error(error);
	// handle the error.
  }
}
```

You must have the await keyword and whatever function you are running this in must be marked as async.

If you are in a context where you need to run an await function but cannot put the code into an async function. You would usually create an anonymous function:

`(async () => (await functionCall()))()`

If you don't like the above syntax then you could do this:

```
async function name() {
	return await functionCall();
}

name();
```

When doing this, keep in mind that the function is not guaranteed to run before the main thread moves on so do not right depended code after an async function that you called without await. e.g:

```
async function callGetUser(username) {
	const user = await getUserByUsername(username);

	// USE use the user variable here!
	return user;
}

const user = callGetUser();

// DO NOT use the user variable here!

```
