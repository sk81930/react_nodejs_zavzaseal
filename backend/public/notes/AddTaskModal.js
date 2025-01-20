import React, { Fragment, useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { AsyncPaginate } from "react-select-async-paginate";
import Select, { components } from "react-select";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import agent from "../../../agent";

import "bootstrap/dist/css/bootstrap.min.css";
import "./AddTaskModal.scss";

const AddTaskModal = ({ isOpen, onClose, onAddEvent, dealsData, crewMembers, addTaskError, addTaskSuccess, clearFlash }) => {
  const [step, setStep] = useState(1);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedSearchOption, setSelectedSearchOption] = useState(null);
  const [selectedCrewMembers, setSelectedCrewMembers] = useState([]);
  const [products, setProducts] = useState([{ id: Date.now(), name: "", price: "" }]);
  const [taskTitle, setTaskTitle] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [crewOptions, setCrewOptions] = useState(null);
  const [selectedColor, setSelectedColor] = useState("#5bc0de");

  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [errors, setErrors] = useState({
    startDate: false,
    endDate: false,
    products: false,
    taskTitle: false,
    crewMembersError: false,
    endDateBeforeStartError: false,
  });

  const CheckboxOption = (props) => {
    return (
      <components.Option {...props}>
        <input type="checkbox" checked={props.isSelected} onChange={() => null} />
        <label style={{ marginLeft: "8px" }}>{props.label}</label>
      </components.Option>
    );
  };

  const handleLoadOptions = async (inputValue, loadedOptions, { page }) => {
    const limit = 100;
    try {
      const deals = await agent.Auth.getDeals(inputValue, page, limit);

      if (
        deals &&
        deals.data &&
        deals.data.dealsData &&
        deals.data.dealsData.deals &&
        deals.data.dealsData.pagination
      ) {
        const { deals: dealItems, pagination } = deals.data.dealsData;

        return {
          options: dealItems.map((deal) => ({
            value: deal.id,
            label: deal.title,
          })),
          hasMore: pagination.totalCount > loadedOptions.length + dealItems.length,
          additional: {
            page: page + 1,
          },
        };
      }

      return {
        options: [],
        hasMore: false,
        additional: {
          page: page,
        },
      };
    } catch (error) {
      console.error("Error fetching deals:", error);

      return {
        options: [],
        hasMore: false,
        additional: {
          page: page,
        },
      };
    }
  };

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedOption(null);
      setSelectedSearchOption(null);
      setSelectedCrewMembers([]);
      setProducts([{ id: Date.now(), name: "", price: "" }]);
      setTaskTitle("");
      setStartDate(null);
      setStartTime(null);
      setEndDate(null);
      setEndTime(null);
      setSelectedColor("#5bc0de");
      setErrors({
        startDate: false,
        endDate: false,
        taskTitle: false,
        crewMembersError: false,
        endDateBeforeStartError: false,
      });
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen]);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleAddProduct = () => {
    const newProduct = { id: Date.now(), name: "", price: "" };
    setProducts([...products, newProduct]);
  };

  const handleRemoveProduct = (id) => {
    setProducts((prevProducts) => prevProducts.filter((product) => product.id !== id));
  };

  const handleInputChange = (id, field, value) => {
    const updatedProducts = products.map((product) =>
      product.id === id ? { ...product, [field]: value } : product
    );
    setProducts(updatedProducts);
  };

  const handleColorChange = (e) => {
    setSelectedColor(e.target.value);
  };

  const handleAddTask = () => {

    clearFlash();
    setErrorMsg(null);
    setSuccessMsg(null);
    // Reset errors
    setErrors({
      startDate: false,
      endDate: false,
      products: false,
    });

    // Validation
    let formIsValid = true;


    var task_title = null;
    var deal_id = null;


    if(selectedSearchOption && selectedSearchOption.value){

        deal_id = selectedSearchOption.value; 
        task_title = selectedSearchOption.label; 

    }

    if (!deal_id || !task_title) {
      setErrors((prevErrors) => ({ ...prevErrors, taskTitle: true }));
      formIsValid = false;
    }
    

    if (!startDate || !startTime) {
      setErrors((prevErrors) => ({ ...prevErrors, startDate: true }));
      formIsValid = false;
    }

    if (!endDate || !endTime) {
      setErrors((prevErrors) => ({ ...prevErrors, endDate: true }));
      formIsValid = false;
    }

    if(!selectedCrewMembers || selectedCrewMembers.length <= 0){
      setErrors((prevErrors) => ({ ...prevErrors, crewMembersError: true }));
      formIsValid = false;
    }

    if (endDate && startDate && endDate.isBefore(startDate, 'day')) {

      setErrors((prevErrors) => ({ ...prevErrors, endDateBeforeStartError: true }));

      formIsValid = false;

    } else if (endDate && startDate && endDate.isSame(startDate, 'day') && endTime && startTime && endTime.isBefore(startTime, 'minute')) {

      setErrors((prevErrors) => ({ ...prevErrors, endDateBeforeStartError: true }));

      formIsValid = false;

    }

    // if (products.some((product) => !product.name || !product.price)) {
    //   setErrors((prevErrors) => ({ ...prevErrors, products: true }));
    //   formIsValid = false;
    // }

    if (!formIsValid) {
      return; // Don't submit if form is invalid
    }
    
    const start_datetime = new Date(startDate.format("YYYY-MM-DD") + "T" + startTime.format("HH:mm:ss")).toISOString();
    const end_datetime = new Date(endDate.format("YYYY-MM-DD") + "T" + endTime.format("HH:mm:ss")).toISOString();
    

    // Gather form data and submit if valid
    const taskData = {
      title: task_title,
      deal_id: deal_id,
      start: start_datetime,
      end: end_datetime,
      color: selectedColor,
      products,
      crewMembers: selectedCrewMembers.map((member) => member.value),
    };

    onAddEvent(taskData);
    
  };

  useEffect(() => {
    if (crewMembers) {
      const rows = crewMembers.map((item) => ({
        value: item.id,
        label: `${item.first_name} ${item.last_name}`,
      }));
      setCrewOptions(rows);
    }
  }, [crewMembers]);

  useEffect(() => {
    if (addTaskError) {
      setErrorMsg(addTaskError);
      clearFlash();
    }
  }, [addTaskError]);

  useEffect(() => {
    if (addTaskSuccess) {
      setSuccessMsg(addTaskSuccess);
      clearFlash();
      setTimeout(function(){

        onClose();

      },2000)
    }
  }, [addTaskSuccess]);


  const disableEndDate = startDate ? (date) => date.isBefore(startDate, 'day') : () => false;

  // Disable end time selection before start time, if the end date is the same as the start date

  const disableEndTime = endDate && startDate && endDate.isSame(startDate, 'day')

    ? (time) => time.isBefore(startTime, 'minute')

    : () => false;

   const todayDate = dayjs().startOf('day').format('YYYY-MM-DD');

  return (
    <Fragment>
      <Modal show={isOpen} onHide={onClose} centered backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Add a Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>

          {/* Error Message Banner */}
          {errorMsg ? 
              <div className="alert alert-danger" role="alert">{errorMsg}</div>
          : <Fragment /> }
          {successMsg ? 
            <div className="alert alert-success" role="alert">{successMsg}</div>
          : <Fragment /> }

          {(errors.startDate || errors.endDate || errors.taskTitle || errors.crewMembersError || errors.endDateBeforeStartError) && (
            <div className="alert alert-danger">
              Please fix the following errors:
              {errors.taskTitle && <div>Choose Project field required</div>}
              {errors.startDate && <div>Start Date and Time are required</div>}
              {errors.endDate && <div>End Date and Time are required</div>}
              {errors.crewMembersError && <div>Please select at least 1 crew member</div>}
              {errors.endDateBeforeStartError && <div>End Date and Time must be after Start Date and Time</div>}
            </div>
          )}

          {step === 1 && (
            <div className="modal-step">
              <div className="button-group d-flex justify-content-between mt-3">
                <Button
                  variant="outline-primary"
                  className={`option-btn ${selectedOption === "new" ? "active" : ""}`}
                  onClick={() => handleOptionSelect("new")}
                >
                  Set a New Task
                </Button>
                <Button
                  variant="outline-primary"
                  className={`option-btn ${selectedOption === "project" ? "active" : ""}`}
                  onClick={() => handleOptionSelect("project")}
                >
                  Choose From Project
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="modal-step">
              <Form.Group controlId="search">
                <Form.Label>Choose from project</Form.Label>
                <AsyncPaginate
                  value={selectedSearchOption}
                  onChange={setSelectedSearchOption}
                  loadOptions={handleLoadOptions}
                  additional={{
                    page: 0,
                  }}
                  placeholder="Search for a task..."
                />
              </Form.Group>

              {/* Start Date and Time */}
              <div className="date-time-group">
                <Form.Group controlId="startDate">
                  <Form.Label>Start Date</Form.Label>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      value={startDate}
                      onChange={(newDate) => setStartDate(newDate)}
                      format="DD/MM/YYYY"
                      minDate={dayjs(todayDate)}
                    />
                  </LocalizationProvider>
                </Form.Group>
                <Form.Group controlId="startTime">
                  <Form.Label>Start Time</Form.Label>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TimePicker
                      value={startTime}
                      onChange={(newTime) => setStartTime(newTime)}
                    />
                  </LocalizationProvider>
                </Form.Group>
              </div>

              {/* End Date and Time */}
              <div className="date-time-group">
                <Form.Group controlId="endDate">
                  <Form.Label>End Date</Form.Label>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      value={endDate}
                      onChange={(newDate) => setEndDate(newDate)}
                      shouldDisableDate={disableEndDate}
                      format="DD/MM/YYYY"
                      minDate={dayjs(todayDate)}
                    />
                  </LocalizationProvider>
                </Form.Group>
                <Form.Group controlId="endTime">
                  <Form.Label>End Time</Form.Label>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TimePicker
                      value={endTime}
                      onChange={(newTime) => setEndTime(newTime)}
                      shouldDisableTime={disableEndTime}
                    />
                  </LocalizationProvider>
                </Form.Group>
              </div>

              {/* Assign Crew */}
              <Form.Group controlId="assignCrew">
                <Form.Label>Assign Crew Members</Form.Label>
                <Select
                  options={crewOptions}
                  isMulti
                  closeMenuOnSelect={false}
                  hideSelectedOptions={false}
                  components={{ Option: CheckboxOption }}
                  onChange={(selected) => setSelectedCrewMembers(selected || [])}
                  value={selectedCrewMembers}
                  placeholder="Select crew members..."
                />
              </Form.Group>

              <Form.Group controlId="chooseColor">
                <Form.Label>Choose Color</Form.Label>
                <Form.Control
                  type="color"
                  value={selectedColor}
                  onChange={handleColorChange}
                />
              </Form.Group>

              {/* Products Section */}
              <Form.Group controlId="products">
                <Form.Label>Products</Form.Label>
                {products.map((product, index) => (
                  <div key={product.id} className="d-flex align-items-center mb-2">
                    <Form.Control
                      type="text"
                      placeholder="Product Name"
                      value={product.name}
                      onChange={(e) => handleInputChange(product.id, "name", e.target.value)}
                      className="me-2"
                    />
                    <Form.Control
                      type="number"
                      placeholder="Price"
                      value={product.price}
                      onChange={(e) => handleInputChange(product.id, "price", e.target.value)}
                      className="me-2"
                    />
                    {products.length > 1 && (
                      <Button
                        variant="danger"
                        onClick={() => handleRemoveProduct(product.id)}
                        style={{ height: "38px" }}
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                ))}
                {errors.products && <div className="text-danger">All products must have a name and price</div>}
                <Button
                  variant="light"
                  onClick={handleAddProduct}
                  className="w-100"
                  style={{ border: "1px solid #ccc", fontWeight: "bold" }}
                >
                  Add More Products +
                </Button>
              </Form.Group>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          {step === 1 && (
            <Fragment>
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
              <Button
                variant="primary"
                disabled={!selectedOption}
                onClick={() => setStep(2)}
              >
                Next
              </Button>
            </Fragment>
          )}
          {step === 2 && (
            <Fragment>
              <Button variant="secondary" onClick={() => setStep(1)}>
                Prev
              </Button>
              <Button
                variant="primary"
                onClick={handleAddTask}
              >
                Save
              </Button>
            </Fragment>
          )}
        </Modal.Footer>
      </Modal>
    </Fragment>
  );
};

export default AddTaskModal;
