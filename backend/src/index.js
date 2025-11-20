const express = require('express');
const morgan = require('morgan');
const initailPath = require('initial-path');
const itemsRouter = require('./routes/items');
const statsRouter = require('./routes/stats');
const cors = require('cors');
const { notFound, genericErrorHandler } = require('./middleware/errorHandler');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:3000' }));
// Basic middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(initailPath());

app.use(express.static('public'));

// Routes
app.use('/api/items', itemsRouter);
app.use('/api/stats', statsRouter);

// Not Found
app.use('*', notFound);

// Generic Error Handler
app.use(genericErrorHandler);


app.listen(port, () => console.log('Backend running on http://localhost:' + port));