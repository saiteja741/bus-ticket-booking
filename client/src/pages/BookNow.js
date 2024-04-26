import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Row, Col, message, Spin, Button } from 'antd';
import SeatSelection from '../components/SeatSelection';
import { axiosInstance } from '../helpers/axiosinstance';
import './home.css';

function BookNow() {
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [bus, setBus] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [bookingDetails, setBookingDetails] = useState(null); // State to hold the booking details
    const params = useParams();

    useEffect(() => {
        const getBus = async () => {
            try {
                const response = await axiosInstance.post("/api/buses/bus-by-id", {
                    _id: params.id,
                });
                if (response.data.success) {
                    setBus(response.data.data);
                } else {
                    message.error(response.data.message);
                }
            } catch (error) {
                message.error('Error fetching bus details: ' + error.message);
            }
        };
        getBus();
    }, [params.id]);

    const bookNow = async () => {
        if (selectedSeats.length === 0) {
            message.error("Please select at least one seat.");
            return;
        }
    
        setIsProcessing(true);
        setTimeout(async () => {
            try {
                const transactionId = `FAKE-${Date.now()}`;
                const response = await axiosInstance.post("/api/bookings/book-seat", {
                    bus: bus._id,
                    seats: selectedSeats,
                    transactionId: transactionId
                });
    
                setIsProcessing(false);
                if (response.data.success) {
                    setBookingSuccess(true);
                    setBookingDetails({
                        busName: bus.name,
                        from: bus.from,
                        to: bus.to,
                        journeyDate: bus.journeyDate,
                        departureTime: bus.departure,
                        arrivalTime: bus.arrival,
                        farePerSeat: bus.fare,
                        totalFare: bus.fare * selectedSeats.length,
                        selectedSeats: selectedSeats.join(", "),
                        transactionId: transactionId
                    });
                    message.success("Seats successfully booked!");
                } else {
                    message.error("Failed to book seats: " + response.data.message);
                }
            } catch (error) {
                setIsProcessing(false);
                message.error("Error during booking: " + error.message);
            }
        }, 2000);
    };

    if (!bus) {
        return <Spin size="large" tip="Loading Bus Information..."/>;
    }

    return (
        <div>
            <Row gutter={20} className="mt-3">
                <Col lg={12} xs={24} sm={24}>
                    <div>
                        <h1>{bus.name} - {bus.from} to {bus.to}</h1>
                        <p>Journey Date: {bus.journeyDate}</p>
                        <p>Fare per seat: ₹{bus.fare}</p>
                        <p>Total Price: ₹{bus.fare * selectedSeats.length}</p>
                        {isProcessing ? (
                            <Spin size="large" tip="Processing Payment...">
                                <Button className="btn btn-primary" disabled>
                                    Confirm Payment and Book Seats
                                </Button>
                            </Spin>
                        ) : (
                            <Button onClick={bookNow} className={`btn btn-primary ${selectedSeats.length === 0 ? "disabled-btn" : ""}`} disabled={selectedSeats.length === 0}>
                                Confirm Payment and Book Seats
                            </Button>
                        )}
                        {bookingSuccess && bookingDetails && (
                            <div className="success-message">
                                <h2>Booking Details</h2>
                                <p>Transaction ID: {bookingDetails.transactionId}</p>
                                <p>Route: {bookingDetails.from} to {bookingDetails.to}</p>
                                <p>Departure: {bookingDetails.departureTime}</p>
                                <p>Arrival: {bookingDetails.arrivalTime}</p>
                                <p>Journey Date: {bookingDetails.journeyDate}</p>
                                <p>Seats Booked: {bookingDetails.selectedSeats}</p>
                                <p>Total Fare Paid: ₹{bookingDetails.totalFare}</p>
                            </div>
                        )}
                    </div>
                </Col>
                <Col lg={12} xs={24} sm={24}>
                    <SeatSelection selectedSeats={selectedSeats} setSelectedSeats={setSelectedSeats} bus={bus} />
                </Col>
            </Row>
        </div>
    );
}

export default BookNow;
