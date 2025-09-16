const { getCalendarClient } = require("./google-auth");

class CalendarService {
  constructor() {
    this.calendar = getCalendarClient();
  }

  async createGeneralEvent(calendarId, eventData) {
    try {
      const event = {
        summary: eventData.title,
        description: eventData.description,
        start: {
          dateTime: eventData.startDateTime,
          timeZone: eventData.timeZone || "UTC",
        },
        end: {
          dateTime: eventData.endDateTime,
          timeZone: eventData.timeZone || "UTC",
        },
        location: eventData.location,
        attendees: eventData.attendees || [],
        reminders: {
          useDefault: false,
          overrides: eventData.reminders || [
            { method: "email", minutes: 24 * 60 },
            { method: "popup", minutes: 10 },
          ],
        },
        visibility: "public",
      };

      const response = await this.calendar.events.insert({
        calendarId,
        resource: event,
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to create general event: ${error.message}`);
    }
  }

  async createPrivateEvent(calendarId, eventData, allowedUsers = []) {
    try {
      const attendees = allowedUsers.map((email) => ({ email }));

      const event = {
        summary: eventData.title,
        description: eventData.description,
        start: {
          dateTime: eventData.startDateTime,
          timeZone: eventData.timeZone || "UTC",
        },
        end: {
          dateTime: eventData.endDateTime,
          timeZone: eventData.timeZone || "UTC",
        },
        location: eventData.location,
        attendees,
        visibility: "private",
        guestsCanSeeOtherGuests: false,
        reminders: {
          useDefault: false,
          overrides: eventData.reminders || [
            { method: "email", minutes: 24 * 60 },
            { method: "popup", minutes: 10 },
          ],
        },
      };

      const response = await this.calendar.events.insert({
        calendarId,
        resource: event,
        sendUpdates: "all",
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to create private event: ${error.message}`);
    }
  }

  async updateEvent(calendarId, eventId, updateData) {
    try {
      const event = {
        summary: updateData.title,
        description: updateData.description,
        start: updateData.startDateTime
          ? {
              dateTime: updateData.startDateTime,
              timeZone: updateData.timeZone || "UTC",
            }
          : undefined,
        end: updateData.endDateTime
          ? {
              dateTime: updateData.endDateTime,
              timeZone: updateData.timeZone || "UTC",
            }
          : undefined,
        location: updateData.location,
        attendees: updateData.attendees,
        reminders: updateData.reminders
          ? {
              useDefault: false,
              overrides: updateData.reminders,
            }
          : undefined,
      };

      Object.keys(event).forEach(
        (key) => event[key] === undefined && delete event[key]
      );

      const response = await this.calendar.events.update({
        calendarId,
        eventId,
        resource: event,
        sendUpdates: "all",
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to update event: ${error.message}`);
    }
  }

  async deleteEvent(calendarId, eventId) {
    try {
      await this.calendar.events.delete({
        calendarId,
        eventId,
        sendUpdates: "all",
      });
      return { success: true, message: "Event deleted successfully" };
    } catch (error) {
      throw new Error(`Failed to delete event: ${error.message}`);
    }
  }

  async getEvents(calendarId, timeMin, timeMax) {
    try {
      const response = await this.calendar.events.list({
        calendarId,
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: "startTime",
      });

      return response.data.items;
    } catch (error) {
      throw new Error(`Failed to get events: ${error.message}`);
    }
  }
}

module.exports = { CalendarService };
