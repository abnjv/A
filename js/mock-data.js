/**
 * mock-data.js
 *
 * Provides mock data for users and rooms to simulate a backend.
 */

const mockUsers = [
  { username: "علي", avatar: "https://avatar.iran.liara.run/public/boy?username=Ali" },
  { username: "فاطمة", avatar: "https://avatar.iran.liara.run/public/girl?username=Fatima" },
  { username: "خالد", avatar: "https://avatar.iran.liara.run/public/boy?username=Khaled" },
  { username: "مريم", avatar: "https://avatar.iran.liara.run/public/girl?username=Mariam" },
  { username: "حسن", avatar: "https://avatar.iran.liara.run/public/boy?username=Hassan" },
  { username: "عائشة", avatar: "https://avatar.iran.liara.run/public/girl?username=Aisha" },
  { username: "سعيد", avatar: "https://avatar.iran.liara.run/public/boy?username=Saeed" },
];

const mockRooms = [
  {
    name: "🎮 غرفة الألعاب",
    users: [mockUsers[0], mockUsers[2], mockUsers[4]]
  },
  {
    name: "🎵 عشاق الموسيقى",
    users: [mockUsers[1], mockUsers[3], mockUsers[5], mockUsers[6]]
  },
  {
    name: " Chill Zone ☕",
    users: [mockUsers[0], mockUsers[1], mockUsers[3]]
  }
];
