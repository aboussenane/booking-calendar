'use client';
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Stack, Box, Button, Input, Flex, IconButton, Select,useMediaQuery, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure, Text, Center } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import Holidays from 'date-holidays';
import { all } from 'axios';
import { add, format, isBefore } from 'date-fns';
import interactionPlugin from '@fullcalendar/interaction';


function Calendar() {
  const [events, setEvents] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [newEventName, setNewEventName] = useState('');
  const [newEventEmail, setNewEventEmail] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [eventType, setEventType] = useState('');
  const [showInputs, setShowInputs] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [conflictMessage, setConflictMessage] = useState('');
  const [isMobile] = useMediaQuery("(max-width: 768px)");
  // useEffect(() => {
  //   const handleResize = () => {
  //     setIsMobile(window.innerWidth < 768);
  //   };

  //   // Set initial value
  //   handleResize();

  //   // Add event listener
  //   window.addEventListener('resize', handleResize);

  //   // Remove event listener on cleanup
  //   return () => {
  //     window.removeEventListener('resize', handleResize);
  //   };
  // }, []);
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
            allDay: false,
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
    const checkForConflicts = async (startDateTime, endDateTime) => {
      const apiUrl = `http://localhost:3000/api/check-conflict?start_date=${encodeURIComponent(format(startDateTime, 'yyyy-MM-dd HH:mm:ss'))}&end_date=${encodeURIComponent(format(endDateTime, 'yyyy-MM-dd HH:mm:ss'))}`;
      console.log('Checking for conflicts with start date:', format(startDateTime, 'yyyy-MM-dd\'T\'HH:mm:ss.SSSX'), 'and end date:', format(endDateTime, 'yyyy-MM-dd\'T\'HH:mm:ss.SSSX'));
      try {
        const response = await fetch(apiUrl, {
          method: 'GET',
        });
        const data = await response.json();
        
        if (data.conflicts && data.conflicts.length > 0) {
          console.log('Conflicts found:', data.conflicts);
          return true; // Conflicts exist
        }
        
        return false; // No conflicts
      } catch (error) {
        console.error('Error checking for conflicts:', error);
        return false; // Assume no conflicts in case of error
      }
    };
    const addNewEvent = async () => {
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const durationMinutes = parseInt(duration, 10);
      const endDateTime = add(startDateTime, { minutes: durationMinutes });
      console.log('New event:', newEventName, newEventEmail, startDateTime, endDateTime, eventType);
      
      if (isBefore(startDateTime, new Date())) {
        setConflictMessage('The start date and time must be in the future.');
        console.log('Start date is in the past');
        return;
      }
      const hasConflicts = await checkForConflicts(startDateTime, endDateTime);
      if (hasConflicts) {
        setConflictMessage('This booking conflicts with an existing booking.');
        console.log('Conflict detected');
        return;
      }
      const newEvent = {
        title: newEventName ,
        email: newEventEmail,
        start: startDateTime,
        end: endDateTime,
        description: eventType,
        color: eventType === 'interview' ? 'green' : 'red',
      };
      setEvents([...events, newEvent]);
      const apiUrl = `http://localhost:3000/api/add-booking?name=${encodeURIComponent(newEventName)}&email=${encodeURIComponent(newEventEmail)}&description=${encodeURIComponent(eventType)}&start_date=${encodeURIComponent(format(startDateTime, 'yyyy-MM-dd HH:mm:ss'))}&end_date=${encodeURIComponent(format(endDateTime, 'yyyy-MM-dd HH:mm:ss'))}`;      fetch(apiUrl, {
        method: 'GET',
      })
      .then(response => response.json())
      .then(data => {
        console.log('Booking added:', data);
        setNewEventName('');
        setNewEventEmail('');
        setStartDate('');
        setStartTime('');
        setDuration('');
        setEventType('');
        handleModalClose();
      })
      .catch(error => {
        console.error('Error adding booking:', error);
        // Optionally handle the error, e.g., show an error message
      });
      const handleModalClose = () => {
        setConflictMessage('');
        onClose(); // Call the existing onClose function
      };
    };
  return (
    <Box width="100%" height="100vh" padding={0} >
    
        
        <Center>
        <Flex direction="column" align="center" width="100%" height="100%" maxW={1100}>
        <Flex mb={4} alignItems="center" justifyContent="flex-start" left={0} width="100%">
        <IconButton
          icon={<AddIcon />}
          aria-label="Add event"
          onClick={onOpen}
          borderRadius="50%"
          size="lg"
          colorScheme="teal"
          mr={2}
        />
            
          </Flex>
          <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Event</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              value={newEventName}
              onChange={(e) => setNewEventName(e.target.value)}
              placeholder="Name"
              width="100%"
              mb={2}
            />
            <Input
              value={newEventEmail}
              onChange={(e) => setNewEventEmail(e.target.value)}
              placeholder="Email"
              width="100%"
              mb={2}
            />
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Start date"
              width="100%"
              mb={2}
            />
            <Input
              type="time"
              value={startTime}
              step="900"
              onChange={(e) => setStartTime(e.target.value)}
              placeholder="Start time"
              width="100%"
              mb={2}
            />
            <Select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Select duration"
              width="100%"
              mb={2}
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">1 hour</option>
            </Select>
            <Select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              placeholder="Select event type"
              width="100%"
              mb={2}
            >
              <option value="call">Phone Call</option>
              <option value="interview">Interview</option>
            </Select>
            {conflictMessage && (
              <Text color="red.500" mb={2}>{conflictMessage}</Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={addNewEvent}>
              Add Event
            </Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      <Box
          width="100%"
          minWidth="344px"
          height="100%"
          flex="1"
          overflow="hidden"
          transform={isMobile ? 'scale(0.9)' : 'none'}
          transformOrigin="top left"
        >
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={isMobile ? 'timeGridDay' : 'dayGridMonth'}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: isMobile ? '' : 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            customButtons={{
              monthView: {
                text: 'Month',
                click: () => {
                  const calendarApi = FullCalendar.Calendar.getApi();
                  calendarApi.changeView('dayGridMonth');
                },
              },
              weekView: {
                text: 'Week',
                click: () => {
                  const calendarApi = FullCalendar.Calendar.getApi();
                  calendarApi.changeView('timeGridWeek');
                },
              },
              dayView: {
                text: 'Day',
                click: () => {
                  const calendarApi = FullCalendar.Calendar.getApi();
                  calendarApi.changeView('timeGridDay');
                },
              },
            }}
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            events={[...events, ...holidays]}
            height="100%"
            contentHeight="auto"
          />
          {isMobile && (
            <Stack direction="column" spacing={2} mt={2}>
              <Button onClick={() => FullCalendar.Calendar.getApi().changeView('dayGridMonth')}>Month</Button>
              <Button onClick={() => FullCalendar.Calendar.getApi().changeView('timeGridWeek')}>Week</Button>
              <Button onClick={() => FullCalendar.Calendar.getApi().changeView('timeGridDay')}>Day</Button>
            </Stack>
          )}
        </Box>
          </Flex>
      </Center>
        
        
    </Box>
    
  );
};

export default Calendar;