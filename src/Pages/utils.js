// src/utils.js
// Function to retrieve a specific cookie value by name.
// Used for fetching the CSRF token from the browser cookies for secure POST requests.
export function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}