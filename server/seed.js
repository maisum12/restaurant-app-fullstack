const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const MenuItem = require('./models/MenuItem');
const Table = require('./models/Table');
const Order = require('./models/Order');
const Reservation = require('./models/Reservation');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    // Purana data saaf karein
    await Promise.all([
      User.deleteMany({}),
      MenuItem.deleteMany({}),
      Table.deleteMany({}),
      Order.deleteMany({}),
      Reservation.deleteMany({})
    ]);

    // Hashed password ke sath Customer aur Manager banayein
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    await User.insertMany([
      { name: 'John Customer', email: 'customer@example.com', password: hashedPassword, role: 'customer' },
      { name: 'Alice Manager', email: 'manager@example.com', password: hashedPassword, role: 'manager' }
    ]);

    // 6 Tables
    await Table.insertMany([
      { tableNumber: 1, capacity: 2 },
      { tableNumber: 2, capacity: 2 },
      { tableNumber: 3, capacity: 4 },
      { tableNumber: 4, capacity: 4 },
      { tableNumber: 5, capacity: 6 },
      { tableNumber: 6, capacity: 8 }
    ]);

    // 15 Menu Items
    const menuItems = [
      { name: 'Garlic Bread', category: 'Starters', price: 4.99, description: 'Toasted baguette with garlic butter' },
      { name: 'Chicken Wings', category: 'Starters', price: 8.99, description: 'Spicy buffalo chicken wings' },
      { name: 'French Fries', category: 'Starters', price: 3.99, description: 'Golden crispy potato fries' },
      { name: 'Bruschetta', category: 'Starters', price: 6.49, description: 'Diced tomatoes and basil on toasted bread' },
      { name: 'Margherita Pizza', category: 'Mains', price: 12.99, description: 'Classic cheese and tomato pizza' },
      { name: 'Pepperoni Pizza', category: 'Mains', price: 15.49, description: 'Beef pepperoni with melted mozzarella' },
      { name: 'Beef Burger', category: 'Mains', price: 11.99, description: 'Grilled beef patty with cheddar cheese' },
      { name: 'Chicken Alfredo Pasta', category: 'Mains', price: 14.50, description: 'Fettuccine in rich parmesan cream sauce' },
      { name: 'Grilled Salmon', category: 'Mains', price: 19.99, description: 'Pan-seared salmon with lemon herbs' },
      { name: 'Crispy Club Sandwich', category: 'Mains', price: 9.99, description: 'Triple decker chicken club sandwich' },
      { name: 'Chocolate Lava Cake', category: 'Desserts', price: 6.99, description: 'Molten chocolate center served warm' },
      { name: 'New York Cheesecake', category: 'Desserts', price: 5.99, description: 'Classic velvety rich cheesecake' },
      { name: 'Tiramisu Cup', category: 'Desserts', price: 6.50, description: 'Coffee flavored Italian dessert' },
      { name: 'Fresh Mint Lemonade', category: 'Beverages', price: 3.50, description: 'Fresh squeezed lemon with crushed mint' },
      { name: 'Iced Caramel Latte', category: 'Beverages', price: 4.50, description: 'Chilled espresso with caramel and milk' }
    ];

    await MenuItem.insertMany(menuItems);

    console.log('Database successfully seeded!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedDatabase();