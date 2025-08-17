import { useState, useEffect } from "react";
import { Box, Divider, Stack, Typography, Button } from "@mui/material";
import "./EmployeeForm.css";
import countryData from "../../assets/countries+states+cities.json";
import SelectPhoto from "./SelectPhoto";
import HRMDatePicker from "./HRMDatePicker";
import dayjs from "dayjs";
import PopupModal from "./PopupModal";
import { useLocation } from "react-router-dom";
import { padding } from "@mui/system";
const api = require("../../assets/FetchServices");
const selectOptions = require("../../assets/employee-form-select-options.json");
const validator = require("validator");

const getHomePath = (location) => {
  const fullUrl = window.location.href;
  const relativeUrl = location.pathname;
  if (fullUrl === relativeUrl) {
    return fullUrl;
  }
  return fullUrl.substring(0, fullUrl.indexOf(relativeUrl));
};

const deformatNumber = (phoneNumber) => {
  try {
    //Remove all non-digits.
    return phoneNumber.replace(/\D/g, "");
  } catch (error) {
    return phoneNumber;
  }
};

//Helper function to extract nationality from the country data
const getNationality = () => {
  const data = [""];
  countryData.map((item) => {
    data.push(item.nationality);
  });
  return data;
};

const getCountryName = () => {
  const data = [""];
  countryData.map((item) => {
    data.push(item.name);
  });
  return data;
};

const getStates = (countryName) => {
  const data = [""];
  for (let country of countryData) {
    if (country.name === countryName) {
      const states = country.states;
      states.forEach((state) => {
        data.push(state.name);
      });
      break;
    }
  }
  return data;
};

const getCities = (countryName, stateName) => {
  const data = [""];
  for (let country of countryData) {
    if (country.name === countryName) {
      const states = country.states;
      for (let state of states) {
        if (state.name === stateName) {
          const cities = state.cities;
          cities.forEach((city) => {
            data.push(city.name);
          });
          break;
        }
      }

      break;
    }
  }
  data.push("Others");
  return data;
};

function sort(itemA, itemB, key) {
  if (itemA[key] < itemB[key]) {
    return -1;
  }
  if (itemB[key] > itemA[key]) {
    return 1;
  }
  return 0;
}

// Function to extract values of a key from an array of objects
const getValues = (arr, key) => {
  const data = [""];
  for (let value of arr) {
    data.push(value[key]);
  }
  return data;
};

const containerStyle = {
  boxSizing: "border-box",
  display: "flex",
  width: "100%",
  backgroundColor: "#FFFFFF",
  border: "1px solid #EBEBEB",
  borderRadius: "10px",
  pt: 0,
  pb: 4,
  pr: 4,
  pl: 5,
  mt: 0,
};

const rootStyle = {
  width: "100%",
  height: "100%",
};

const errorStyle = {
  fontSize: "10px",
  fontFamily: "Inter",
  color: "red",
  paddingLeft: "5px",
};

function RowStack({ children }) {
  return (
    <Stack direction={"row"} spacing={3}>
      {children}
    </Stack>
  );
}

function createHeader(employee, handleDiscard, handleDownloadContract) {
  return (
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
        {employee ? "Edit my info" : "Add a new employee"}
      </Typography>

      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          disableElevation
          onClick={handleDownloadContract}
          sx={{
            width: "auto",
            height: "34px",
            border: "1px solid #7F56D9",
            backgroundColor: "#7F56D9",
            color: "#FFFFFF",
            fontSize: 13,
            fontWeight: 400,
            fontFamily: "Inter",
            textTransform: "none",
            "&:hover": {
              backgroundColor: "#602ece",
              border: "1px solid #602ece",
            },
          }}
        >
          Download Contract Documents
        </Button>
        <Button
          variant="contained"
          disableElevation
          onClick={() => handleDiscard(true)}
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
            "&:hover": {
              backgroundColor: "#F5F5F5",
              border: "1px solid #D0D5DD",
            },
          }}
        >
          Discard and go back
        </Button>
      </Stack>
    </Box>
  );
}

function createFooter(employee, handleSubmit) {
  return (
    <Box
      sx={{
        boxSizing: "border-box",
        width: "100%",
        display: "flex",
        justifyContent: "end",
        pt: 2,
      }}
    >
      <Button
        variant="contained"
        disableElevation
        onClick={handleSubmit}
        sx={{
          width: "166px",
          height: "34px",
          border: "1px solid #7F56D9",
          backgroundColor: "#7F56D9",
          fontSize: 13,
          fontWeight: 400,
          fontFamily: "Inter",
          textTransform: "none",
          "&:hover": {
            backgroundColor: "#602ece",
            border: "1px solid #602ece",
          },
        }}
      >
        {employee ? "Save changes" : "Add new employee"}
      </Button>
    </Box>
  );
}

function createSubHead(title) {
  return (
    <Stack sx={{ paddingTop: "30px", fontWeight: "400" }}>
      <Typography sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>{title}</Typography>
      <Divider />
    </Stack>
  );
}

function ImagePicker(props) {
  const { employee, handleChange } = props;
  const image = employee && `data:image/png;base64,${atob(employee.photo)}`;
  return (
    <Stack sx={rootStyle} spacing={1}>
      <label>Photo</label>
      <SelectPhoto
        imageData={image}
        onChange={(fileData) => {
          let startIndex = fileData.indexOf(",") + 1;
          fileData = fileData.substring(startIndex);
          const data = {
            target: {
              name: "photo",
              value: fileData,
            },
          };
          handleChange(data);
        }}
      />
    </Stack>
  );
}

function CustomisedDatePicker(props) {
  const { label, name, value, handleChange, validator, required } = props;
  return (
    <Stack sx={rootStyle} spacing={1}>
      <Typography>
        {label}
        {required && <span style={{ color: "red", marginLeft: "4px" }}>*</span>}
      </Typography>
      <Typography>
        <HRMDatePicker name={name} initialValue={value} hasError={validator[name]} onChange={handleChange} />
        {validator[name] && <Box sx={errorStyle}>{validator[name]} </Box>}
      </Typography>
    </Stack>
  );
}

function CustomisedSelectTag(props) {
  const { label, name, value, options, handleChange, validator, restricted, required } = props;
  return (
    <Stack sx={rootStyle} spacing={1}>
      <Typography>
        {label}
        {required && <span style={{ color: "red", marginLeft: "4px" }}>*</span>}
      </Typography>
      <Typography>
        <select
          className={validator[name] ? "select-element field-error" : "select-element"}
          name={name}
          value={value}
          onChange={handleChange}
          disabled={restricted}
        >
          {options &&
            options.map((option, index) => {
              return (
                <option key={`${props.name || "select"}-${option}-${index}`} value={option}>
                  {option}
                </option>
              );
            })}
        </select>
        {validator[name] && <Box sx={errorStyle}>{validator[name]} </Box>}
      </Typography>
    </Stack>
  );
}
function GenderSelectTag(props) {
  const { label, name, value, options, handleChange, validator, restricted, required } = props;
  return (
    <Stack sx={rootStyle} spacing={1}>
      <Typography>
        {label}
        {required && <span style={{ color: "red", marginLeft: "4px" }}>*</span>}
      </Typography>
      <Typography>
        <select
          className={validator[name] ? "select-element field-error" : "select-element"}
          name={name}
          value={value}
          onChange={handleChange}
          style={{ width: "30.3774%" }}
          disabled={restricted}
        >
          {options &&
            options.map((option, index) => {
              return (
                <option key={`${props.name || "gender"}-${option}-${index}`} value={option}>
                  {option}
                </option>
              );
            })}
        </select>
        {validator[name] && <Box sx={errorStyle}>{validator[name]} </Box>}
      </Typography>
    </Stack>
  );
}
function CustomisedInput(props) {
  const { label, name, value, handleChange, placeholder, validator, restricted, required } = props;
  return (
    <Stack sx={rootStyle} spacing={1}>
      <Typography>
        {label}
        {required && <span style={{ color: "red", marginLeft: "4px" }}>*</span>}
      </Typography>
      <Typography>
        <input
          className={validator[name] ? `text-field field-error` : `text-field`}
          type="text"
          name={name}
          value={value}
          placeholder={placeholder}
          onChange={handleChange}
          require
          disabled={restricted}
        />
        {validator[name] && <Box sx={errorStyle}>{validator[name]} </Box>}
      </Typography>
    </Stack>
  );
}
function CustomisedSocialMediaInput(props) {
  const { title, name, value, handleChange, validator } = props;
  return (
    <Stack sx={rootStyle} spacing={1}>
      <Stack direction={"row"}>
        <Box className="text-field-social-media-title">{title}</Box>
        <input
          className={validator[name] ? "text-field-social-media field-error" : "text-field-social-media"}
          type="text"
          name={name}
          value={value}
          onChange={handleChange}
          require
        />
        {validator[name] && <Box sx={errorStyle}>{validator[name]} </Box>}
      </Stack>
    </Stack>
  );
}

function SocialMediaContainer({ children }) {
  return (
    <Stack spacing={1}>
      <Typography>Social profiles</Typography>
      <Stack spacing={1} direction={"row"}>
        {children}
      </Stack>
    </Stack>
  );
}

function DegreeContainer({ children }) {
  return (
    <Stack spacing={1}>
      <Typography>Education</Typography>
      <Stack spacing={2}>{children}</Stack>
    </Stack>
  );
}

function DegreeInput({ degree, index, onChange, onRemove, validator }) {
  const handleDegreeChange = (field, value) => {
    onChange(index, { ...degree, [field]: value });
  };

  return (
    <Stack spacing={1} sx={{ border: "1px solid #D0D5DD", borderRadius: "5px", p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography sx={{ fontWeight: "bold", fontSize: "14px" }}>Degree {index + 1}</Typography>
        {index > 0 && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            style={{
              background: "none",
              border: "none",
              color: "#F04438",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            Remove
          </button>
        )}
      </Stack>
      <RowStack>
        <Stack sx={rootStyle} spacing={1}>
          <Typography>Degree Type</Typography>
          <select
            className={validator[`degree_${index}_type`] ? "select-element field-error" : "select-element"}
            value={degree.type || ""}
            onChange={(e) => handleDegreeChange("type", e.target.value)}
          >
            {selectOptions.degreeTypes.map((option, optIndex) => (
              <option key={optIndex} value={option}>
                {option}
              </option>
            ))}
          </select>
          {validator[`degree_${index}_type`] && <Box sx={errorStyle}>{validator[`degree_${index}_type`]}</Box>}
        </Stack>
        <Stack sx={rootStyle} spacing={1}>
          <Typography>Field of Study</Typography>
          <input
            className={validator[`degree_${index}_field`] ? "text-field field-error" : "text-field"}
            type="text"
            value={degree.field || ""}
            onChange={(e) => handleDegreeChange("field", e.target.value)}
            placeholder="e.g., Computer Science, Business Administration"
          />
          {validator[`degree_${index}_field`] && <Box sx={errorStyle}>{validator[`degree_${index}_field`]}</Box>}
        </Stack>
      </RowStack>
    </Stack>
  );
}

function EmployeeForm({ employee, restricted, onDiscard, onSave }) {
  const [inputs, setInputs] = useState(employee || {});

  const [validator, setValidator] = useState({});
  // array of department objects received from the backend
  const [departments, setDepartments] = useState([]);
  // array of degrees for the employee
  const [degrees, setDegrees] = useState([{ type: "", field: "" }]);

  // To take note of any change to the form. If value is true, there will be
  // a pop asking if user wants to save the changes when discard button is pressed.
  const [change, setChange] = useState(false);

  const [prompt, setPrompt] = useState(false);

  let location = useLocation();

  useEffect(() => {
    async function fetchData() {
      // You can await here
      try {
        let res = await api.department.fetchAll();
        res.sort((a, b) => sort(a, b, "departmentName"));
        setDepartments(res);

        setInputs(
          employee
            ? employee
            : {
                hireDate: dayjs().format("MMM D, YYYY"),
                effectiveDate: dayjs().format("MMM D, YYYY"),
              }
        );
        if (employee && employee.photo) {
          setInputs((values) => ({
            ...values,
            ["photo"]: atob(employee.photo),
          }));
        }
      } catch (err) {
        console.log(err);
      }
    }
    fetchData();
    if (employee) {
      loadEmployee(employee);
    }
  }, [employee]);

  const loadEmployee = (emp) => {
    // Create additional columns needed for the form.
    emp["_city"] = null;
    const cities = getCities(emp.country, emp.stateProvince);
    if (!cities.includes(emp.city)) {
      emp["_city"] = emp.city;
      emp.city = "Others";
    }
    emp["_department"] = emp.department.departmentName || emp.department;
    emp.phoneNumber = deformatNumber(emp.phoneNumber);
    emp.salary = deformatNumber(emp.salary);

    // Load degrees
    if (emp.degrees && emp.degrees.length > 0) {
      setDegrees(emp.degrees);
    } else {
      setDegrees([{ type: "", field: "" }]);
    }

    const socialProfiles = emp.socialProfiles;
    if (socialProfiles) {
      for (let profile of socialProfiles) {
        const lastIndex = profile.profileUrl.lastIndexOf("/");
        if (lastIndex < 0) continue;
        const userName = profile.profileUrl.substring(lastIndex + 1);
        if (profile.mediumName.toLowerCase() === "facebook") {
          emp["_facebook"] = userName;
        } else if (profile.mediumName.toLowerCase() === "twitter") {
          emp["_twitter"] = userName;
        } else if (profile.mediumName.toLocaleLowerCase() === "linkedin") {
          emp["_linkedin"] = userName;
        }
      }
    }
  };

  // This function filters the inputs to ensure they align with the backend data model
  const filterInputs = () => {
    //Use first name as preferred name if the latter is not provided
    if (!inputs.preferredName) {
      inputs.preferredName = inputs.firstName;
    }
    inputs.dateOfBirth = new Date(inputs.dateOfBirth);
    inputs.hireDate = new Date(inputs.hireDate);
    inputs.effectiveDate = new Date(inputs.effectiveDate);

    // Handle contract expiry date
    if (inputs.contractExpiryDate) {
      inputs.contractExpiryDate = new Date(inputs.contractExpiryDate);
    }

    if (inputs.city === "Others") {
      inputs.city = inputs._city;
    }

    // Set default values for removed fields that are required in database
    if (!inputs.roleId) {
      // Set a default role if not already set from _role field
      inputs.roleId = 1; // Default role ID
    }
    if (!inputs.compensationType) {
      inputs.compensationType = "Salary"; // Default compensation type
    }
    if (!inputs.weeklyHours) {
      inputs.weeklyHours = 40; // Default weekly hours
    }
    if (!inputs.officeLocation) {
      inputs.officeLocation = "Main Office"; // Default office location
    }
    if (!inputs.managerId) {
      inputs.managerId = null; // This field is optional
    }

    // Convert empty post field to null since the backend ENUM doesn't accept empty strings
    if (inputs.post === "" || inputs.post === undefined) {
      inputs.post = null;
    }

    const newProfiles = [];
    if (!isEmpty(inputs._facebook)) {
      const facebook = {
        mediumName: "Facebook",
        profileUrl: `https://facebook.com/${inputs._facebook}`,
      };
      newProfiles.push(facebook);
    }

    if (!isEmpty(inputs._twitter)) {
      const twitter = {
        mediumName: "Twitter",
        profileUrl: `https://twitter.com/${inputs._twitter}`,
      };
      newProfiles.push(twitter);
    }
    if (!isEmpty(inputs._linkedin)) {
      const linkedin = {
        mediumName: "Linkedin",
        profileUrl: `https://linkedin.com/in/${inputs._linkedin}`,
      };
      newProfiles.push(linkedin);
    }

    const oldProfiles = inputs.socialProfiles; // This will be null for new employ or empty if existing employee does not have a social profile.
    if (oldProfiles) {
      for (let oldProfile of oldProfiles) {
        for (let index = 0; index < newProfiles.length; index++) {
          const newProfile = newProfiles[index];
          if (newProfile.mediumName === oldProfile.mediumName) {
            newProfile.id = oldProfile.id;
            newProfile.empId = oldProfile.empId;
          }
        }
      }
    }
    inputs["socialProfiles"] = newProfiles;

    // Add degrees to inputs
    const filteredDegrees = degrees.filter((degree) => degree.type && degree.field);
    inputs["degrees"] = filteredDegrees;

    delete inputs.createdAt;
    delete inputs.Manager;
    delete inputs._city;
    delete inputs._department;
    delete inputs.department;
    delete inputs._facebook;
    delete inputs._linkedin;
    delete inputs._twitter;
    delete inputs.reportTo;
    delete inputs.team;
    delete inputs.updatedAt;
    delete inputs._role;

    return newProfiles;
  };

  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs((values) => ({ ...values, [name]: value }));
    if (name === "_department") {
      const index = event.target.selectedIndex;
      if (typeof index !== "undefined") {
        const departmentId = index > 0 ? departments[index - 1].id : null;
        setInputs((values) => ({ ...values, ["departmentId"]: departmentId }));
      }
    } else if (name === "city" && value !== "Others") {
      setInputs((values) => ({ ...values, ["_city"]: null }));
    } else if (name === "employmentType" && value !== "Contract employment") {
      // Clear contract expiry date when employment type is not contract
      setInputs((values) => ({ ...values, ["contractExpiryDate"]: null }));
    }
    setChange(true);
  };

  const handleDegreeChange = (index, updatedDegree) => {
    const newDegrees = [...degrees];
    newDegrees[index] = updatedDegree;
    setDegrees(newDegrees);
    setChange(true);
  };

  const addDegree = () => {
    setDegrees([...degrees, { type: "", field: "" }]);
    setChange(true);
  };

  const removeDegree = (index) => {
    if (degrees.length > 1) {
      const newDegrees = degrees.filter((_, i) => i !== index);
      setDegrees(newDegrees);
      setChange(true);
    }
  };

  const handleSubmit = async () => {
    const result = await validateForm(inputs);
    setValidator(result);
    if (!result.valid) {
      const count = Object.keys(result).length - 1;
      const msg = `Form validation failed. ${count} ${count === 1 ? "error" : "errors"} found.`;
      console.log(msg);
      return;
    }
    const socialProfiles = filterInputs();
    try {
      if (employee) {
        const newData = await api.employee.update(inputs);
        // Update social profiles
        for (let profile of socialProfiles) {
          if (profile.id) {
            // Existing profile, update it
            await api.socialProfile.update(profile);
          } else {
            // New profile, create it.
            await api.socialProfile.createOne(profile);
          }
        }
        if (onSave) {
          onSave(newData.user);
        }
        console.log("Record successfully updated.");
      } else {
        const data = {
          inputs: inputs,
          frontendUrl: `${getHomePath(location)}/complete-signup/`,
        };
        await api.employee.createOne(data);
        if (onSave) {
          onSave(null);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleDiscard = (value) => {
    //value is true when discard button is clicked and false when confirm discard button is pressed.
    if (onDiscard && value && !change) {
      onDiscard();
      return;
    }
    if (onDiscard && !value) {
      onDiscard();
    }
    setPrompt(value);
  };

  const handleDownloadContract = () => {
    // Download contract paper document
    const contractLink = document.createElement('a');
    contractLink.href = '/contractpaper.docx';
    contractLink.download = 'contractpaper.docx';
    contractLink.target = '_blank';
    document.body.appendChild(contractLink);
    contractLink.click();
    document.body.removeChild(contractLink);

    // Download new employee form PDF with a slight delay
    setTimeout(() => {
      const pdfLink = document.createElement('a');
      pdfLink.href = '/NewEmployeeForm.pdf';
      pdfLink.download = 'NewEmployeeForm.pdf';
      pdfLink.target = '_blank';
      document.body.appendChild(pdfLink);
      pdfLink.click();
      document.body.removeChild(pdfLink);
    }, 100);
  };

  const handleCancel = () => {
    setPrompt(false);
  };

  return (
    <Stack
      //direction="column"
      //alignItems="center"
      //justifyContent="center"
      sx={{ minHeight: "100vh", border: "0px solid red" }}
    >
      {change && prompt && <PopupModal onAccept={handleSubmit} onDiscard={() => handleDiscard(false)} onCancel={handleCancel} />}
      {createHeader(employee, handleDiscard, handleDownloadContract)}
      <form>
        <Stack spacing={5} sx={{ border: "0px blue solid", width: "100%", minWidth: "100%" }}>
          {/* Personal Information container begins here */}
          <Stack spacing={2.5} sx={containerStyle}>
            {createSubHead("Personal")}
            <RowStack>
              <CustomisedInput
                label={"First name"}
                name={"firstName"}
                value={inputs.firstName || ""}
                handleChange={handleChange}
                validator={validator}
                required={true}
              />
              <CustomisedInput
                label={"Last name"}
                name={"lastName"}
                value={inputs.lastName || ""}
                handleChange={handleChange}
                validator={validator}
                required={true}
              />
            </RowStack>
            <RowStack>
              <CustomisedInput
                label={"Preferred name"}
                name={"preferredName"}
                value={inputs.preferredName || ""}
                handleChange={handleChange}
                validator={validator}
              />
              <GenderSelectTag
                label={"Gender"}
                name={"gender"}
                value={inputs.gender || ""}
                options={selectOptions.gender}
                handleChange={handleChange}
                validator={validator}
                required={true}
              />
            </RowStack>
            <RowStack>
              <CustomisedDatePicker
                label={"Birth date"}
                name={"dateOfBirth"}
                value={inputs.dateOfBirth || dayjs().format("MMM D, YYYY")}
                handleChange={handleChange}
                validator={validator}
                required={true}
              />
              <ImagePicker employee={employee} handleChange={handleChange} />
            </RowStack>
            <RowStack>
              <CustomisedSelectTag
                label={"Nationality"}
                name={"nationality"}
                value={inputs.nationality || ""}
                options={getNationality()}
                handleChange={handleChange}
                validator={validator}
                required={true}
              />
              <CustomisedSelectTag
                label={"Marital status"}
                name={"maritalStatus"}
                value={inputs.maritalStatus || ""}
                options={selectOptions.maritalStatus}
                handleChange={handleChange}
                validator={validator}
                required={true}
              />
            </RowStack>
            <SocialMediaContainer>
              <CustomisedSocialMediaInput
                title={"twitter.com/"}
                name={"_twitter"}
                value={inputs._twitter || ""}
                handleChange={handleChange}
                validator={validator}
              />
              <CustomisedSocialMediaInput
                title={"facebook.com/"}
                name={"_facebook"}
                value={inputs._facebook || ""}
                handleChange={handleChange}
                validator={validator}
              />
              <CustomisedSocialMediaInput
                title={"linkedin.com/in/"}
                name={"_linkedin"}
                value={inputs._linkedin || ""}
                handleChange={handleChange}
                validator={validator}
              />
            </SocialMediaContainer>

            <DegreeContainer>
              {degrees.map((degree, index) => (
                <DegreeInput
                  key={index}
                  degree={degree}
                  index={index}
                  onChange={handleDegreeChange}
                  onRemove={removeDegree}
                  validator={validator}
                />
              ))}
              <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 1 }}>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={addDegree}
                  sx={{
                    textTransform: "none",
                    fontSize: "13px",
                    color: "#7F56D9",
                    borderColor: "#7F56D9",
                    "&:hover": {
                      borderColor: "#602ece",
                      color: "#602ece",
                    },
                  }}
                >
                  + Add Degree
                </Button>
              </Box>
            </DegreeContainer>

            <Stack spacing={1}>
              <Typography>Field of Interest (Optional)</Typography>
              <textarea
                className={validator.fieldOfInterest ? "text-field field-error" : "text-field"}
                name="fieldOfInterest"
                value={inputs.fieldOfInterest || ""}
                onChange={handleChange}
                placeholder="Describe your overall areas of interest, research focus, or career aspirations..."
                rows={4}
                style={{
                  resize: "vertical",
                  minHeight: "80px",
                  maxHeight: "200px",
                }}
              />
              {validator.fieldOfInterest && <Box sx={errorStyle}>{validator.fieldOfInterest}</Box>}
            </Stack>
          </Stack>
          {/* Personal Information container ends here */}

          {/* Contact Information container begins here */}
          <Stack spacing={2.5} sx={containerStyle}>
            {createSubHead("Job")}
            <RowStack>
              <CustomisedInput
                label={"Mobile"}
                name={"phoneNumber"}
                value={inputs.phoneNumber || ""}
                handleChange={handleChange}
                validator={validator}
                required={true}
              />
              <CustomisedInput
                label={"Work email"}
                name={"email"}
                value={inputs.email || ""}
                handleChange={handleChange}
                validator={validator}
                restricted={restricted}
                required={true}
              />
            </RowStack>
            <RowStack>
              <CustomisedInput
                label={"Address line 1"}
                name={"streetAddress"}
                value={inputs.streetAddress || ""}
                handleChange={handleChange}
                validator={validator}
                required={true}
              />
              <CustomisedInput
                label={"Address line 2"}
                name={"unitSuite"}
                value={inputs.unitSuite || ""}
                handleChange={handleChange}
                validator={validator}
              />
            </RowStack>
            <RowStack>
              <CustomisedSelectTag
                label={"Country"}
                name={"country"}
                value={inputs.country || ""}
                options={getCountryName()}
                handleChange={handleChange}
                validator={validator}
                required={true}
              />
              <CustomisedSelectTag
                label={"State (if applicable)"}
                name={"stateProvince"}
                value={inputs.stateProvince || ""}
                options={getStates(inputs.country)}
                handleChange={handleChange}
                validator={validator}
              />
            </RowStack>
            <RowStack>
              <Stack spacing={1} width={"100%"}>
                <CustomisedSelectTag
                  label={"City"}
                  name={"city"}
                  value={inputs.city || ""}
                  options={getCities(inputs.country, inputs.stateProvince)}
                  handleChange={handleChange}
                  validator={validator}
                  required={true}
                />
                {inputs.city === "Others" && (
                  <CustomisedInput
                    label={""}
                    name={"_city"}
                    value={inputs._city || ""}
                    handleChange={handleChange}
                    placeholder={"Please specify city"}
                    validator={validator}
                    required={true}
                  />
                )}
              </Stack>

              <CustomisedInput
                label={"Postal/zip code"}
                name={"postalZipCode"}
                value={inputs.postalZipCode || ""}
                handleChange={handleChange}
                validator={validator}
              />
            </RowStack>
            <RowStack>
              <CustomisedInput
                label={"Emergency contact name"}
                name={"emergencyContactName"}
                value={inputs.emergencyContactName || ""}
                handleChange={handleChange}
                validator={validator}
                required={true}
              />
              <CustomisedInput
                label={"Emergency contact relationship"}
                name={"emergencyContactRelationship"}
                value={inputs.emergencyContactRelationship || ""}
                handleChange={handleChange}
                validator={validator}
                required={true}
              />
            </RowStack>
            <RowStack>
              <CustomisedInput
                label={"Emergency contact phone"}
                name={"emergencyContactPhoneNumber"}
                value={inputs.emergencyContactPhoneNumber || ""}
                handleChange={handleChange}
                validator={validator}
                required={true}
              />
              <Stack sx={{ width: "100%" }}></Stack>
            </RowStack>
          </Stack>
          {/* Contact Information container ends here */}

          {/* Job Information container begins here */}
          <Stack spacing={2.5} sx={containerStyle}>
            {createSubHead("Job")}
            <RowStack>
              <CustomisedDatePicker
                label={"Hire date"}
                name={"hireDate"}
                value={inputs.hireDate || dayjs().format("MMM D, YYYY")}
                handleChange={handleChange}
                validator={validator}
                restricted={restricted}
                required={true}
              />
              <CustomisedSelectTag
                label={"Academic Position"}
                name={"position"}
                value={inputs.position || ""}
                options={selectOptions.position}
                handleChange={handleChange}
                validator={validator}
                restricted={restricted}
                required={true}
              />
            </RowStack>
            <RowStack>
              <CustomisedSelectTag
                label={"Post"}
                name={"post"}
                value={inputs.post || ""}
                options={selectOptions.post}
                handleChange={handleChange}
                validator={validator}
                restricted={restricted}
              />
              <CustomisedSelectTag
                label={"Department"}
                name={"_department"}
                value={inputs._department || ""}
                options={getValues(departments, "departmentName")}
                handleChange={handleChange}
                validator={validator}
                restricted={restricted}
                required={true}
              />
            </RowStack>
            <RowStack>
              <CustomisedSelectTag
                label={"Employment type"}
                name={"employmentType"}
                value={inputs.employmentType || ""}
                options={selectOptions.employmentType}
                handleChange={handleChange}
                validator={validator}
                restricted={restricted}
                required={true}
              />
              <CustomisedInput
                label={"Salary"}
                name={"salary"}
                value={inputs.salary || ""}
                handleChange={handleChange}
                validator={validator}
                restricted={restricted}
                required={true}
              />
            </RowStack>
            <RowStack>
              <CustomisedDatePicker
                label={"Effective date"}
                name={"effectiveDate"}
                value={inputs.effectiveDate || dayjs().format("MMM D, YYYY")}
                handleChange={handleChange}
                validator={validator}
                restricted={restricted}
              />
              <Stack sx={{ width: "100%" }}></Stack>
            </RowStack>
            {/* Contract Expiry Date - Only show for Contract employment */}
            {inputs.employmentType === "Contract employment" && (
              <RowStack>
                <CustomisedDatePicker
                  label={"Contract expiry date"}
                  name={"contractExpiryDate"}
                  value={inputs.contractExpiryDate || ""}
                  handleChange={handleChange}
                  validator={validator}
                  restricted={restricted}
                  required={false}
                />
                <Stack sx={{ width: "100%" }}></Stack>
              </RowStack>
            )}
          </Stack>
          {/* Job Information container ends here */}

          {createFooter(employee, handleSubmit)}
        </Stack>
      </form>
    </Stack>
  );
}

export default EmployeeForm;

//***Form validation functions begin here***
const isEmpty = (text) => text === null || typeof text === "undefined" || text.toString().trim().length === 0;

const validateName = (fieldName, name) => {
  if (isEmpty(name)) {
    return { valid: false, message: `Please, enter ${fieldName}.` };
  }
  name = name.trim();

  // Updated regex to allow spaces for middle names
  const regex = /^[a-zA-Z\-\'\s]+$/;
  if (!regex.test(name)) {
    return {
      valid: false,
      message: `Invalid character. Only alphabets, spaces, apostrophe and hyphen are allowed.`,
    };
  }

  // Check for multiple consecutive spaces
  if (/\s{2,}/.test(name)) {
    return {
      valid: false,
      message: "Multiple consecutive spaces are not allowed.",
    };
  }

  let hyphenCount = 0;
  let approstropheCount = 0;
  for (let char of name) {
    if (char === "-") {
      hyphenCount++;
      if (hyphenCount > 1) {
        return {
          valid: false,
          message: "Multiple hyphens are not allowed.",
        };
      }
    }
    if (char === "'") {
      approstropheCount++;
      if (approstropheCount > 1) {
        return {
          valid: false,
          message: "Multiple apostrophes are not allowed.",
        };
      }
    }
  }

  if (name.charAt(0) === "-" || name.charAt(name.length - 1) === "-") {
    return {
      valid: false,
      message: `${fieldName} cannot begin or end with -`,
    };
  }

  if (name.length === 1) {
    return {
      valid: false,
      message: `${fieldName} must contain more than one character.`,
    };
  }

  if (name.charCodeAt(0) < 65 || name.charCodeAt(0) > 90) {
    return {
      valid: false,
      message: `${fieldName} must begin with an uppercase.`,
    };
  }

  return {
    valid: true,
    message: "Valid input",
  };
};

const validatePhoneNumber = (num) => {
  if (isEmpty(num)) {
    return {
      valid: false,
      message: "Please enter a phone number",
    };
  }
  num = num.trim();
  const startIndex = num.startsWith("+") ? 1 : 0;
  for (let i = startIndex; i < num.length; i++) {
    if (num.charCodeAt(i) < 48 || num.charCodeAt(i) > 57) {
      return {
        valid: false,
        message: "Invalid phone number. Please enter a valid phone number",
      };
    }
  }
  if (num.substring(startIndex).length < 10) {
    return {
      valid: false,
      message: "Phone number must have at least 10 digits",
    };
  }
  return {
    valid: true,
    message: "valid",
  };
};

const validateNumberInput = (fieldName, value) => {
  if (isEmpty(value)) {
    return {
      valid: false,
      message: `${fieldName} can not be empty`,
    };
  }

  if (isNaN(value)) {
    return {
      valid: false,
      message: `Invalid input. Please enter a valid number`,
    };
  }
  if (Number(value) < 0) {
    return {
      valid: false,
      message: `${fieldName} cannot be less than 0`,
    };
  }
  return {
    valid: true,
    message: value,
  };
};

const validatePostalCode = (postalCode) => {
  if (isEmpty(postalCode)) {
    return {
      valid: false,
      message: "Please enter postal code",
    };
  }
  //The regex matches postal code of the format A1A 2B2 and A1A2B2 (case insensitive)
  const regex = /^[a-zA-Z]\d[a-zA-Z]\s?\d[a-zA-Z]\d/g;
  if (!regex.test(postalCode.trim())) {
    return {
      valid: false,
      message: "In valid postal code. Please enter a valid postal code",
    };
  }
  return {
    valid: true,
    message: "valid",
  };
};

const validateSocialProfile = async (empId, mediumName, profileUrl) => {
  if (isEmpty(profileUrl)) {
    return { valid: true, message: "valid" };
  }
  if (mediumName.toLowerCase() === "facebook") {
    profileUrl = `https://facebook.com/${profileUrl}`;
  } else if (mediumName.toLowerCase() === "twitter") {
    profileUrl = `https://twitter.com/${profileUrl}`;
  } else if (mediumName.toLocaleLowerCase() === "linkedin") {
    profileUrl = `https://linkedin.com/in/${profileUrl}`;
  }
  profileUrl = profileUrl.toLocaleLowerCase();

  const data = {
    empId,
    profileUrl,
  };
  const res = api.socialProfile.fetchOneByUrl(data);

  if (res.exists) {
    return { valid: false, message: "Profile already exists" };
  }
  return { valid: true, message: "valid" };
};

const validateForm = async (employee) => {
  const results = { valid: true };
  let check = validateName("First name", employee.firstName);
  let valid = true;
  if (!check.valid) {
    valid = check.valid;
    results.firstName = check.message;
  }
  check = validateName("Last name", employee.lastName);
  if (!check.valid) {
    valid = check.valid;
    results.lastName = check.message;
  }
  if (isEmpty(employee.gender)) {
    valid = false;
    results.gender = "Please, select gender";
  }

  if (isEmpty(employee.nationality)) {
    valid = false;
    results.nationality = "Please, select nationality";
  }
  if (isEmpty(employee.dateOfBirth)) {
    valid = false;
    results.dateOfBirth = "Please, select birth day";
  } else {
    const dateOfBirth = employee.dateOfBirth;
    const currentDate = dayjs();
    const diff = currentDate.diff(dateOfBirth, "year");
    if (diff < 0) {
      valid = false;
      results.dateOfBirth = "Birth date must be in the past";
    } else if (diff < 15) {
      valid = false;
      results.dateOfBirth = "Employee must be 15 years old or older.";
    }
  }
  if (isEmpty(employee.maritalStatus)) {
    valid = false;
    results.maritalStatus = "Please, select marital status";
  }
  if (isEmpty(employee.email)) {
    valid = false;
    results.email = "Please, enter an email";
  } else if (!validator.isEmail(employee.email)) {
    valid = false;
    results.email = "Invalid email. Please, enter a valid email";
  } else {
    const res = await api.employee.fetchOneByEmail(employee.email);

    if (res && res.empId !== employee.empId) {
      valid = false;
      results.email = "Email already exists";
    }
  }
  check = validatePhoneNumber(employee.phoneNumber);
  if (!check.valid) {
    valid = check.valid;
    results.phoneNumber = check.message;
  }
  if (isEmpty(employee.hireDate)) {
    valid = false;
    results.hireDate = "Please select hire date";
  }
  if (isEmpty(employee.position)) {
    valid = false;
    results.position = "Please, select an academic position";
  }
  check = validateNumberInput("Salary", employee.salary);
  if (!check.valid) {
    valid = check.valid;
    results.salary = check.message;
  }

  if (isEmpty(employee._department)) {
    valid = false;
    results._department = "Please, select a department";
  }
  if (isEmpty(employee.employmentType)) {
    valid = false;
    results.employmentType = "Please, select a employment type";
  }

  // Validate contract expiry date for contract employees (optional field)
  if (employee.employmentType === "Contract employment" && !isEmpty(employee.contractExpiryDate)) {
    const contractExpiryDate = dayjs(employee.contractExpiryDate);
    const hireDate = dayjs(employee.hireDate);
    const currentDate = dayjs();

    if (contractExpiryDate.isBefore(currentDate, "day")) {
      valid = false;
      results.contractExpiryDate = "Contract expiry date cannot be in the past";
    } else if (contractExpiryDate.isBefore(hireDate, "day")) {
      valid = false;
      results.contractExpiryDate = "Contract expiry date cannot be before hire date";
    }
  }
  if (isEmpty(employee.emergencyContactName)) {
    valid = false;
    results.emergencyContactName = "Please, enter emergency contact's name";
  }
  if (isEmpty(employee.emergencyContactRelationship)) {
    valid = false;
    results.emergencyContactRelationship = "Please, enter emergency contact's relationship";
  }
  check = validatePhoneNumber(employee.emergencyContactPhoneNumber);
  if (!check.valid) {
    valid = check.valid;
    results.emergencyContactPhoneNumber = check.message;
  }
  if (isEmpty(employee.streetAddress)) {
    valid = false;
    results.streetAddress = "Please, enter street address";
  }
  if (isEmpty(employee.country)) {
    valid = false;
    results.country = "Please select country";
  }
  if (isEmpty(employee.city)) {
    valid = false;
    results.city = "Please select city";
  }
  if (employee.city === "Others" && isEmpty(employee._city)) {
    valid = false;
    results._city = "Please enter city";
  }
  //postal code validation is done if the select country is Canada
  if (employee.country === "Canada") {
    check = validatePostalCode(employee.postalZipCode);
    if (!check.valid) {
      valid = check.valid;
      results.postalZipCode = check.message;
    }
  }

  //Check Facebook
  check = await validateSocialProfile(employee.empId, "facebook", employee._facebook);
  if (!check.valid) {
    valid = check.valid;
    results._facebook = check.message;
  }
  check = await validateSocialProfile(employee.empId, "twitter", employee._twitter);
  if (!check.valid) {
    valid = check.valid;
    results._twitter = check.message;
  }
  check = await validateSocialProfile(employee.empId, "linkedin", employee._linkedin);
  if (!check.valid) {
    valid = check.valid;
    results._linkedin = check.message;
  }

  results.valid = valid;
  return results;
};
//***Form validation functions end here***
