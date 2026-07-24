import express, { Request, Response, NextFunction } from 'express';
import jwt, { TokenExpiredError, JsonWebTokenError, NotBeforeError } from 'jsonwebtoken';
import http from 'http';
import morgan from 'morgan';
const cors = require('cors');
import bodyParser from 'body-parser';
import AWS from 'aws-sdk';
require("aws-sdk/lib/maintenance_mode_message").suppress = true;
const fs = require('fs');
import multer from 'multer';
import csvtojson from 'csvtojson';
import session, { SessionData } from 'express-session';
import { ALIVE_ENDPOINT, UPLOAD_ENDPOINT, JS_CREATE_ENDPOINT, CSV_CREATE_ENDPOINT } from '../../interface/interface';
import { createUblInvoice, exportInvoiceXml } from './create';
import { registerUser, loginUser, User } from './auth';
import cookieParser from 'cookie-parser';
type JwtError = TokenExpiredError | JsonWebTokenError | NotBeforeError;
interface DecodedToken {
    username: string;
}
interface CustomSessionData extends SessionData {
    token?: string; // Define the token property
}

const app = express();

app.use(cookieParser());
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ // Use express-session middleware
    secret: 'randomsecret', // Specify a secret key for session encryption (replace 'your-secret-key' with an actual secret)
    resave: false,
    saveUninitialized: true,
}));

const server = http.createServer(app);

// Simple alive test endpoint
app.get(ALIVE_ENDPOINT, (req, res) => {
    res.status(200).json({
        status: 'alive',
        data: 'CTRL Freaks invoice creation API is alive'
    });
});

const PRIVATE_KEY = fs.readFileSync('private.key', 'utf8');

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token; // Get the token from cookies
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, PRIVATE_KEY, (err: JwtError | null, decoded: DecodedToken | undefined) => {
        if (err) return res.status(401).json({ error: 'Invalid token' });
        req.body.username = (decoded as { username: string }).username;
        next();
    });
};

// Similar to alive endpoint, but checks if the user is logged in using session token
app.get('/loggedIn', verifyToken, (req, res) => {
    const username = req.body.username;
    res.status(200).json({ message: `Hello, ${username}! This is a protected route.` });
});

// Register user
app.post('/register', async (req, res) => {
    const userData: User = req.body;
    const error = registerUser(userData);
    if (error) {  return res.status(400).json({ error }); }
    res.status(200).json({ message: 'User registered successfully' });
});

// Login user and set session token
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const token = loginUser(username, password);
    if (token) {
        res.cookie('token', token, {
            maxAge: 1000 * 60 * 60, // Cookie expires in 1 hour
            httpOnly: true, // Cookie accessible only by the server
            secure: false, // Set to true if your app is served over HTTPS
            sameSite: 'lax', // Protects against CSRF attacks
        });        res.status(200).json({ token });
    } else {
        res.status(401).json({ error: 'Invalid username or password' });
    }
});

// Logout method, destroys session token
app.delete('/logout', (req: Request, res: Response) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.status(200).json({ message: 'Logout successful' });
        }
    });
});

// setup & config of multer (file handling middleware) and aws s3 (storage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
AWS.config.update({
    region: 'ap-southeast-2',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});
const s3 = new AWS.S3();

// Upload route, to send files to s3 bucket
app.post(UPLOAD_ENDPOINT, upload.single('file'), verifyToken, async (req, res) => {
    const file = req.file;
    const username = req.body.username;;

    const fileKey = `${username}/${Date.now()}_${file.originalname}`; // Prefix with username

    const params = {
        Bucket: 'invoices-ctrlfreaks', // bucket name
        Key: fileKey,
        Body: file.buffer,
    };
    console.log("FILEKEY: " + fileKey);

    try {
        const data = await s3.upload(params).promise();
        res.status(200).send('File uploaded successfully. File name for storage =' + fileKey);
    } catch (error) {
        console.error('Error uploading file to S3:', error);
        res.status(500).send('Error uploading file to S3');
    }
});

app.get('/download/:fileKey', verifyToken, async (req: Request, res: Response) => {
    // need to pass fileKey into URL. eg. http://54.206.144.207:4000/download/Invoice_1711928613044
    const fileKey = req.params.fileKey;
    const username = req.body.username; // Assuming you store the username in the session
    console.log("FileKey: " + fileKey);

    try {                                  // Check if the file exists in the bucket
        const headParams = {
            Bucket: 'invoices-ctrlfreaks', // bucket name
            Key: fileKey,
        };
        await s3.headObject(headParams).promise(); // Throws error if file doesn't exist

        const downloadParams = {           // Generate a pre-signed URL for downloading the file
            Bucket: 'invoices-ctrlfreaks',
            Key: fileKey,
            Expires: 3600,                 // URL expiration time in seconds (e.g., 1 hour)
        };

        const downloadUrl = await s3.getSignedUrlPromise('getObject', downloadParams);
        res.send({ downloadUrl }); // Send the pre-signed URL in the response
        
    } catch (error) {
        console.error('Error downloading file from S3:', error);
        res.status(404).send('File not found');
    }
});

app.get('/invoices/:username', verifyToken, async (req: Request, res: Response) => {
    const username = req.params.username;
    try {
        const params = {         // retrieve invoices associated with the given username
            Bucket: 'invoices-ctrlfreaks',
            Prefix: `${username}/`,         // Prefix with the username to retrieve all invoices for that user
        };
        const s3Response = await s3.listObjectsV2(params).promise();
        const invoices = s3Response.Contents?.map(obj => obj.Key).filter(key => key !== `${username}/`);         // Extract keys of the fetched objects (invoices)

        res.status(200).json({ invoices });         // Return the list of invoices as a response
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Create from JSON
app.post(JS_CREATE_ENDPOINT, async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).send('Bad Request: No JSON data provided.');
        }

        const { invoice: invoiceJSON } = req.body;
        
        const outputInvoice = createUblInvoice(invoiceJSON);
        await exportInvoiceXml(outputInvoice);
        res.setHeader('Content-Type', 'application/xml');
        res.download("./src/output/invoice.xml");
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

// Create from CSV
app.post(CSV_CREATE_ENDPOINT, async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).send('Bad Request: No JSON data provided.');
        }

        const { invoice: invoiceCSV } = req.body;

        const invoiceJSON = csvtojson().fromString(invoiceCSV);

        const outputInvoice = createUblInvoice(invoiceJSON);
        await exportInvoiceXml(outputInvoice);

        res.setHeader('Content-Type', 'application/xml');
        res.download("./src/output/invoice.xml");
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

const PORT: number = parseInt(process.env.PORT || '4000');
// A bit hacky. should fix for Sprint 4. Process.env.IP wasn't working, so if running as AWS, listen on 0.0.0.0 - anywhere else, localhost
let HOST: string = process.env.IP || 'localhost';
if (process.env.SUDO_USER === "ubuntu") { HOST = '0.0.0.0'; }

if (process.env.NODE_ENV !== 'test') {
    server.listen(PORT, HOST, () => {
        console.log(`Server is alive on port ${PORT} at ${HOST}`);
    });
}

// For testing
module.exports = server;
module.exports = app;
