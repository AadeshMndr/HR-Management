import axios from "axios";
const BASE_URL = require("./BaseUrl.json").value;
const addCred = require("./withCredentials.json");

// Function to get authentication headers with session token
const getAuthHeaders = () => {
  try {
    const SessionManager = require("../../utils/sessionManager").default;
    const sessionToken = SessionManager.getSessionToken();
    
    return {
      withCredentials: false,
      headers: sessionToken ? { 'x-session-token': sessionToken } : {}
    };
  } catch (error) {
    console.error('Error getting session token:', error);
    return { withCredentials: false, headers: {} };
  }
};

export const fetchAll = async () => {
  try {
    const url = `${BASE_URL}/api/employees`;
    const authConfig = getAuthHeaders();
    const res = await axios.get(url, authConfig);
    return res.data;
  } catch (err) {
    console.log(err);
    return [];
  }
};

export const fetchTerminated = async () => {
  try {
    const url = `${BASE_URL}/api/terminated`;
    const authConfig = getAuthHeaders();
    const res = await axios.get(url, authConfig);
    return res.data;
  } catch (err) {
    console.log(err);
    return [];
  }
};

export const fetchOne = async (empId) => {
  try {
    const url = `${BASE_URL}/api/employees/${empId}`;
    const authConfig = getAuthHeaders();
    const res = await axios.post(url, {}, authConfig);
    return res.data;
  } catch (err) {
    console.log(err);
    return null;
  }
};

// Alias for fetchOne for better readability
export const fetchById = async (empId) => {
  return fetchOne(empId);
};

// Re-register a terminated employee
export const reRegister = async (empId) => {
  try {
    console.log("API: Re-registering employee with empId:", empId);
    const url = `${BASE_URL}/api/employees/reregister`;
    const data = { empId: empId };
    const authConfig = getAuthHeaders();
    console.log("API: Making request to:", url, "with data:", data, "and config:", authConfig);
    const res = await axios.post(url, data, authConfig);
    console.log("API: Response received:", res.data);
    return res.data;
  } catch (err) {
    console.error("API: Error in reRegister:", err);
    console.error("API: Error response:", err.response?.data);
    return null;
  }
};

// Permanently delete a terminated employee from the database
export const deleteTerminatedEmployee = async (empId) => {
  try {
    console.log("API: Deleting terminated employee with empId:", empId);
    const url = `${BASE_URL}/api/employees/delete-terminated`;
    const data = { empId: empId };
    const authConfig = getAuthHeaders();
    console.log("API: Making request to:", url, "with data:", data, "and config:", authConfig);
    const res = await axios.post(url, data, authConfig);
    console.log("API: Response received:", res.data);
    return res.data;
  } catch (err) {
    console.error("API: Error in deleteTerminatedEmployee:", err);
    console.error("API: Error response:", err.response?.data);
    throw err;
  }
};

/**
 * 
 * @param {*} data expected data format 
 *  {
      inputs: yourInputs,
      frontendUrl: url
    }
 * @returns employee object
 */

export const createOne = async (data) => {
  try {
    const url = `${BASE_URL}/api/employees`;
    const res = await axios.post(url, data, addCred);
    return res.data;
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const update = async (data) => {
  try {
    const url = `${BASE_URL}/api/employees`;
    const res = await axios.put(url, data, addCred);
    return res.data;
  } catch (err) {
    console.log(err);
    return null;
  }
};
/**
 * 
 * @param {*} data expected data format
   {
     "empId": 3,
     "date": "2024-08-21T12:11:28.950Z",
     "terminationReason":"Personal",
     "terminationNote": "Goodbye"
 }
 * @returns 
 */
export const remove = async (data) => {
  try {
    const url = `${BASE_URL}/api/employees`;
    const res = await axios.delete(url, { data: data }, addCred);
    return res.data;
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const fetchOneByEmail = async (email) => {
  try {
    const url = `${BASE_URL}/api/employees/find/email`;
    const res = await axios.post(url, { email: email }, addCred);
    return res.data;
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const fetchManagers = async () => {
  try {
    const url = `${BASE_URL}/api/managers`;
    const res = await axios.get(url, addCred);
    return res.data;
  } catch (err) {
    console.log(err);
    return [];
  }
};

export const fetchMyTeam = async (managerId) => {
  try {
    const url = `${BASE_URL}/api/employees/find/myteam`;
    const res = await axios.post(url, { managerId: managerId }, addCred);
    return res.data;
  } catch (err) {
    console.log(err);
    return [];
  }
};

export const fetchSummaryByDepartments = async () => {
  try {
    const url = `${BASE_URL}/api/employees/summaries/departments`;
    const res = await axios.get(url, addCred);
    return res.data;
  } catch (err) {
    console.log(err);
    return [];
  }
};

export const fetchSummaryByJobTitles = async () => {
  try {
    const url = `${BASE_URL}/api/employees/summaries/jobtitles`;
    const res = await axios.get(url, addCred);
    return res.data;
  } catch (err) {
    console.log(err);
    return [];
  }
};

export const fetchSummaryByNationalities = async () => {
  try {
    const url = `${BASE_URL}/api/employees/summaries/nationalities`;
    const res = await axios.get(url, addCred);
    return res.data;
  } catch (err) {
    console.log(err);
    return [];
  }
};

export const fetchSummaryByLocations = async () => {
  try {
    const url = `${BASE_URL}/api/employees/summaries/locations`;
    const res = await axios.get(url, addCred);
    return res.data;
  } catch (err) {
    console.log(err);
    return [];
  }
};

export const fetchDepartmentChartData = async () => {
  try {
    const url = `${BASE_URL}/api/employees/summaries/departments/chartdata`;
    const res = await axios.get(url, addCred);
    return res.data;
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const fetchHeadCounts = async (year) => {
  try {
    const url = `${BASE_URL}/api/employees/summaries/headcounts/${year}`;
    const res = await axios.get(url, addCred);
    return res.data;
  } catch (err) {
    console.log(err);
    return null;
  }
};

//Expected data format = { destinationDepartmentId: 2,employeeEmpIds: [1,2,3]}
export const changeDepartments = async (data) => {
  try {
    const url = `${BASE_URL}/api/employees/change/department`;
    const res = await axios.post(url, data, addCred);
    return res.data;
  } catch (err) {
    throw err;
  }
};

//Expected data format = { destinationRoleId: 2, employeeEmpIds: [1,2,3]}
export const changeJobs = async (data) => {
  try {
    const url = `${BASE_URL}/api/employees/change/job`;
    const res = await axios.post(url, data, addCred);
    return res.data;
  } catch (err) {
    throw err;
  }
};


export const finalizeOnboarding = async (empId) => {
  try {
    const url = `${BASE_URL}/api/employees/onboarding/done`;
    const res = await axios.post(url, {empId: empId}, addCred);
    return res.data;
  } catch (err) {
    throw err;
  }

}

export const fetchEmployeeWithNoManager = async () => {
  try {
    const url = `${BASE_URL}/api/employees/manager/none`;
    const res = await axios.get(url, addCred);
    return res.data;
  } catch (err) {
    throw err;
  }
};

//Expected data format = { managerIds: [1,2,3]}
export const removeManager = async (data) => {
  try {
    const url = `${BASE_URL}/api/employees/manager/remove`;
    const res = await axios.post(url, data, addCred);
    return res.data;
  } catch (err) {
    throw err;
  }
};

//Expected data format [{managerId:1, empIds: [2,3,4]}, {managerId: 5, empIds:[6,7,8]}]
export const changeManager = async (data) => {
  try {
    const url = `${BASE_URL}/api/employees/manager/change`;
    const res = await axios.post(url, data, addCred);
    return res.data;
  } catch (err) {
    throw err;
  }
};
