import { useContext, useEffect, useState } from "react";
import { Box, Stack, Typography, Avatar, TableCell, Button, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText } from "@mui/material";
import dayjs from "dayjs";
import AppTable from "../components/PeopleComponents/AppTable";
import AppTabs from "../components/PeopleComponents/AppTabs";
import ActionMenu from "../components/PeopleComponents/ActionMenu";
import { formatPhoneNumber } from "../assets/utils";
import StateContext from "../context/StateContext";
import { useNavigate } from "react-router-dom";
import MyInfoMain from "../components/myinfo/MyInfoMain";
import EmployeeForm from "../components/PeopleComponents/EmployeeForm";
/**
 * Expected headCell format for the table. Each object represents a
 * column. Note, AppTable implementation depends on this format to make the
 * table generic. Modification to the format may result in unpredictable outcome.
 */
const tableView = require("../assets/table-view.json");
const api = require("../assets/FetchServices");
// Number of rows to display on the table at a time.
const rowsPerPage = 10;

// Store original employee data globally to access from click handlers
const originalEmployeeDataMap = new Map();

function formatTableData({
  data,
  headCells,
  empId,
  permissionId = 3,
  addActionMenu = false, // To display action menu where possible. True means display action while false means otherwise
  handleEdit,
  handleSurvey,
  handleTermination,
}) {
  // Create set of actions - ensure fresh functions each time
  const actions = (employee) => {
    const empId = employee.empId;
    const data = [];

    // Create and push handleEdit function menu - use original data
    data.push({
      label: "Edit employee",
      action: () => {
        const originalEmployee = originalEmployeeDataMap.get(empId);
        if (originalEmployee) {
          handleEdit(originalEmployee);
        } else {
          handleEdit(employee);
        }
      },
    });

    // Create and push handleTermination function menu
    data.push({
      label: "End employment",
      action: () => {
        const originalEmployee = originalEmployeeDataMap.get(empId);
        if (originalEmployee) {
          handleTermination(originalEmployee);
        } else {
          handleTermination(employee);
        }
      },
    });

    //If user has admin permission, show all functions. Otherwise, show only edit function
    return permissionId === 1 ? data : [data[0]];
  };

  //Inner function to create formatted TableCells
  const createTableCell = (item, key) => {
    return <TableCell key={key}> {item ? item : " "}</TableCell>;
  };
  const createActionTableCell = (item, key) => {
    return (
      <TableCell
        key={key}
        style={{
          position: "sticky",
          backgroundColor: "white",
          boxShadow: "5px 2px 5px grey",
          right: 0,
        }}
      >
        {item}
      </TableCell>
    );
  };

  // Inner function to disable action menu
  const disableActionMenu = (data, empId) => {
    if (permissionId === 1) {
      return false;
    }
    if (permissionId === 2) {
      return data.managerId !== empId;
    }
    return true;
  };

  // Inner function to check if action menu should be displayed.
  const showActionMenu = (key) => {
    return addActionMenu && key === "action" && permissionId < 3;
  };

  data.forEach(async (emp) => {
    // Store original employee data before formatting for display in global map
    originalEmployeeDataMap.set(emp.empId, { ...emp });

    // Now format for display
    emp.name = `${emp.firstName} ${emp.lastName}`;
    emp.role = emp.role && emp.role.roleTitle;
    emp.team = emp.team && emp.team.teamName ? emp.team.teamName : "New Team"; // Added by Ankit: set default team name
    emp.department = emp.department && emp.department.departmentName;
    emp.manager = emp.Manager && `${emp.Manager.firstName} ${emp.Manager.lastName}`;
    emp.salary = Number(emp.salary).toLocaleString();
    emp.hireDate = emp.hireDate && dayjs(emp.hireDate).format("DD MMMM, YYYY");
    emp.dateOfBirth = emp.dateOfBirth && dayjs(emp.dateOfBirth).format("DD MMMM, YYYY");
    emp.phoneNumber = formatPhoneNumber(emp.phoneNumber);
  });

  const getHeadCellIds = (headCellObj) => headCellObj.map((obj) => obj["id"]);
  const keys = getHeadCellIds(headCells);
  data.forEach((row) => {
    const newData = [];

    keys.forEach((key, index) => {
      let cell;
      if (key === "name") {
        cell = createTableCell(
          <Stack direction="row" spacing={1}>
            <Avatar sx={{ width: 25, height: 25 }} alt={row.name} src={"data:image/png;base64," + atob(row.photo)} />
            <Box sx={{ paddingTop: 0.5 }}>{row.name}</Box>
          </Stack>,
          `name-${row.empId}-${index}`
        );
      } else if (showActionMenu(key)) {
        cell = createActionTableCell(
          <ActionMenu key={`action-menu-${row.empId}`} actions={actions(row)} disableMenu={disableActionMenu(row, empId)} />,
          `action-${row.empId}`
        );
      } else if (key !== "action") {
        cell = createTableCell(row[key], `${key}-${row.empId}-${index}`);
      }
      newData.push(cell);
    });
    if (newData.length > 0) {
      row["cells"] = newData;
    }
  });
}
const tabItems = ({ isAdmin, loading, showActionHeader, employees, headCells, hasTeam, team, terminated, handleRowClick, handleTerminatedRowClick }) => {
  const tabs = [
    {
      label: "Employees",
      child: (
        <AppTable
          caption={"College Employees"}
          headCells={headCells}
          data={employees}
          rowsPerPage={rowsPerPage}
          loading={loading}
          showActionHeader={showActionHeader}
          handleRowClick={handleRowClick}
        />
      ),
    },
  ];

  if (hasTeam) {
    const teamTab = {
      label: "My Team",
      child: (
        <AppTable
          caption={"People in my team"}
          headCells={headCells}
          data={team}
          rowsPerPage={rowsPerPage}
          loading={loading}
          showActionHeader={true}
          handleRowClick={handleRowClick}
        />
      ),
    };
    // tabs.push(teamTab);
  }

  if (isAdmin) {
    const teamTab = {
      label: "Terminated Employees",
      child: (
        <AppTable
          caption={"Terminated employees"}
          headCells={headCells}
          data={terminated}
          rowsPerPage={rowsPerPage}
          loading={loading}
          showActionHeader={false}
          handleRowClick={handleTerminatedRowClick} // Use function that shows confirmation modal for re-registering employee
        />
      ),
    };
    tabs.push(teamTab);
  }
  return tabs;
};

/**
 * This component was designed to demonstrate other components such as
 * AppTable, AppTablePagination, AppTab, and AppDatePickers.
 * @returns A React component.
 */
export default function People({ handleAddNewEmployee, handleEdit, handleSurvey, handleTermination, preSelectedEmployee }) {
  const stateContext = useContext(StateContext);
  const [employees, setEmployees] = useState([]);
  const [myTeam, setMyTeam] = useState([]);
  const [terminated, setTerminated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewDetails, setViewDetails] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  // Confirmation modal states for re-registering terminated employees
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [employeeToReRegister, setEmployeeToReRegister] = useState(null);
  // const [editEmployee, setEditEmployee] = useState(false);
  const navigate = useNavigate();
  const isAdmin = stateContext.state.user && stateContext.state.user.permission.id === 1;
  const headCells = isAdmin ? tableView.admin : tableView.others;
  const hasTeam = stateContext.state.user && stateContext.state.user.permission.id < 3;
  const empId = stateContext.state.employee ? stateContext.state.employee.empId : -1;
  const permissionId = stateContext.state.user ? stateContext.state.user.permission.id : -1;

  const params = {
    data: null,
    headCells,
    empId,
    permissionId,
    addActionMenu: permissionId < 3,
    handleEdit,
    handleSurvey,
    handleTermination,
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true); // Set loading at the start
        
        if (stateContext.state.pdEmployees && !loading) {
          // Create fresh copy of data to avoid mutation issues
          const employeesCopy = JSON.parse(JSON.stringify(stateContext.state.pdEmployees));
          const freshParams = { ...params, data: employeesCopy };
          formatTableData(freshParams);
          setEmployees(freshParams.data);
        } else {
          const res = await api.employee.fetchAll();
          const freshParams = { ...params, data: res };
          formatTableData(freshParams);
          setEmployees(freshParams.data);
          stateContext.updateState("pdEmployees", freshParams.data);
        }

        if (stateContext.state.employee) {
          if (stateContext.state.pdMyTeam && !loading) {
            const teamCopy = JSON.parse(JSON.stringify(stateContext.state.pdMyTeam));
            const freshParams = { ...params, data: teamCopy, addActionMenu: true };
            formatTableData(freshParams);
            setMyTeam(freshParams.data);
          } else {
            const managerId = stateContext.state.employee.empId;
            const team = await api.employee.fetchMyTeam(managerId);
            const freshParams = { ...params, data: team, addActionMenu: true };
            formatTableData(freshParams);
            setMyTeam(freshParams.data);
            stateContext.updateState("pdMyTeam", freshParams.data);
          }
        }
        if (isAdmin) {
          if (stateContext.state.pdTerminated && !loading) {
            const terminatedCopy = JSON.parse(JSON.stringify(stateContext.state.pdTerminated));
            const freshParams = { ...params, data: terminatedCopy, addActionMenu: false };
            formatTableData(freshParams);
            setTerminated(freshParams.data);
          } else {
            const terms = await api.employee.fetchTerminated();
            const freshParams = { ...params, data: terms, addActionMenu: false };
            formatTableData(freshParams);
            setTerminated(freshParams.data);
            stateContext.updateState("pdTerminated", freshParams.data);
          }
        }
        
        setLoading(false); // Set loading to false after all data is fetched
      } catch (err) {
        console.error("Error fetching data:", err);
        setLoading(false); // Ensure loading is set to false even on error
      }
    }
    fetchData();
  }, [stateContext.state.pdEmployees, stateContext.state.pdMyTeam, stateContext.state.pdTerminated, loading]);

  // Handle preSelectedEmployee prop from PeopleHome
  useEffect(() => {
    if (preSelectedEmployee) {
      setSelectedEmployee(preSelectedEmployee);
      setViewDetails(true);
    }
  }, [preSelectedEmployee]);

  const handleRowClick = (row) => {
    // Don't allow viewing profile for terminated employees
    if (row.terminationReason || row.autoDeleteAt) {
      return; // Do nothing for terminated employees
    }
    setSelectedEmployee(row);
    setViewDetails(true);
  };

  // Handler for terminated employees - show confirmation modal first
  const handleTerminatedRowClick = (row) => {
    console.log("Terminated employee clicked:", row);
    setEmployeeToReRegister(row);
    setShowConfirmationModal(true);
  };

  // Handle the actual re-registration after confirmation
  const handleConfirmReRegistration = async () => {
    try {
      console.log("Creating new employee from terminated employee:", employeeToReRegister);
      
      // Get the original employee data (before formatting) to avoid data type issues
      const originalEmployee = originalEmployeeDataMap.get(employeeToReRegister.empId) || employeeToReRegister;
      console.log("Original employee data:", originalEmployee);
      
      // Validate that we have the necessary data
      if (!originalEmployee.firstName || !originalEmployee.lastName || !originalEmployee.email) {
        alert("Missing required employee information. Cannot create new employee.");
        setShowConfirmationModal(false);
        setEmployeeToReRegister(null);
        return;
      }
      
      // Create a new employee object based on the terminated employee
      // Remove fields that should be unique or auto-generated for new employee
      const newEmployeeData = {
        firstName: originalEmployee.firstName,
        lastName: originalEmployee.lastName,
        preferredName: originalEmployee.preferredName || originalEmployee.firstName,
        gender: originalEmployee.gender,
        nationality: originalEmployee.nationality,
        dateOfBirth: originalEmployee.dateOfBirth,
        maritalStatus: originalEmployee.maritalStatus,
        
        // Generate new email based on name with timestamp to ensure uniqueness
        email: `${originalEmployee.firstName?.toLowerCase()}.${originalEmployee.lastName?.toLowerCase()}.${Date.now()}@company.com`,
        phoneNumber: originalEmployee.phoneNumber,
        
        // Set new hire date
        hireDate: new Date().toISOString(),
        effectiveDate: new Date().toISOString(),
        
        // Keep job-related fields - ensure numeric values are proper numbers
        roleId: originalEmployee.roleId && !isNaN(originalEmployee.roleId) ? Number(originalEmployee.roleId) : null,
        departmentId: originalEmployee.departmentId && !isNaN(originalEmployee.departmentId) ? Number(originalEmployee.departmentId) : null,
        managerId: originalEmployee.managerId && !isNaN(originalEmployee.managerId) ? Number(originalEmployee.managerId) : null,
        position: originalEmployee.position,
        post: originalEmployee.post,
        salary: originalEmployee.salary && !isNaN(originalEmployee.salary) ? Number(originalEmployee.salary) : 0,
        employmentType: originalEmployee.employmentType,
        compensationType: originalEmployee.compensationType,
        weeklyHours: originalEmployee.weeklyHours && !isNaN(originalEmployee.weeklyHours) ? Number(originalEmployee.weeklyHours) : 40,
        officeLocation: originalEmployee.officeLocation,
        
        // Keep address information
        streetAddress: originalEmployee.streetAddress,
        unitSuite: originalEmployee.unitSuite,
        city: originalEmployee.city,
        country: originalEmployee.country,
        stateProvince: originalEmployee.stateProvince,
        postalZipCode: originalEmployee.postalZipCode,
        
        // Keep emergency contact
        emergencyContactName: originalEmployee.emergencyContactName,
        emergencyContactRelationship: originalEmployee.emergencyContactRelationship,
        emergencyContactPhoneNumber: originalEmployee.emergencyContactPhoneNumber,
        
        // Keep education and interests
        degrees: originalEmployee.degrees,
        fieldOfInterest: originalEmployee.fieldOfInterest,
        
        // Reset employment-specific fields
        terminationReason: null,
        terminationNote: null,
        autoDeleteAt: null,
        completedOnboardingAt: null,
        photo: null // Reset photo
      };
      
      // Prepare data in the format expected by the API
      const apiData = {
        inputs: newEmployeeData,
        frontendUrl: window.location.origin // Use current domain for frontend URL
      };
      
      console.log("Calling API to create new employee:", apiData);
      
      // Call API to create the new employee
      const response = await api.employee.createOne(apiData);
      
      if (response && response.empId) {
        console.log("New employee created successfully:", response);
        
        // Now delete the terminated employee record from the database
        try {
          console.log("Deleting terminated employee record from database:", employeeToReRegister.empId);
          const deleteResponse = await api.employee.deleteTerminatedEmployee(employeeToReRegister.empId);
          console.log("Terminated employee deleted from database:", deleteResponse);
          
          // Verify deletion was successful
          if (deleteResponse && deleteResponse.message) {
            console.log("Database deletion confirmed:", deleteResponse.message);
          } else {
            console.warn("Database deletion response unclear:", deleteResponse);
          }
        } catch (deleteError) {
          console.error("Error deleting terminated employee from database:", deleteError);
          // Continue with the process even if deletion fails
          alert("Warning: Employee created successfully, but there was an issue removing the old record. You may see the employee in both lists temporarily.");
        }
        
        alert(`New employee created successfully: ${response.firstName} ${response.lastName}`);
        
        // Immediately remove the employee from the terminated list (optimistic update)
        setTerminated(prev => {
          const updated = prev.filter(emp => emp.empId !== employeeToReRegister.empId);
          console.log("Removed employee from terminated list, updated list:", updated);
          return updated;
        });
        
        // Add the new employee to the active employees list (optimistic update)
        const freshParams = { 
          ...params, 
          data: [response]
        };
        formatTableData(freshParams);
        
        setEmployees(prev => {
          const updated = [...prev, ...freshParams.data];
          console.log("Added new employee to active list:", updated);
          return updated;
        });
        
        // Remove the terminated employee from the original data map
        originalEmployeeDataMap.delete(employeeToReRegister.empId);
        
        // Clear state context to ensure fresh data on next component mount
        stateContext.updateState("pdEmployees", null);
        stateContext.updateState("pdMyTeam", null);
        stateContext.updateState("pdTerminated", null);
        
        // Force refresh the terminated employees list from database to ensure consistency
        try {
          console.log("Force refreshing terminated employees list from database");
          const updatedTerminated = await api.employee.fetchTerminated();
          const freshParams = { ...params, data: updatedTerminated, addActionMenu: false };
          formatTableData(freshParams);
          setTerminated(freshParams.data);
          console.log("Terminated list refreshed, new count:", freshParams.data.length);
        } catch (refreshError) {
          console.error("Error refreshing terminated list:", refreshError);
          // Keep the optimistic update if refresh fails
        }
        
      } else {
        console.error("Failed to create employee:", response);
        alert("Failed to create new employee. Please try again.");
      }
      
      // Close modal and reset state
      setShowConfirmationModal(false);
      setEmployeeToReRegister(null);
      
    } catch (error) {
      console.error("Error creating new employee from terminated employee:", error);
      alert("Error occurred while creating new employee: " + (error.message || "Unknown error"));
      
      // Close modal and reset state even on error
      setShowConfirmationModal(false);
      setEmployeeToReRegister(null);
    }
  };

  // Handle modal close/cancel
  const handleCloseConfirmationModal = () => {
    setShowConfirmationModal(false);
    setEmployeeToReRegister(null);
  };

  const handleGoBack = () => {
    setViewDetails(false);
    setSelectedEmployee(null);
  };

  // Find the original employee object by empId before editing
  const handleEditFromDetails = () => {
    if (!selectedEmployee) return;
    // Try to find the original employee from the employees array (raw data)
    const original = employees.find((e) => e.empId === selectedEmployee.empId);
    handleEdit(original || selectedEmployee);
  };

  return (
    <Stack sx={{ minWidth: window.innerWidth < 1550 ? 1100 : 1350 }}>
      <Box
        sx={{
          boxSizing: "border-box",
          width: "100%",
          height: "87px",
          mt: 5,
          mb: -5,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h5" id="tableTitle" component="div" color={"inherent"} fontWeight={600}>
          People
        </Typography>
        {isAdmin && (
          <Button
            variant="contained"
            disableElevation
            onClick={(evt) => handleAddNewEmployee()}
            sx={{
              width: "166px",
              height: "34px",
              border: "1px solid #7F56D9",
              backgroundColor: "#7F56D9",
              fontSize: 13,
              fontWeight: 400,
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#602ece",
                border: "1px solid #602ece",
              },
            }}
          >
            Add new employee
          </Button>
        )}
      </Box>

      <Stack
        sx={{
          boxSizing: "border-box",
          display: "flex",
          width: "100%",
          height: "100%",
          minHeight: "50vh",
          backgroundColor: "#FFFFFF",
          border: "1px solid #EBEBEB",
          borderRadius: "10px",
          pt: 7.5,
          pb: 4,
          pr: 4,
          pl: 5,
          mt: 0,
          mb: 5,
        }}
      >
        {viewDetails ? (
          <Box>
            <Button
              variant="contained"
              disableElevation
              onClick={handleGoBack}
              sx={{
                width: "auto",
                height: "34px",
                border: "1px solid #D0D5DD",
                backgroundColor: "#FFFFFF",
                color: "#000000",
                fontSize: 13,
                fontWeight: 400,
                fontFamily: "Inter",
                textTransform: "none",
                mb: 2,
                "&:hover": {
                  backgroundColor: "#F5F5F5",
                  border: "1px solid #D0D5DD",
                },
              }}
            >
              Go back
            </Button>
            <MyInfoMain employee={selectedEmployee} onClickEdit={handleEditFromDetails} />
          </Box>
        ) : (
          <AppTabs
            items={tabItems({
              isAdmin,
              loading,
              showActionHeader: permissionId < 3,
              employees,
              hasTeam,
              team: myTeam,
              headCells,
              terminated,
              handleRowClick,
              handleTerminatedRowClick,
            })}
          />
        )}
      </Stack>

      {/* Re-registration Confirmation Modal */}
      <Dialog
        open={showConfirmationModal}
        onClose={handleCloseConfirmationModal}
        aria-labelledby="confirm-reregister-dialog-title"
        aria-describedby="confirm-reregister-dialog-description"
      >
        <DialogTitle id="confirm-reregister-dialog-title">
          Create New Employee from Terminated Record
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-reregister-dialog-description">
            {employeeToReRegister && (
              <>
                Do you want to create a new employee record based on <strong>{employeeToReRegister.firstName} {employeeToReRegister.lastName}</strong>?
                <br /><br />
                This will create a new employee record with a new employee ID and a unique email address.
                The terminated record will be removed from the terminated employees list.
                <br /><br />
                <em>Position: {employeeToReRegister.position || 'Not specified'}</em><br />
                <em>Department: {employeeToReRegister.department || 'Not specified'}</em>
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseConfirmationModal}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmReRegistration} 
            variant="contained"
            sx={{ 
              textTransform: "none",
              backgroundColor: "#7F56D9",
              "&:hover": {
                backgroundColor: "#602ece"
              }
            }}
          >
            Create New Employee
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
