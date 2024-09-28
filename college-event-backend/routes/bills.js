// routes/bills.js

const express = require('express');
const router = express.Router({ mergeParams: true });
const mongoose = require('mongoose');
const Event = require('../models/Event');
const upload = require('../middleware/uploadMiddleware'); // Import the upload middleware
// routes/bills.js

const pdfMake = require('pdfmake');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
// const { getBillModel } = require('../models/getBillModel'); // Assuming you have this helper

// Helper function to get or create a Mongoose model for a given event
const getBillModel = (eventName) => {
    const sanitizedEventName = eventName.replace(/\s+/g, '_'); // Replace spaces with underscores

    if (mongoose.models[sanitizedEventName]) {
        return mongoose.model(sanitizedEventName);
    }

    const billSchema = new mongoose.Schema({
        billName: { type: String, required: true },
        description: { type: String, required: true },
        amount: { type: Number, required: true },
        image1: { type: String, required: true },
        image2: { type: String, required: true },
    }, { timestamps: true });

    return mongoose.model(sanitizedEventName, billSchema, sanitizedEventName);
};

// Define font files


    router.get('/download', async (req, res) => {
        const { eventName } = req.params;
      
        try {
          // Check if the event exists
          const event = await Event.findOne({ name: eventName });
          if (!event) {
            return res.status(404).json({ msg: 'Event not found.' });
          }
      
          // Get the Bill model for the event
          const Bill = getBillModel(eventName);
      
          // Fetch all bills
          const bills = await Bill.find({});
      
          if (bills.length === 0) {
            return res.status(400).json({ msg: 'No bills found for this event.' });
          }
      
          // Create a new PDF document
          const doc = new PDFDocument({ margin: 50 });
      
          // Set response headers
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename=${eventName}_Bills.pdf`);
      
          // Pipe the PDF into the response
          doc.pipe(res);
      
          // Add Event Name at the Top
          doc
            .fontSize(20)
            .font('Helvetica-Bold')
            .text(`Event: ${eventName}`, { align: 'center' })
            .moveDown();
      
          // Define Table Data
          const tableData = {
            headers: ['S.No.', 'Bill Name', 'Amount'],
            rows: bills.map((bill, index) => [
              (index + 1).toString(),
              bill.billName,
              bill.amount.toFixed(2),
            ]),
          };
      
          // Define Table Options
          const tableOptions = {
            prepareHeader: () => doc.font('Helvetica-Bold').fontSize(12),
            prepareRow: (row, i) => doc.font('Helvetica').fontSize(12),
          };
      
          // Add the Table
          await doc.table(tableData, tableOptions);
      
          doc.moveDown();
      
          // Add a new page for images
          doc.addPage();
      
          // Iterate through each bill and add images
          for (const [index, bill] of bills.entries()) {
            // Page for Image1
            doc
              .fontSize(16)
              .font('Helvetica-Bold')
              .text(`Bill ${index + 1}: ${bill.billName}`, { align: 'left' })
              .moveDown();
      
            // Add Image1
            const image1Path = path.join(__dirname, '..', 'uploads', bill.image1);
            if (fs.existsSync(image1Path)) {
              doc.image(image1Path, {
                fit: [500, 400],
                align: 'center',
                valign: 'center',
              });
            } else {
              doc
                .fontSize(12)
                .fillColor('red')
                .text('Image1 not found.', { align: 'center' });
            }
      
            doc.addPage();
      
            // Page for Image2
            doc
              .fontSize(16)
              .font('Helvetica-Bold')
              .text(`Bill ${index + 1}: ${bill.billName}`, { align: 'left' })
              .moveDown();
      
            // Add Image2
            const image2Path = path.join(__dirname, '..', 'uploads', bill.image2);
            if (fs.existsSync(image2Path)) {
              doc.image(image2Path, {
                fit: [500, 400],
                align: 'center',
                valign: 'center',
              });
            } else {
              doc
                .fontSize(12)
                .fillColor('red')
                .text('Image2 not found.', { align: 'center' });
            }
      
            // Add a new page for the next bill, except after the last image
            if (index !== bills.length - 1) {
              doc.addPage();
            }
          }
      
          // Finalize the PDF and end the stream
          doc.end();
        } catch (err) {
          console.error(err.message);
          res.status(500).json({ msg: 'Server Error' });
        }
      });

// @route   POST /api/events/:eventName/bills
// @desc    Add a new bill to a specific event
// @access  Public
router.post('/', (req, res) => {
    const { eventName } = req.params;

    // Validate event existence
    Event.findOne({ name: eventName })
        .then((event) => {
            if (!event) {
                return res.status(400).json({ msg: 'Event does not exist.' });
            }

            // Use the upload middleware
            upload(req, res, async (err) => {
                if (err) {
                    // Multer error or custom error
                    return res.status(400).json({ msg: err.message });
                }

                // **Debugging Logs**

                console.log('Uploaded Files:', req.files);

                const { billName, description, amount } = req.body;

                // Validate form fields
                if (!billName || !description || !amount) {
                    return res.status(400).json({ msg: 'All fields are required.' });
                }

                const parsedAmount = parseFloat(amount);
                if (isNaN(parsedAmount) || parsedAmount <= 0) {
                    return res.status(400).json({ msg: 'Amount must be a positive number.' });
                }

                // Validate file uploads
                if (!req.files || !req.files['image1'] || !req.files['image2']) {
                    return res.status(400).json({ msg: 'Both images are required.' });
                }

                const image1 = req.files['image1'][0].filename;
                const image2 = req.files['image2'][0].filename;

                try {
                    // Get the bill model for the event
                    const Bill = getBillModel(eventName);

                    // Create new bill
                    const newBill = new Bill({
                        billName,
                        description,
                        amount: parsedAmount,
                        image1,
                        image2,
                    });

                    await newBill.save();

                    res.status(201).json({ msg: 'Bill added successfully.', bill: newBill });
                } catch (error) {
                    console.error(error.message);
                    res.status(500).send('Server Error');
                }
            });
        })
        .catch((err) => {
            console.error(err.message);
            res.status(500).send('Server Error');
        });
});

// @route   GET /api/events/:eventName/bills
// @desc    Get all bills for a specific event
// @access  Public
router.get('/', async (req, res) => {
    const { eventName } = req.params;

    try {
        // Validate event existence
        const event = await Event.findOne({ name: eventName });
        if (!event) {
            return res.status(400).json({ msg: 'Event does not exist.' });
        }

        // Get the bill model for the event
        const Bill = getBillModel(eventName);

        // Fetch all bills
        const bills = await Bill.find({}).sort({ createdAt: -1 });
        res.json(bills);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
