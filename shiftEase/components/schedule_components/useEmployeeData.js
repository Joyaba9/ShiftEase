import { useState, useEffect, useCallback } from 'react';
import { fetchEmployeesWithRoles, fetchAvailableEmployees, fetchAllEmployeeAvailability } from '../../../backend/api/employeeApi';
import { formatTime, calculateHoursDifference, convertTo24HourFormat } from './scheduleUtils';
import { Animated } from 'react-native';

const useEmployeeData = (businessId, scheduleId, dates, showTemporaryMessage) => { //view, currentDate
  
    const [employees, setEmployees] = useState([]);
    // State to store filtered employees based on selection criteria
    const [filteredEmployees, setFilteredEmployees] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Assignments of shifts and employees to specific cells in the schedule
    const [shiftAssignments, setShiftAssignments] = useState({});
    const [employeeAssignments, setEmployeeAssignments] = useState({});
    const [employeeAvailability, setEmployeeAvailability] = useState([]);
    
    // State to store shift times that are added by the user
    const [shiftTimes, setShiftTimes] = useState([]);

    // Fetch employees along with their roles and initialize additional fields
    const getEmployees = useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        
        // Fetch employees and their availability
        const [data, availability] = await Promise.all([
          fetchEmployeesWithRoles(businessId),
          fetchAllEmployeeAvailability(businessId),
        ]);

        console.log("Fetched employees data:", data);
        console.log("Fetched availability data:", availability);

        const availabilityData = availability.availability || [];

        const updatedEmployees = data.map((employee) => {
          const existingEmployee = employees.find(emp => emp.emp_id === employee.emp_id);
          const employeeAvailability = availabilityData.filter(avail => avail.emp_id === employee.emp_id);
          
          return {
              ...employee,
              pan: existingEmployee?.pan || new Animated.ValueXY(),
              shiftHours: existingEmployee?.shiftHours || 0, // Preserve shiftHours
              availability: employeeAvailability || [],
          };
        });
        
        setEmployees(updatedEmployees); // Set fetched employees
        setFilteredEmployees(updatedEmployees); // Initialize filtered employees

        console.log('Employees with availability:', updatedEmployees);
      } catch (err) {
        setError('Error fetching employees');
      } finally {
        setLoading(false);
      }
    }, [businessId, scheduleId]);

    // Helper function to filter employees by role only (Managers or Employees)
    const filterByRoleOnly = (titleOption, employees) => {
      return employees.filter((emp) => {
          if (titleOption === "Managers") return emp.role_name === "Manager";
          if (titleOption === "Employees") return emp.role_name === "Employee";
          return true;
      });
    };
    
    // Function to filter employees based on selected day, date, and role
    const filterEmployees = useCallback(async (dayIndex, dateToSend, titleOption) => {
      if (dayIndex !== undefined && dateToSend) {
          // Convert day index to corresponding day name
          const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
          const dayName = dayNames[dayIndex];
  
          try {
              // Fetch employees available on the selected day and date
              const result = await fetchAvailableEmployees(businessId, dayName, dateToSend);
              const { employees: availableEmployees } = result;
  
              // Map additional fields (shiftHours, pan) for each available employee
              const employeesWithDetails = availableEmployees.map((employee) => {
                  const existingEmployee = employees.find((emp) => emp.emp_id === employee.emp_id);

                  return {
                      ...employee,
                      shiftHours: existingEmployee ? existingEmployee.shiftHours : 0,
                      pan: employee.pan || new Animated.ValueXY(),

                      // Keep the full availability from the existing employee
                      availability: existingEmployee ? existingEmployee.availability : employee.availability,
                    
                  };
              });
  
              // Filter employees by availability and role
              const filtered = employeesWithDetails.filter((emp) => {
                  if (titleOption === "Managers") return emp.role_name === "Manager";
                  if (titleOption === "Employees") return emp.role_name === "Employee";
                  return true;
              });
  
              setFilteredEmployees(filtered);
          } catch (error) {
              console.error("Error fetching available employees:", error);
              setError("Error filtering employees");
          }
      } else {
          // Only filter by role when no day is selected
          const roleFilteredEmployees = filterByRoleOnly(titleOption, employees);
          console.log("Filtered by Role Only:", roleFilteredEmployees);
          setFilteredEmployees(roleFilteredEmployees);
      }
    }, [employees, businessId]);
  
    // Fetch employees data when the businessId changes
    useEffect(() => {
      if (businessId) getEmployees();
    }, [businessId, getEmployees]);

    // Assign a shift or employee to a specific cell in the schedule
    const assignShiftOrEmployee = (cellId, item, type) => {
      if (type === 'shift') {
        setShiftAssignments((prev) => ({ ...prev, [cellId]: item.time }));
      } else if (type === 'employee') {
        setEmployeeAssignments((prev) => ({ ...prev, [cellId]: item }));
      }
    };

    // Handle drop events for assigning shifts or employees
    const onDrop = (cellId, item, type) => {
      console.log("onDrop called with:", cellId, item, type);
      //console.log("Dates in onDrop:", dates);

      const normalizeTime = (time) => time.slice(0, 5);
  
      if (!dates || !dates.length) {
          console.error("Dates are undefined or empty.");
          return;
      }
  
      // Extract the column index (day) from the cellId
      const colIndex = parseInt(cellId.split('-')[1], 10);
      const assignedDay = dates[colIndex].toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  
      if (type === 'employee') {
        if (!item || !item.availability || !Array.isArray(item.availability)) {
          console.error("Invalid item or availability in onDrop:", item);
          return;
        }

          const employeeAvailability = item.availability.filter(
              (avail) => avail.day_of_week === assignedDay
          );
  
          if (employeeAvailability.length === 0) {
              showTemporaryMessage(
                  `${item.f_name} ${item.l_name} is not available on ${dates[colIndex].toDateString()}`
              );
          } else if (shiftAssignments[cellId]) {
              const [shiftStart, shiftEnd] = shiftAssignments[cellId]
                  .split(' - ')
                  .map((time) => convertTo24HourFormat(time));
  
              // Check if the shift is entirely within the availability range
              const isTimeSlotValid = employeeAvailability.some((avail) => {
                const availabilityStart = normalizeTime(avail.start_time);
                const availabilityEnd = normalizeTime(avail.end_time);
            
                return shiftStart >= availabilityStart && shiftEnd <= availabilityEnd;
              });
  
              if (!isTimeSlotValid) {
                  showTemporaryMessage(
                      `${item.f_name} ${item.l_name} is not available during ${shiftAssignments[cellId]}`
                  );
              }
          }
  
          assignShiftOrEmployee(cellId, item, type);
  
          if (shiftAssignments[cellId]) {
              const [start, end] = shiftAssignments[cellId]
                  .split(' - ')
                  .map((time) => convertTo24HourFormat(time));
              const hours = calculateHoursDifference(start, end);
              setEmployees((prev) =>
                  prev.map((emp) =>
                      emp.emp_id === item.emp_id
                          ? { ...emp, shiftHours: (emp.shiftHours || 0) + hours }
                          : emp
                  )
              );
          }
      } else if (type === 'shift') {
          const assignedEmployee = employeeAssignments[cellId];
          if (assignedEmployee) {
              const employeeAvailability = assignedEmployee.availability.filter(
                  (avail) => avail.day_of_week === assignedDay
              );
  
              if (employeeAvailability.length === 0) {
                  showTemporaryMessage(
                      `${assignedEmployee.f_name} ${assignedEmployee.l_name} is not available on ${dates[colIndex].toDateString()}`
                  );
              }
  
              const [shiftStart, shiftEnd] = item.time
                  .split(' - ')
                  .map((time) => convertTo24HourFormat(time));
  
              const isTimeSlotValid = employeeAvailability.some((avail) => {
                const availabilityStart = normalizeTime(avail.start_time);
                const availabilityEnd = normalizeTime(avail.end_time);
            
                return shiftStart >= availabilityStart && shiftEnd <= availabilityEnd;
              });
              console.log('Is time slot valid:', isTimeSlotValid);
            
              if (!isTimeSlotValid) {
                const availabilityTimes = employeeAvailability.map((avail) => {
                    const availabilityStart = formatTime(avail.start_time);
                    const availabilityEnd = formatTime(avail.end_time);
                    return `${availabilityStart} - ${availabilityEnd}`;
                }).join(', '); // Join multiple availability periods if they exist
            
                showTemporaryMessage(
                    `${assignedEmployee.f_name} ${assignedEmployee.l_name} is not available during ${item.time}. ` +
                    `They are available during: ${availabilityTimes}`
                );
              }
          }
  
          assignShiftOrEmployee(cellId, item, type);
  
          if (assignedEmployee) {
              const [start, end] = item.time
                  .split(' - ')
                  .map((time) => convertTo24HourFormat(time));
              const hours = calculateHoursDifference(start, end);
              setEmployees((prev) =>
                  prev.map((emp) =>
                      emp.emp_id === assignedEmployee.emp_id
                          ? { ...emp, shiftHours: (emp.shiftHours || 0) + hours }
                          : emp
                  )
              );
          }
      }
    };

    // Remove shift or employee assignment from a specific cell
    const removeAssignment = (cellId, type) => {
      if (type === 'employee') {
        setEmployeeAssignments((prev) => {
          const newAssignments = { ...prev };
          delete newAssignments[cellId];
          return newAssignments;
        });
      } else if (type === 'shift') {
        setShiftAssignments((prev) => {
          const newAssignments = { ...prev };
          delete newAssignments[cellId];
          return newAssignments;
        });
      }
    };

    // Handle removal of assignment and adjust shift hours accordingly
    const onRemove = (cellId, type) => {
      removeAssignment(cellId, type);
    
      // Adjust shift hours accordingly
      if (type === 'employee' && shiftAssignments[cellId]) {
        const [start, end] = shiftAssignments[cellId].split(' - ');
        const hours = calculateHoursDifference(start, end);
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.emp_id === employeeAssignments[cellId].emp_id
              ? { ...emp, shiftHours: Math.max(0, emp.shiftHours - hours) }
              : emp
          )
        );
      } else if (type === 'shift' && employeeAssignments[cellId]) {
        const [start, end] = shiftAssignments[cellId].split(' - ');
        const hours = calculateHoursDifference(start, end);
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.emp_id === employeeAssignments[cellId].emp_id
              ? { ...emp, shiftHours: Math.max(0, emp.shiftHours - hours) }
              : emp
          )
        );
      }
    };

    return { 
      employees, 
      filteredEmployees, 
      loading, 
      error, 
      shiftAssignments,
      employeeAssignments,
      shiftTimes,
      getEmployees, 
      setEmployees,
      filterEmployees,
      assignShiftOrEmployee,
      removeAssignment,
      onDrop,         
      onRemove,
      setShiftTimes,
      setEmployeeAssignments,
      setShiftAssignments
    };
  };
  
export default useEmployeeData;