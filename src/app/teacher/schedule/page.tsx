"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FaClock,
  FaCalendar,
  FaPlus,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaUsers,
  FaBook,
} from "react-icons/fa";

interface TimeSlot {
  id: number;
  courseTitle: string;
  day: string;
  time: string;
  endTime: string;
  room: string;
  capacity: number;
}

interface NewTimeSlot {
  courseTitle: string;
  day: string;
  time: string;
  endTime: string;
  room: string;
  capacity: number;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIME_SLOTS = [
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
  "8:00 PM",
  "9:00 PM",
];
const ROOMS = ["Room A", "Room B", "Room C", "Room D", "Room E"];

const COURSES = [
  "Quran Tajweed Essentials",
  "Arabic Language Basics",
  "Islamic Studies Fundamentals",
  "Quranic Arabic for Beginners",
  "Advanced Tajweed Techniques",
  "Islamic History & Civilization",
];

const TeacherSchedulePage = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    {
      id: 1,
      courseTitle: "Quran Tajweed Essentials",
      day: "Monday",
      time: "6:00 PM",
      endTime: "7:30 PM",
      room: "Room A",
      capacity: 30,
    },
    {
      id: 2,
      courseTitle: "Quran Tajweed Essentials",
      day: "Wednesday",
      time: "6:00 PM",
      endTime: "7:30 PM",
      room: "Room A",
      capacity: 30,
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<NewTimeSlot>({
    courseTitle: "",
    day: "Monday",
    time: "8:00 AM",
    endTime: "9:00 AM",
    room: "Room A",
    capacity: 25,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "capacity" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      // Update existing
      setTimeSlots(
        timeSlots.map((slot) =>
          slot.id === editingId ? { ...formData, id: slot.id } : slot
        )
      );
      setEditingId(null);
    } else {
      // Add new
      setTimeSlots([
        ...timeSlots,
        {
          id: Math.max(...timeSlots.map((s) => s.id), 0) + 1,
          ...formData,
        },
      ]);
    }

    setFormData({
      courseTitle: "",
      day: "Monday",
      time: "8:00 AM",
      endTime: "9:00 AM",
      room: "Room A",
      capacity: 25,
    });
    setShowForm(false);
  };

  const handleEdit = (slot: TimeSlot) => {
    setFormData(slot);
    setEditingId(slot.id);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setTimeSlots(timeSlots.filter((slot) => slot.id !== id));
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      courseTitle: "",
      day: "Monday",
      time: "8:00 AM",
      endTime: "9:00 AM",
      room: "Room A",
      capacity: 25,
    });
  };

  const getSlotsByDay = (day: string) => {
    return timeSlots.filter((slot) => slot.day === day).sort((a, b) => {
      const timeA = parseInt(a.time);
      const timeB = parseInt(b.time);
      return timeA - timeB;
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
        {/* Header */}
        <div className="mb-8">
          <Link href="/student-dashboard" className="inline-flex items-center gap-2 text-green-500 hover:text-green-600 mb-4">
            <FaArrowLeft />
            <span>Back</span>
          </Link>
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Manage Your Schedule</h1>
              <p className="text-lg text-foreground opacity-75">
                Create and manage your class time slots
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-lg font-semibold transition"
            >
              <FaPlus />
              Add Time Slot
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Statistics */}
          <div className="lg:col-span-1">
            <div className="bg-card-bg border border-card-border rounded-lg p-6 sticky top-24">
              <h3 className="text-xl font-semibold mb-4">Schedule Overview</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-foreground opacity-70 mb-1">Total Time Slots</p>
                  <p className="text-3xl font-bold text-green-500">{timeSlots.length}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground opacity-70 mb-1">Total Capacity</p>
                  <p className="text-3xl font-bold text-green-500">
                    {timeSlots.reduce((sum, slot) => sum + slot.capacity, 0)}
                  </p>
                </div>
                <div className="pt-4 border-t border-card-border">
                  <p className="text-sm font-semibold text-foreground mb-2">By Day</p>
                  <div className="space-y-2">
                    {DAYS.map((day) => {
                      const count = getSlotsByDay(day).length;
                      return count > 0 ? (
                        <div key={day} className="flex justify-between text-sm">
                          <span className="text-foreground opacity-75">{day}</span>
                          <span className="font-semibold text-green-500">{count}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Add/Edit Form */}
            {showForm && (
              <div className="bg-card-bg border border-card-border rounded-lg p-8 mb-8">
                <h2 className="text-2xl font-semibold mb-6">
                  {editingId ? "Edit Time Slot" : "Add New Time Slot"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Course Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-foreground opacity-75 mb-2">
                        Course
                      </label>
                      <select
                        name="courseTitle"
                        value={formData.courseTitle}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-foreground focus:outline-none focus:border-green-500 transition"
                      >
                        <option value="">Select a course</option>
                        {COURSES.map((course) => (
                          <option key={course} value={course}>
                            {course}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Day Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-foreground opacity-75 mb-2">
                        Day
                      </label>
                      <select
                        name="day"
                        value={formData.day}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-foreground focus:outline-none focus:border-green-500 transition"
                      >
                        {DAYS.map((day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Start Time */}
                    <div>
                      <label className="block text-sm font-semibold text-foreground opacity-75 mb-2">
                        Start Time
                      </label>
                      <select
                        name="time"
                        value={formData.time}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-foreground focus:outline-none focus:border-green-500 transition"
                      >
                        {TIME_SLOTS.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* End Time */}
                    <div>
                      <label className="block text-sm font-semibold text-foreground opacity-75 mb-2">
                        End Time
                      </label>
                      <select
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-foreground focus:outline-none focus:border-green-500 transition"
                      >
                        {TIME_SLOTS.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Room Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-foreground opacity-75 mb-2">
                        Room
                      </label>
                      <select
                        name="room"
                        value={formData.room}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-foreground focus:outline-none focus:border-green-500 transition"
                      >
                        {ROOMS.map((room) => (
                          <option key={room} value={room}>
                            {room}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Capacity */}
                    <div>
                      <label className="block text-sm font-semibold text-foreground opacity-75 mb-2">
                        Class Capacity
                      </label>
                      <input
                        type="number"
                        name="capacity"
                        value={formData.capacity}
                        onChange={handleInputChange}
                        min="1"
                        max="100"
                        className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-foreground focus:outline-none focus:border-green-500 transition"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-lg font-semibold transition"
                    >
                      {editingId ? "Update Slot" : "Add Slot"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-2 border border-card-border text-foreground hover:bg-card-border rounded-lg font-semibold transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Schedule Display */}
            <div className="space-y-6">
              {DAYS.map((day) => {
                const daySlots = getSlotsByDay(day);
                return (
                  <div key={day} className="bg-card-bg border border-card-border rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <FaCalendar className="text-green-500" />
                      {day}
                    </h3>

                    {daySlots.length > 0 ? (
                      <div className="space-y-3">
                        {daySlots.map((slot) => (
                          <div
                            key={slot.id}
                            className="border border-card-border rounded-lg p-4 hover:border-green-500 transition"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="font-semibold text-lg mb-2">{slot.courseTitle}</p>
                                <div className="space-y-2 text-sm text-foreground opacity-75">
                                  <div className="flex items-center gap-2">
                                    <FaClock className="text-green-500" />
                                    <span>
                                      {slot.time} - {slot.endTime}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <FaBook className="text-green-500" />
                                    <span>{slot.room}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <FaUsers className="text-green-500" />
                                    <span>Capacity: {slot.capacity}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-2 justify-end md:justify-start md:flex-col">
                                <button
                                  onClick={() => handleEdit(slot)}
                                  className="flex items-center gap-2 px-4 py-2 border border-green-500 text-green-500 hover:bg-green-500 hover:text-white rounded-lg font-semibold transition"
                                >
                                  <FaEdit />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(slot.id)}
                                  className="flex items-center gap-2 px-4 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-lg font-semibold transition"
                                >
                                  <FaTrash />
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-foreground opacity-50">No classes scheduled for {day}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherSchedulePage;
