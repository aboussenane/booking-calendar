'use client';
import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Stack, Box, Button, Input, Flex, IconButton, Select,useMediaQuery, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure, Text, Center } from '@chakra-ui/react';
import { AddIcon, ArrowBackIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import Holidays from 'date-holidays';
import { all } from 'axios';
import { add, format, isBefore, isPast, formatISO, isEqual } from 'date-fns';
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
  const calendarRef = useRef(null);
  const [calendarTitle, setCalendarTitle] = useState('');
  const [viewMode, setViewMode] = useState('dayGridMonth');
    useEffect(() => {
      const fetchEvents = async () => {
        try {
          const response = await fetch('https://booking-calendar-ten.vercel.app/api/get-bookings');
          const data = await response.json();
          //console.log('Fetched events:', data.bookings); // Log fetched events
        if (Array.isArray(data.bookings)) {
          setEvents(data.bookings.map(booking => ({
            title: booking.name,
            start: booking.start_date,
            end: booking.end_date === booking.start_date ? '' : booking.end_date,
            description: booking.description,
            color: booking.description === 'reservation' ? 'gray' : 'green',
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
    const checkForConflicts = async (firstDate, secondDate) => {
      const apiUrl = `https://booking-calendar-ten.vercel.app/api/check-conflict?start_date=${encodeURIComponent(format(startDate, 'yyyy-MM-dd'))}&end_date=${encodeURIComponent(format(endDate, 'yyyy-MM-dd'))}`;
      //console.log('Checking for conflicts with start date:', format(firstDate, 'yyyy-MM-dd'), 'and end date:', format(secondDate, 'yyyy-MM-dd'));
      try {
        const response = await fetch(apiUrl, {
          method: 'GET',
        });
        const data = await response.json();
        
        if (data.conflicts && data.conflicts.length > 0) {
          //console.log('Conflicts found:', data.conflicts);
          return true; // Conflicts exist
        }
        
        return false; // No conflicts
      } catch (error) {
        //console.error('Error checking for conflicts:', error);
        return false; // Assume no conflicts in case of error
      }
    };
    const addNewEvent = async () => {
      let tempDate = formatISO(new Date(`${startDate}`));
      let tempDate2 = formatISO(new Date(`${endDate}`));
      
      //console.log('New event:', newEventName, newEventEmail, startDate, endDate, eventType);
      if (isPast(startDate) || isBefore(tempDate2,tempDate)){
        setConflictMessage('The start date and time must be in the future. The start date cannot be after the end date.');
        console.log('Start date is in the past or before start date.');
        return;
      }
      if (isEqual(tempDate, tempDate)) {
        console.log('Start date before: ', tempDate, 'End date before: ', tempDate2);
        tempDate = formatISO(add(tempDate, { days: 1, }));
        //tempDate2 = formatISO(add(tempDate2, { days: 2, }));
        console.log('Start date after: ', tempDate, 'End date after: ', tempDate2);
      }
      const firstDate = startDate;
      const secondDate = tempDate2;
      console.log('First date:', firstDate, 'Second date:', secondDate);
      const hasConflicts = await checkForConflicts(firstDate, secondDate);
      if (hasConflicts) {
        setConflictMessage('This booking conflicts with an existing booking.');
        console.log('Conflict detected');
        return;
      }
      const newEvent = {
        title: newEventName ,
        email: newEventEmail,
        start: firstDate,
        end: secondDate,
        description: eventType,
        color: eventType === 'reservation' ? 'gray' : 'green',
      };
      setEvents([...events, newEvent]);
      const apiUrl = `https://booking-calendar-ten.vercel.app/api/add-booking?name=${encodeURIComponent(newEventName)}&email=${encodeURIComponent(newEventEmail)}&description=${encodeURIComponent(eventType)}&start_date=${encodeURIComponent(format(firstDate, 'yyyy-MM-dd HH:mm:ss'))}&end_date=${encodeURIComponent(format(secondDate, 'yyyy-MM-dd HH:mm:ss'))}`;      
      fetch(apiUrl, {
        method: 'GET',
      })
      .then(response => response.json())
      .then(data => {
        console.log('Booking added:', data);
        setNewEventName('');
        setNewEventEmail('');
        setStartDate('');
        setEndDate('');
       
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
    const handleDatesSet = (arg) => {
      setCalendarTitle(arg.view.title);
      setViewMode(arg.view.type);
    };
  return (
    <Box width="100%" height="100vh" padding={0} m={0}>
    
        
        <Center>
        <Flex direction="column" align="center" width="100%" height="100%" maxW={1100} p={isMobile ? 0 : 4}>
        <Stack direction="row" spacing={2} align="center" justify="center">
            {!isMobile && (
              <>
                <Flex align="center" justify="space-between" mt={2} mb={2}>
                  <IconButton
                    icon={<AddIcon />}
                    aria-label="Add event"
                    onClick={onOpen}
                    borderRadius="50%"
                    size="lg"
                    
                    
                  />
                </Flex>
              </>
            )}
            <Text fontSize="3xl">{calendarTitle}</Text>
          </Stack>
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
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="End date"
              width="100%"
              mb={2}
            />
            <Select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              placeholder="Select event type"
              width="100%"
              mb={2}
            >
              <option value="reservation">Reservation</option>
              <option value="checkout">Checkout</option>
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
      {isMobile && (
            <>
            
              <Stack direction="row" spacing={2} mt={2} align="center">
              <IconButton
                icon={<ArrowBackIcon />}
                aria-label="Previous"
                onClick={() => calendarRef.current.getApi().prev()}
                borderRadius="50%"
                size="lg"
                colorScheme="teal"
              />
              <Flex align="center" justify="space-between" mt={2} mb={2}>
                <IconButton
                  icon={<AddIcon />}
                  aria-label="Add event"
                  onClick={onOpen}
                  borderRadius="50%"
                  size="lg"
                  colorScheme="teal"
                />
                
              </Flex>
                <Button width="60px" onClick={() => calendarRef.current.getApi().changeView('dayGridMonth')}>Month</Button>
                <Button width="60px" onClick={() => calendarRef.current.getApi().changeView('timeGridWeek')}>Week</Button>
                <Button width="60px" onClick={() => calendarRef.current.getApi().changeView('timeGridDay')}>Day</Button>
                <IconButton
                icon={<ArrowForwardIcon />}
                aria-label="Next"
                onClick={() => calendarRef.current.getApi().next()}
                borderRadius="50%"
                size="lg"
                colorScheme="teal"
                ml={2}
              />
              </Stack>
              </>
      )}
      <Box
          width="100%"
          minWidth="344px"
          height="100%"
          flex="1"
          overflow="hidden"
          transform={isMobile ? 'scale(0.9)' : 'none'}
          transform={isMobile ? 'paddingLeft' : '20px'}
          transformOrigin="top left"
          
          m={0}
          
          
        >
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={isMobile ? 'timeGridDay' : 'dayGridMonth'}
            headerToolbar={{
              left: isMobile ? '' : 'prev,next today',
              right: isMobile ? '' : 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            ref={calendarRef}
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            events={[...events, ...holidays]}
            height="100%"
            contentHeight="auto"
            datesSet={handleDatesSet}
          />
          
          
        </Box>
          </Flex>
      </Center>
        
        
    </Box>
    
  );
};

export default Calendar;