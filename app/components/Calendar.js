'use client';
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Box, Button, Input, Flex, IconButton, Select } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import Holidays from 'date-holidays';
import { all } from 'axios';

function Calendar() {
  const [events, setEvents] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [newEventName, setNewEventName] = useState('');
  const [newEventEmail, setNewEventEmail] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [eventType, setEventType] = useState('');
  const [showInputs, setShowInputs] = useState(false);
  
    useEffect(() => {
      const fetchEvents = async () => {
        try {
          const response = await fetch('http://localhost:3000/api/get-bookings');
          const data = await response.json();
          console.log('Fetched events:', data.bookings); // Log fetched events
        if (Array.isArray(data.bookings)) {
          setEvents(data.bookings.map(booking => ({
            title: booking.name,
            start: booking.start_date,
            end: booking.end_date,
            description: booking.description,
            color: 'green',
            allDay: true,
          })));
        } else {
          console.error('Invalid data format:', data);
        }
        } catch (error) {
          console.error('Error fetching events:', error);
        }
      };
  
      const fetchHolidays = () => {
        const hd = new Holidays('CA');
        const holidays = hd.getHolidays(new Date().getFullYear());
        const holidayEvents = holidays.map((holiday) => ({
          id: holiday.date,
          title: holiday.name,
          start: holiday.date,
          allDay: true,
          color: 'purple',
        }));
        setHolidays(holidayEvents);
      };
  
      fetchEvents();
      fetchHolidays();
    }, []);
    const addNewEvent = () => {
      const newEvent = {
        title: newEventName,
        start: startDate,
        end: endDate,
        color: 'green',
      };
      setEvents([...events, newEvent]);
      const apiUrl = `http://localhost:3000/api/add-booking?name=${encodeURIComponent(newEventName)}&email=${encodeURIComponent(newEventEmail)}&description=${encodeURIComponent(eventType)}&start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`;
      fetch(apiUrl, {
        method: 'GET',
      })
      .then(response => response.json())
      .then(data => {
        console.log('Booking added:', data);
        // Optionally handle the response, e.g., show a success message
      })
      .catch(error => {
        console.error('Error adding booking:', error);
        // Optionally handle the error, e.g., show an error message
      });
    };
  return (
    <Box width="100%" padding={4}>
        <>  
        <Flex mb={4} alignItems="center">
            <IconButton
              icon={<AddIcon />}
              aria-label="Add event"
              onClick={() => setShowInputs(!showInputs)}
              borderRadius="50%"
              size="lg"
              colorScheme="teal"
              mr={2}
            />
            {showInputs && (
              <>
                <Input
                  value={newEventName}
                  onChange={(e) => setNewEventName(e.target.value)}
                  placeholder="Name"
                  width="200px"
                  mr={2}
                />
                <Input
                  value={newEventEmail}
                  onChange={(e) => setNewEventEmail(e.target.value)}
                  placeholder="Email"
                  width="200px"
                  mr={2}
                />
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="Start date"
                  width="150px"
                  mr={2}
                />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="End date"
                  width="150px"
                  mr={2}
                />
                <Button onClick={addNewEvent} colorScheme="teal">
                  Add Event
                </Button>
              </>
            )}
          </Flex>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin]}
            initialView="dayGridMonth"
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            events={[...events, ...holidays]}
          />
        </>
      
    </Box>
  );
};

export default Calendar;