import Appointment from "../models/appoinment.model.js";
import Availability from "../models/avialability.model.js";
import User from "../models/user.model.js";
import { sendEmail } from "../utils/sendEmail.js";
import { sendNotification } from "./notifications.service.js";

export const createAppointment = async (data) => {
  const availability = await Availability.findOne({
    userId: data.doctorId || data.teacherId,
    date: data.date,
    time: data.time,
    isBooked: false,
  });

  if (!availability) {
    const error = new Error("No availability found for requested slot");
    error.statusCode = 400;
    throw error;
  }

  const appointment = await Appointment.create({
    parentId: data.parentId,
    teacherId: data.teacherId || data.doctorId,
    availabilityId: availability._id,
    date: data.date,
    time: data.time,
    status: data.status || "pending",
    zoomLink: availability.zoomLink,
  });

    const AvailabilityUp = await Availability.findByIdAndUpdate(availability._id, {
      isBooked: true,
    });
    AvailabilityUp.save();

  // Fetch Parent & Teacher Details
  const [parent, teacher] = await Promise.all([
    User.findOne({ userId: data.parentId }),
    User.findOne({ userId: data.teacherId || data.doctorId }),
  ]);

  // ==========================
  // Parent Email & Notification
  // ==========================
  if (parent) {
    await sendEmail(
      parent.email,
      "Appointment Created Successfully",
      `
        <h2>Hello ${parent.name}</h2>
        <p>Your appointment has been scheduled successfully.</p>

        <p><strong>Date:</strong> ${appointment.date}</p>
        <p><strong>Time:</strong> ${appointment.time}</p>
        <p><strong>Status:</strong> ${appointment.status}</p>

        ${
          appointment.zoomLink
            ? `<p><strong>Zoom Link:</strong> <a href="${appointment.zoomLink}">${appointment.zoomLink}</a></p>`
            : ""
        }

        <p>Thank you.</p>
      `
    );

    await sendNotification({
      userId: parent.userId,
      title: "Appointment Scheduled",
      message: `Your appointment has been scheduled for ${appointment.date} at ${appointment.time}.`,
      metadata: {
        appointmentId: appointment._id,
        date: appointment.date,
        time: appointment.time,
        role: "parent",
      },
    });
  }

  // ==========================
  // Teacher Email & Notification
  // ==========================
  if (teacher) {
    await sendEmail(
      teacher.email,
      "New Appointment Assigned",
      `
        <h2>Hello ${teacher.name}</h2>
        <p>A new appointment has been scheduled.</p>

        <p><strong>Date:</strong> ${appointment.date}</p>
        <p><strong>Time:</strong> ${appointment.time}</p>
        <p><strong>Status:</strong> ${appointment.status}</p>

        ${
          appointment.zoomLink
            ? `<p><strong>Zoom Link:</strong> <a href="${appointment.zoomLink}">${appointment.zoomLink}</a></p>`
            : ""
        }

        <p>Please be available at the scheduled time.</p>
      `
    );

    await sendNotification({
      userId: teacher.userId,
      title: "New Appointment",
      message: `A new appointment has been scheduled for ${appointment.date} at ${appointment.time}.`,
      metadata: {
        appointmentId: appointment._id,
        parentId: data.parentId,
        date: appointment.date,
        time: appointment.time,
        role: "teacher",
      },
    });
  }

  return appointment;
};

export const getAppointments = async () => {
  return await Appointment.find();
};

export const getAppointmentById = async (id) => {
  const appointment = await Appointment.findById(id);
  if (!appointment) {
    const error = new Error("Appointment not found");
    error.statusCode = 404;
    throw error;
  }
  return appointment;
};

export const confirmAppointment = async (id) => {
  const appointment = await Appointment.findById(id);
  if (!appointment) {
    const error = new Error("Appointment not found");
    error.statusCode = 404;
    throw error;
  }
  appointment.status = "approved";
  await appointment.save();
  return appointment;
};

export const rescheduleAppointment = async (id, data) => {

  // const availability = await Availability.findOne({
  //   date: data.date,
  //   time: data.time,
  //   isBooked: false,
  // });

  // if (!availability) {
  //   const error = new Error("No availability found for requested slot");
  //   error.statusCode = 400;
  //   throw error;
  // }

  // const appointment = await Appointment.findById(id);
  // if (!appointment) {
  //   const error = new Error("Appointment not found");
  //   error.statusCode = 404;
  //   throw error;
  // }
  // appointment.date = data.date || appointment.date;
  // appointment.time = data.time || appointment.time;
  // appointment.status = "rescheduled";
  // await appointment.save();
  // const AvailabilityUp = await Availability.findByIdAndUpdate(availability._id, {
  //   isBooked: true,
  // });
  // AvailabilityUp.save();

  // Find new slot
  const availability = await Availability.findOne({
    date: data.date,
    time: data.time,
    isBooked: false,
  });

  if (!availability) {
    throw new Error("No availability found for requested slot");
  }

  // Find appointment
  const appointment = await Appointment.findById(id);

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  // Release old slot
  if (appointment.availabilityId) {
    await Availability.findByIdAndUpdate(
      appointment.availabilityId,
      { isBooked: false }
    );
  }

  // Book new slot
  await Availability.findByIdAndUpdate(
    availability._id,
    { isBooked: true }
  );

  // Update appointment
  appointment.date = availability.date;
  appointment.time = availability.time;
  appointment.availabilityId = availability._id;
  appointment.zoomLink = availability.zoomLink;
  appointment.status = "rescheduled";

  await appointment.save();

  // Fetch Parent & Teacher Details
  const [parent, teacher] = await Promise.all([
    User.findOne({ userId: appointment.parentId }),
    User.findOne({ userId: appointment.teacherId || data.doctorId }),
  ]);

  // ==========================
  // Parent Email & Notification
  // ==========================
  if (parent) {
    await sendEmail(
      parent.email,
      "Appointment Rescheduled Successfully",
      `
        <h2>Hello ${parent.name}</h2>
        <p>An appointment has been rescheduled successfully.</p>

        <p><strong>Date:</strong> ${appointment.date}</p>
        <p><strong>Time:</strong> ${appointment.time}</p>
        <p><strong>Status:</strong> ${appointment.status}</p>

        ${
          appointment.zoomLink
            ? `<p><strong>Zoom Link:</strong> <a href="${appointment.zoomLink}">${appointment.zoomLink}</a></p>`
            : ""
        }

        <p>Thank you.</p>
      `
    );

    await sendNotification({
      userId: parent.userId,
      title: "Appointment Rescheduled",
      message: `Your appointment has been rescheduled for ${appointment.date} at ${appointment.time}.`,
      metadata: {
        appointmentId: appointment._id,
        date: appointment.date,
        time: appointment.time,
        role: "parent",
      },
    });
  }

  // ==========================
  // Teacher Email & Notification
  // ==========================
  if (teacher) {
    await sendEmail(
      teacher.email,
      "Appointment Rescheduled",
      `
        <h2>Hello ${teacher.name}</h2>
        <p>An appointment has been rescheduled.</p>

        <p><strong>Date:</strong> ${appointment.date}</p>
        <p><strong>Time:</strong> ${appointment.time}</p>
        <p><strong>Status:</strong> ${appointment.status}</p>

        ${
          appointment.zoomLink
            ? `<p><strong>Zoom Link:</strong> <a href="${appointment.zoomLink}">${appointment.zoomLink}</a></p>`
            : ""
        }

        <p>Please be available at the scheduled time.</p>
      `
    );

    await sendNotification({
      userId: teacher.userId,
      title: "Appointment Rescheduled",
      message: `Your appointment has been rescheduled for ${appointment.date} at ${appointment.time}.`,
      metadata: {
        appointmentId: appointment._id,
        parentId: data.parentId,
        date: appointment.date,
        time: appointment.time,
        role: "teacher",
      },
    });
  }

  return appointment;
};

export const cancelAppointment = async (id) => {
  const appointment = await Appointment.findById(id);
  if (!appointment) {
    const error = new Error("Appointment not found");
    error.statusCode = 404;
    throw error;
  }
  appointment.status = "cancelled";
  await appointment.save();
  await Availability.findOneAndUpdate(
    { userId: appointment.teacherId, date: appointment.date, time: appointment.time },
    { isBooked: false }
  );

    // Fetch Parent & Teacher Details
  const [parent, teacher] = await Promise.all([
    User.findOne({ userId: appointment.parentId }),
    User.findOne({ userId: appointment.teacherId || data.doctorId }),
  ]);

  // ==========================
  // Parent Email & Notification
  // ==========================
  if (parent) {
    await sendEmail(
      parent.email,
      "Appointment Cancelled Successfully",
      `
        <h2>Hello ${parent.name}</h2>
        <p>An appointment has been cancelled successfully.</p>

        <p><strong>Date:</strong> ${appointment.date}</p>
        <p><strong>Time:</strong> ${appointment.time}</p>
        <p><strong>Status:</strong> ${appointment.status}</p>

        ${
          appointment.zoomLink
            ? `<p><strong>Zoom Link:</strong> <a href="${appointment.zoomLink}">${appointment.zoomLink}</a></p>`
            : ""
        }

        <p>Thank you.</p>
      `
    );

    await sendNotification({
      userId: parent.userId,
      title: "Appointment Cancelled",
      message: `Your appointment has been cancelled for ${appointment.date} at ${appointment.time}.`,
      metadata: {
        appointmentId: appointment._id,
        date: appointment.date,
        time: appointment.time,
        role: "parent",
      },
    });
  }

  // ==========================
  // Teacher Email & Notification
  // ==========================
  if (teacher) {
    await sendEmail(
      teacher.email,
      "Appointment Cancelled",
      `
        <h2>Hello ${teacher.name}</h2>
        <p>An appointment has been cancelled.</p>

        <p><strong>Date:</strong> ${appointment.date}</p>
        <p><strong>Time:</strong> ${appointment.time}</p>
        <p><strong>Status:</strong> ${appointment.status}</p>

        ${
          appointment.zoomLink
            ? `<p><strong>Zoom Link:</strong> <a href="${appointment.zoomLink}">${appointment.zoomLink}</a></p>`
            : ""
        }

        <p>Please be available at the scheduled time.</p>
      `
    );

    await sendNotification({
      userId: teacher.userId,
      title: "Appointment Cancelled",
      message: `Your appointment has been cancelled for ${appointment.date} at ${appointment.time}.`,
      metadata: {
        appointmentId: appointment._id,
        parentId: data.parentId,
        date: appointment.date,
        time: appointment.time,
        role: "teacher",
      },
    });
  }
  return appointment;
};

export const completeAppointment = async (id) => {
  const appointment = await Appointment.findById(id);
  if (!appointment) {
    const error = new Error("Appointment not found");
    error.statusCode = 404;
    throw error;
  }
  appointment.status = "completed";
  await appointment.save();

  // Fetch Parent & Teacher Details
  const [parent, teacher] = await Promise.all([
    User.findOne({ userId: appointment.parentId }),
    User.findOne({ userId: appointment.teacherId || data.doctorId }),
  ]);

  // ==========================
  // Parent Email & Notification
  // ==========================
  if (parent) {
    await sendEmail(
      parent.email,
      "Appointment Completed Successfully",
      `
        <h2>Hello ${parent.name}</h2>
        <p>An appointment has been completed successfully.</p>

        <p><strong>Date:</strong> ${appointment.date}</p>
        <p><strong>Time:</strong> ${appointment.time}</p>
        <p><strong>Status:</strong> ${appointment.status}</p>

        ${
          appointment.zoomLink
            ? `<p><strong>Zoom Link:</strong> <a href="${appointment.zoomLink}">${appointment.zoomLink}</a></p>`
            : ""
        }

        <p>Thank you.</p>
      `
    );

    await sendNotification({
      userId: parent.userId,
      title: "Appointment Completed",
      message: `Your appointment has been completed for ${appointment.date} at ${appointment.time}.`,
      metadata: {
        appointmentId: appointment._id,
        date: appointment.date,
        time: appointment.time,
        role: "parent",
      },
    });
  }

  // ==========================
  // Teacher Email & Notification
  // ==========================
  if (teacher) {
    await sendEmail(
      teacher.email,
      "Appointment Completed",
      `
        <h2>Hello ${teacher.name}</h2>
        <p>An appointment has been completed.</p>

        <p><strong>Date:</strong> ${appointment.date}</p>
        <p><strong>Time:</strong> ${appointment.time}</p>
        <p><strong>Status:</strong> ${appointment.status}</p>

        ${
          appointment.zoomLink
            ? `<p><strong>Zoom Link:</strong> <a href="${appointment.zoomLink}">${appointment.zoomLink}</a></p>`
            : ""
        }

        <p>Please be available at the scheduled time.</p>
      `
    );

    await sendNotification({
      userId: teacher.userId,
      title: "Appointment Completed",
      message: `Your appointment has been completed for ${appointment.date} at ${appointment.time}.`,
      metadata: {
        appointmentId: appointment._id,
        parentId: appointment.parentId,
        date: appointment.date,
        time: appointment.time,
        role: "teacher",
      },
    });
  }

  return appointment;
};

export const getAvailableSlots = async (doctorId) => {
  return await Availability.find({ userId: Number(doctorId), isBooked: false });
};