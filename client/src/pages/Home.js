import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Row, Col, Input, DatePicker, message } from 'antd';
import moment from 'moment'; // If date manipulation is needed later
import { RightOutlined } from '@ant-design/icons';
import Bus from '../components/Bus';
import { axiosInstance } from '../helpers/axiosinstance';
import './home.css';

function Home() {
  const { user } = useSelector(state => state.users);
  const [buses, setBuses] = useState([]);
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [searchDate, setSearchDate] = useState(null);

  useEffect(() => {
    const getBuses = async () => {
      try {
        const response = await axiosInstance.post("/api/buses/get-all-buses", {});
        if (response.data.success) {
          setBuses(response.data.data);
        } else {
          message.error(response.data.message);
        }
      } catch (error) {
        message.error(error.message);
      }
    };
    getBuses();
  }, []);

  const handleSearchFromChange = (e) => {
    setSearchFrom(e.target.value.toLowerCase());
  };

  const handleSearchToChange = (e) => {
    setSearchTo(e.target.value.toLowerCase());
  };

  const handleDateChange = (date, dateString) => {
    setSearchDate(dateString);
  };

  const filteredBuses = buses.filter(bus =>
    bus.from.toLowerCase().includes(searchFrom) &&
    bus.to.toLowerCase().includes(searchTo) &&
    (!searchDate || bus.journeyDate === searchDate)
  );

  return (
    <div>
      <div className="search-box-container">
        <Input
          className="search-box"
          placeholder="From"
          value={searchFrom}
          onChange={handleSearchFromChange}
        />
        <RightOutlined className="search-arrow" />
        <Input
          className="search-box"
          placeholder="To"
          value={searchTo}
          onChange={handleSearchToChange}
        />
        <DatePicker
          className="date-picker"
          onChange={handleDateChange}
          format="YYYY-MM-DD"
          placeholder="Select date"
        />
      </div>
      <Row>
        {filteredBuses.map(bus => (
          <Col key={bus.id} lg={12} xs={24} sm={24}>
            <Bus bus={bus} />
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default Home;
