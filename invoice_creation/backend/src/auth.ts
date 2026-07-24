import jwt from 'jsonwebtoken';
import fs from 'fs';
const USERS_FILE_PATH = 'users.json';

const PRIVATE_KEY = fs.readFileSync('private.key', 'utf8'); // Path to your private key file

// Simple in-memory database for storing user data
export interface User {
    username: string;
    password: string;
    phone: string;
    email: string;
}

let users: { [key: string]: User } = {};

try {
    const data = fs.readFileSync('users.json', 'utf8');
    users = JSON.parse(data);
} catch (err) {
    console.error('Error loading user data from file:', err);
}

// Function to validate email format
const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // stole this from internet
    return emailRegex.test(email);
};

// validate phone number format
const isValidPhoneNumber = (phoneNumber: string): boolean => {
    const phoneRegex = /^\d{10}$/; // stole from internet also
    return phoneRegex.test(phoneNumber);
};

// handle user registration, and check rego is valid
export const registerUser = (userData: User): string | null => {
    const { username, password, phone, email } = userData;

    if (users[username]) {return 'Username already exists';}                  // Check if username already exists
    if (!isValidEmail(email)) {return 'Invalid email format';}                // Validate email format
    if (!isValidPhoneNumber(phone)) {return 'Invalid phone number format';}   // Validate phone number format

    users[username] = { username, password, phone, email };
    writeUserDataToFile();
};

// handle user login
export const loginUser = (username: string, password: string): string | null => {
    const user = users[username];
    if (!user || user.password !== password) return 'Invalid username or password';
    return generateJWT(username);
};

// write user data to JSON file
const writeUserDataToFile = () => {
    try {
        fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2));
        console.log('User data written to file successfully');
    } catch (err) {
        console.error('Error writing user data to file:', err);
    }
};

const generateJWT = (username: string): string => {
    return jwt.sign({ username }, PRIVATE_KEY, { algorithm: 'RS256', expiresIn: '1h' });
};