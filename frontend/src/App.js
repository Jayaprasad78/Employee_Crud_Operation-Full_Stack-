import 'antd/dist/antd.css';
import './App.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table, Modal, Input, DatePicker, Radio, message, Tooltip, Row, Col } from 'antd';
import { DeleteOutlined, EditFilled, SearchOutlined } from '@ant-design/icons';

function App() {
  const [isEditing, setIsEditing] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDataSource, setFilteredDataSource] = useState([]);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    address: '',
    dateOfJoin: null,
    bloodGroup: '',
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

 useEffect(() => {
  if (searchTerm) {
    setFilteredDataSource(
      dataSource.filter((employee) =>
        Object.values(employee).some((value) =>
          typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    );
  } else {
    setFilteredDataSource(dataSource);
  }
}, [searchTerm, dataSource]);


  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/api/employees');
      setDataSource(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleSaveEmployee = async () => {
    if (newEmployee._id) {
      try {
        await axios.put(`/api/employees/${newEmployee._id}`, newEmployee);
        fetchEmployees(); // Refresh employees after updating
      } catch (error) {
        console.error('Error updating employee:', error);
      }
    } else {
      try {
        // Check if email already exists
        const checkEmailResponse = await axios.post('/api/employees/check-email', { email: newEmployee.email });
        if (checkEmailResponse.status === 200) {
          const employeeToAdd = { ...newEmployee };
          delete employeeToAdd._id; // Ensure _id is not set when adding a new employee
          await axios.post('/api/employees', employeeToAdd);
          fetchEmployees(); // Refresh employees after adding
        }
      } catch (error) {
        if (error.response && error.response.status === 409) {
          message.error('Error adding employee: Email already exists');
        } else {
          console.error('Error adding employee:', error);
        }
      }
    }
    setIsEditing(false);
    resetNewEmployee();
  };

  const handleDeleteEmployee = (id) => {
    Modal.confirm({
      title: 'Confirm Deletion',
      content: 'Are you sure you want to delete this employee?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        // Proceed with deletion
        deleteEmployee(id);
      },
    });
  };
  
  const deleteEmployee = async (id) => {
    try {
      await axios.delete(`/api/employees/${id}`);
      fetchEmployees(); // Refresh employees after deleting
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  const onEditEmployee = (record) => {
    setIsEditing(true);
    setNewEmployee(record);
  };

  const handleCancel = () => {
    setIsEditing(false);
    resetNewEmployee();
  };

  const resetNewEmployee = () => {
    setNewEmployee({
      name: '',
      email: '',
      address: '',
      dateOfJoin: null,
      bloodGroup: '',
    });
  };

  const columns = [
    {
      title: 'Employee ID',
      dataIndex: 'employeeId',
      key: 'employeeId',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Date of Join',
      dataIndex: 'dateOfJoin',
      key: 'dateOfJoin',
    },
    {
      title: 'Blood Group',
      dataIndex: 'bloodGroup',
      key: 'bloodGroup',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="action-buttons">
          <Tooltip title="Edit">
            <Button
              icon={<EditFilled />}
              onClick={() => onEditEmployee(record)}
              style={{ color: '#1890ff' }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteEmployee(record._id)}
              style={{ color: '#ff4d4f' }}
            />
          </Tooltip>
        </div>
      ),
    },
  ];
  
  
  return (
    <div className="App">
      <header className="App-header">
        <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
          <Col>
            <h1>Manage Employees</h1>
          </Col>
          <Col>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: 300, marginRight: 20 }}
            />
            <Button type="primary" onClick={() => setIsEditing(true)}>
              Add a new employee
            </Button>
          </Col>
        </Row>
        <Table
          dataSource={filteredDataSource}
          columns={columns}
          pagination={{ pageSize: 4 }}
          rowKey="_id"
        />
        <Modal
          title={newEmployee._id ? 'Edit Employee' : 'Add Employee'}
          visible={isEditing}
          onOk={handleSaveEmployee}
          onCancel={handleCancel}
        >
          <Input
            value={newEmployee.name}
            placeholder="Name"
            onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
            style={{ marginBottom: 10 }}
          />
          <Input
            value={newEmployee.email}
            placeholder="Email"
            onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
            style={{ marginBottom: 10 }}
          />
          <Input
            value={newEmployee.address}
            placeholder="Address"
            onChange={(e) => setNewEmployee({ ...newEmployee, address: e.target.value })}
            style={{ marginBottom: 10 }}
          />
          <DatePicker
            style={{ marginBottom: 10, width: '100%' }}
            placeholder="Date of Join"
            onChange={(date) => setNewEmployee({ ...newEmployee, dateOfJoin: date })}
          />
          <Radio.Group
            style={{ marginBottom: 10, display: 'block' }}
            value={newEmployee.bloodGroup}
            onChange={(e) => setNewEmployee({ ...newEmployee, bloodGroup: e.target.value })}
          >
            <Radio value="A">A</Radio>
            <Radio value="B">B</Radio>
            <Radio value="AB">AB</Radio>
            <Radio value="O">O</Radio>
          </Radio.Group>
        </Modal>
      </header>
    </div>
  );
}

export default App;
