import { useState, useEffect, useCallback } from 'react';
import { fetchEmployeesWithRoles, fetchAvailableEmployees } from '../../../backend/api/employeeApi';
import { calculateHoursDifference } from './scheduleUtils';
import { Animated } from 'react-native';

const useEmployeeData = (businessId, scheduleId) => {
    const [employees, setEmployees] = useState([]);
    // State to store filtered employees based on selection criteria
    const [filteredEmployees, setFilteredEmployees] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Assignments of shifts and employees to specific cells in the schedule
    const [shiftAssignments, setShiftAssignments] = useState({});
    const [employeeAssignments, setEmployeeAssignments] = useState({});
    
    // State to store shift times that are added by the user
    const [shiftTimes, setShiftTimes] = useState([]);

    // Fetch employees along with their roles and initialize additional fields
    const getEmployees = useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch employees and add properties for animations and shift hours
        const data = await fetchEmployeesWithRoles(businessId);

        // If scheduleId exists, load shift hours from storage; otherwise, initialize to 0
        const savedHours = scheduleId 
        ? JSON.parse(localStorage.getItem(`employeeShiftHours_${businessId}_${scheduleId}`) || "{}")
        : {};

        const employeesWithPan = data.map((employee) => ({
          ...employee,
          pan: new Animated.ValueXY(), // Add animated pan position
          shiftHours: savedHours[employee.emp_id] || 0, // Initialize shift hours for each employee
        }));
        
        setEmployees(employeesWithPan); // Set fetched employees
        setFilteredEmployees(employeesWithPan); // Initialize filtered employees
      } catch (err) {
        setError('Error fetching employees');
      } finally {
        setLoading(false);
      }
    }, [businessId, scheduleId]);

    // Save shift hours only if scheduleId is defined
    useEffect(() => {
      if (!scheduleId) return;

      const employeeHours = employees.reduce((acc, emp) => {
          acc[emp.emp_id] = emp.shiftHours;
          return acc;
      }, {});

      localStorage.setItem(`employeeShiftHours_${businessId}_${scheduleId}`, JSON.stringify(employeeHours));
      console.log(`Saved employeeShiftHours for schedule ${scheduleId} to storage:`, employeeHours);
    }, [employees, businessId, scheduleId]);

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
    
      // Assign shift or employee based on type
      assignShiftOrEmployee(cellId, item, type);
    
      // Calculate shift hours if employee is assigned to a shift
      if (type === 'shift' && employeeAssignments[cellId]) {
        const [start, end] = item.time.split(' - ');
        const hours = calculateHoursDifference(start, end);
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.emp_id === employeeAssignments[cellId].emp_id
              ? { ...emp, shiftHours: emp.shiftHours + hours }
              : emp
          )
        );
      } else if (type === 'employee' && shiftAssignments[cellId]) {
        const [start, end] = shiftAssignments[cellId].split(' - ');
        const hours = calculateHoursDifference(start, end);
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.emp_id === item.emp_id
              ? { ...emp, shiftHours: emp.shiftHours + hours }
              : emp
          )
        );
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