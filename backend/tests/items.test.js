const request = require('supertest');
const express = require('express');

// Mock the fs module
jest.mock('fs', () => ({
    promises: {
      readFile: jest.fn(),
      writeFile: jest.fn(),
    },
  }));

const fs = require('fs').promises;
const itemsRouter = require('../src/routes/items');

const app = express();
app.use(express.json());
app.use('/items', itemsRouter);

const { genericErrorHandler } = require('../src/middleware/errorHandler');
app.use(genericErrorHandler);

const mockItems = [
  { id: 1, name: 'Item 1', price: 10 },
  { id: 2, name: 'Item 2', price: 20 },
  { id: 3, name: 'Another NewItem', price: 30 },
];

describe('Items API', () => {
  beforeEach(() => {
    // Reset mocks before each test
    fs.readFile.mockClear();
    fs.writeFile.mockClear();
  });

  describe('GET /items', () => {
    it('should return all items', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));
      const response = await request(app).get('/items');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        items: mockItems,
        total: mockItems.length,
      });
    });

    it('should filter items with "q" query parameter', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));
      const response = await request(app).get('/items?q=Another');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        items: [{ id: 3, name: 'Another NewItem', price: 30 }],
        total: 1,
      });
    });

    it('should limit items with "limit" query parameter', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));
      const response = await request(app).get('/items?limit=1');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        items: [{ id: 1, name: 'Item 1', price: 10 }],
        total: mockItems.length,
      });
    });

    it('should return paginated items with "page" and "limit" query parameters', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));
      const response = await request(app).get('/items?page=2&limit=1');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        items: [{ id: 2, name: 'Item 2', price: 20 }],
        total: mockItems.length,
      });
    });

    it('should return correct total when filtering with "q"', async () => {
        fs.readFile.mockResolvedValue(JSON.stringify(mockItems));
        const response = await request(app).get('/items?q=Item');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          items: [
            { id: 1, name: 'Item 1', price: 10 },
            { id: 2, name: 'Item 2', price: 20 },
          ],
          total: 2,
        });
      });

    it('should handle errors during file reading', async () => {
        fs.readFile.mockRejectedValue(new Error('File not found'));
        const response = await request(app).get('/items');
        expect(response.status).toBe(500);
      });
  });

  describe('GET /items/:id', () => {
    it('should return an item by id', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));
      const response = await request(app).get('/items/1');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ id: 1, name: 'Item 1', price: 10 });
    });

    it('should return 404 if item is not found', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));
      const response = await request(app).get('/items/999');
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Item not found');
    });
  });

  describe('POST /items', () => {
    it('should create a new item', async () => {
      const newItem = { name: 'New Item', price: 40 };
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));
      fs.writeFile.mockResolvedValue();

      const response = await request(app)
        .post('/items')
        .send(newItem);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('New Item');
      expect(response.body.price).toBe(40);
      expect(response.body).toHaveProperty('id');

      // Verify that writeFile was called with the new item
      const writeFileCalls = fs.writeFile.mock.calls;
      expect(writeFileCalls.length).toBe(1);
      const writtenData = JSON.parse(writeFileCalls[0][1]);
      expect(writtenData.length).toBe(4);
      expect(writtenData[3].name).toBe('New Item');
    });
  });
});