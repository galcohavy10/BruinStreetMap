console.log(Date.now());
function createDebouncedFunction(callback, delay) {
  let timeoutId;

  return function (...args) {
    clearTimeout(timeoutId); // Clear the previous timer
    timeoutId = setTimeout(() => {
      callback(...args); // Run the callback after delay
    }, delay);
  };
}

// Example usage:
const debouncedFunction = createDebouncedFunction(() => {
  console.log("Function executed after 5 seconds of inactivity.");
  console.log(Date.now());
}, 5000);

// Test: Calling multiple times quickly will reset the timer
debouncedFunction();
setTimeout(debouncedFunction, 1000); // Resets the timer
setTimeout(debouncedFunction, 3000); // Resets again
// The function will only execute 5 seconds after the last call
