const { CalendarService } = require('../lib/calendar-service');

class CalendarController {
  constructor() {
    this.calendarService = new CalendarService();
  }

  // 1. CREATE GENERAL EVENT - visible to all users
  createGeneralEvent = async (req, res) => {
    try {
      const { calendarId, ...eventData } = req.body;
      
      if (!calendarId || !eventData.title) {
        return res.status(400).json({ 
          success: false,
          error: 'calendarId and title are required' 
        });
      }

      const event = await this.calendarService.createGeneralEvent(calendarId, eventData);
      
      res.status(201).json({ 
        success: true, 
        event,
        message: 'General event created successfully'
      });
    } catch (error) {
      console.error('Error creating general event:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  };

  // 2. CREATE PRIVATE EVENT - visible only to specific users
  createPrivateEvent = async (req, res) => {
    try {
      const { calendarId, allowedUsers, ...eventData } = req.body;
      
      if (!calendarId || !eventData.title || !allowedUsers?.length) {
        return res.status(400).json({ 
          success: false,
          error: 'calendarId, title, and allowedUsers are required' 
        });
      }

      const event = await this.calendarService.createPrivateEvent(
        calendarId, 
        eventData, 
        allowedUsers
      );
      
      res.status(201).json({ 
        success: true, 
        event,
        message: 'Private event created successfully'
      });
    } catch (error) {
      console.error('Error creating private event:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  };

  // 3. CREATE EVENT (Generic)
  createEvent = async (req, res) => {
    try {
      const { calendarId, eventType, allowedUsers, ...eventData } = req.body;
      
      if (!calendarId || !eventData.title) {
        return res.status(400).json({ 
          success: false,
          error: 'calendarId and title are required' 
        });
      }

      let event;
      let message;

      if (eventType === 'private' && allowedUsers?.length > 0) {
        event = await this.calendarService.createPrivateEvent(calendarId, eventData, allowedUsers);
        message = 'Private event created successfully';
      } else {
        // Default: general/common event
        event = await this.calendarService.createGeneralEvent(calendarId, eventData);
        message = 'General event created successfully';
      }
      
      res.status(201).json({ 
        success: true, 
        event,
        message,
        type: eventType || 'general'
      });
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  };

  // 4. UPDATE EVENT (Generic)
  updateEvent = async (req, res) => {
    try {
      const { eventId } = req.params;
      const { calendarId, ...updateData } = req.body;
      
      if (!calendarId) {
        return res.status(400).json({ 
          success: false,
          error: 'calendarId is required' 
        });
      }

      const event = await this.calendarService.updateEvent(calendarId, eventId, updateData);
      
      res.json({ 
        success: true, 
        event,
        message: 'Event updated successfully'
      });
    } catch (error) {
      console.error('Error updating event:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  };

  // UPDATE COMMON EVENT
  updateCommonEvent = async (req, res) => {
    try {
      const { eventId } = req.params;
      const { calendarId, ...updateData } = req.body;
      
      if (!calendarId) {
        return res.status(400).json({ 
          success: false,
          error: 'calendarId is required' 
        });
      }

      // Force public visibility for common events
      updateData.visibility = 'public';

      const event = await this.calendarService.updateEvent(calendarId, eventId, updateData);
      
      res.json({ 
        success: true, 
        event,
        message: 'Common event updated successfully',
        type: 'common'
      });
    } catch (error) {
      console.error('Error updating common event:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  };

  // UPDATE PRIVATE EVENT
  updatePrivateEvent = async (req, res) => {
    try {
      const { eventId } = req.params;
      const { calendarId, allowedUsers, ...updateData } = req.body;
      
      if (!calendarId) {
        return res.status(400).json({ 
          success: false,
          error: 'calendarId is required' 
        });
      }

      // Force private visibility and add users to description
      updateData.visibility = 'private';
      if (allowedUsers && allowedUsers.length > 0) {
        const usersText = `\n\nPrivate Event - Intended for: ${allowedUsers.join(', ')}`;
        updateData.description = (updateData.description || '') + usersText;
      }

      const event = await this.calendarService.updateEvent(calendarId, eventId, updateData);
      
      res.json({ 
        success: true, 
        event,
        message: 'Private event updated successfully',
        type: 'private',
        allowedUsers
      });
    } catch (error) {
      console.error('Error updating private event:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  };

  // DELETE EVENT (Generic)
  deleteEvent = async (req, res) => {
    try {
      const { eventId } = req.params;
      const { calendarId } = req.query;
      
      if (!calendarId) {
        return res.status(400).json({ 
          success: false,
          error: 'calendarId query parameter is required' 
        });
      }

      const result = await this.calendarService.deleteEvent(calendarId, eventId);
      
      if (result.success === false) {
        return res.status(404).json(result);
      }
      
      res.json(result);
    } catch (error) {
      console.error('Error deleting event:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  };

  // DELETE COMMON EVENT
  deleteCommonEvent = async (req, res) => {
    try {
      const { eventId } = req.params;
      const { calendarId } = req.query;
      
      if (!calendarId) {
        return res.status(400).json({ 
          success: false,
          error: 'calendarId query parameter is required' 
        });
      }

      const result = await this.calendarService.deleteEvent(calendarId, eventId);
      
      if (result.success === false) {
        return res.status(404).json({
          ...result,
          type: 'common'
        });
      }
      
      res.json({
        ...result,
        message: 'Common event deleted successfully',
        type: 'common'
      });
    } catch (error) {
      console.error('Error deleting common event:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  };

  // DELETE PRIVATE EVENT
  deletePrivateEvent = async (req, res) => {
    try {
      const { eventId } = req.params;
      const { calendarId } = req.query;
      
      if (!calendarId) {
        return res.status(400).json({ 
          success: false,
          error: 'calendarId query parameter is required' 
        });
      }

      const result = await this.calendarService.deleteEvent(calendarId, eventId);
      
      if (result.success === false) {
        return res.status(404).json({
          ...result,
          type: 'private'
        });
      }
      
      res.json({
        ...result,
        message: 'Private event deleted successfully',
        type: 'private'
      });
    } catch (error) {
      console.error('Error deleting private event:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  };

  // GET EVENTS
  getEvents = async (req, res) => {
    try {
      const { calendarId, timeMin, timeMax } = req.query;
      
      if (!calendarId) {
        return res.status(400).json({ 
          success: false,
          error: 'calendarId query parameter is required' 
        });
      }

      const events = await this.calendarService.getEvents(calendarId, timeMin, timeMax);
      
      res.json({ 
        success: true, 
        events,
        count: events.length
      });
    } catch (error) {
      console.error('Error getting events:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  };

  // GET COMMON/PUBLIC EVENTS
  getCommonEvents = async (req, res) => {
    try {
      const { calendarId, timeMin, timeMax } = req.query;
      
      if (!calendarId) {
        return res.status(400).json({ 
          success: false,
          error: 'calendarId query parameter is required' 
        });
      }

      const events = await this.calendarService.getCommonEvents(calendarId, timeMin, timeMax);
      
      res.json({ 
        success: true, 
        events,
        count: events.length,
        type: 'common/public'
      });
    } catch (error) {
      console.error('Error getting common events:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  };

  // GET PRIVATE EVENTS
  getPrivateEvents = async (req, res) => {
    try {
      const { calendarId, timeMin, timeMax, userEmail } = req.query;
      
      if (!calendarId || !userEmail) {
        return res.status(400).json({ 
          success: false,
          error: 'calendarId and userEmail query parameters are required' 
        });
      }

      const events = await this.calendarService.getPrivateEvents(calendarId, timeMin, timeMax, userEmail);
      
      res.json({ 
        success: true, 
        events,
        count: events.length,
        type: 'private',
        userEmail
      });
    } catch (error) {
      console.error('Error getting private events:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  };

  // Debug endpoint to check calendar access
  checkCalendarAccess = async (req, res) => {
    try {
      const calendarInfo = await this.calendarService.getCalendarInfo();
      
      res.json({
        success: true,
        data: calendarInfo,
        message: 'Calendar access verified'
      });
    } catch (error) {
      console.error('Error checking calendar access:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  // Test endpoint to create and verify event
  testEventCreation = async (req, res) => {
    try {
      const { calendarId } = req.body;
      const result = await this.calendarService.testEventCreation(calendarId || 'primary');
      
      res.json({
        success: true,
        event: result,
        message: 'Test event created successfully. Check your calendar!'
      });
    } catch (error) {
      console.error('Error in test event creation:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };
}

module.exports = new CalendarController();