const mongoose = require('mongoose');
const Reservation = require('../models/Reservation');
const Table = require('../models/Table');

exports.createReservation = async (req, res) => {
  try {
    const { tableId, date, time, guests } = req.body;

    if (!tableId || !date || !time || !guests) {
      return res.status(400).json({ message: 'Missing reservation details' });
    }

    if (!mongoose.Types.ObjectId.isValid(tableId)) {
      return res.status(400).json({ message: 'Invalid table ID' });
    }

    const table = await Table.findById(tableId);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    if (table.capacity < guests) {
      return res.status(400).json({ message: `Table capacity (${table.capacity}) is insufficient for ${guests} guests` });
    }

    const existing = await Reservation.findOne({
      table: tableId,
      date,
      time,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existing) {
      return res.status(409).json({ message: 'Table is already booked at the selected date and time' });
    }

    const reservation = await Reservation.create({
      user: req.user._id,
      table: tableId,
      date,
      time,
      guests,
      status: 'pending'
    });

    res.status(201).json(reservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id })
      .populate('table')
      .sort({ createdAt: -1 });
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('user', 'name email')
      .populate('table')
      .sort({ createdAt: -1 });
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateReservationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['confirmed', 'declined'].includes(status)) {
      return res.status(400).json({ message: "Status must be 'confirmed' or 'declined'" });
    }

    const reservation = await Reservation.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    res.status(200).json(reservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTables = async (req, res) => {
  try {
    const tables = await Table.find();
    res.status(200).json(tables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};