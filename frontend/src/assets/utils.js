const api = require("./FetchServices")
const SessionManager = require("../utils/sessionManager").default;

/**
 * Returns the phone number without any formatting.
 * @param {string} num string number to be returned as-is.
 * @returns unformatted string.
 */
const formatPhoneNumber = (num) => {
  try {
    // Remove any existing formatting and return just the digits
    const cleanedNum = num.replace(/\D/g, '');
    return cleanedNum;
  } catch (err) {
    return num;
  }
};

/**
 * Utility function to fetch user and employee data from the backend.
 * @param {string} email user's email address
 * @returns object containing user and employee data
 */
const getAuthUser = async (email) => {
  if (!email) {
    throw "email cannot be null";
  }
  const auth = {};
  // Get user.
  const user = await api.user.fetchOneByEmail(email);
   auth.user = user;
  if (user) {
   const employee = await api.employee.fetchOneByEmail(user.email);
    auth.employee = employee;
  }
  return auth;
};

const login = async ({stateContext, email, password, rememberMe = false}) => {
    const response = await api.authentication.login({email, password});
    
    // Store session token using SessionManager
    if (response.sessionToken) {
      SessionManager.setSessionToken(response.sessionToken);
    }
    
    const { user, employee } = await getAuthUser(email);
    const sessionData = {user, employee};
    
    // Store session in localStorage for persistence
    const sessionHours = rememberMe ? 24 * 30 : 24; // 30 days if remember me, otherwise 24 hours
    SessionManager.setSession(sessionData, sessionHours);
    
    stateContext.updateStates(sessionData);
};

const logout = async ({pageContext, navigate}) => {
  await api.authentication.logout();
  
  // Clear session storage
  SessionManager.clearSession();
  
  console.log("Logged out");
  pageContext.navigateTo("login");
  navigate("/", {replace: true});
};

module.exports = { formatPhoneNumber, getAuthUser, login, logout };
