import express from 'express';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route sederhana
app.get('/', (req, res) => {
  res.send('Hello, Express with ES6 Modules!');
});

// Jalankan server di port 3000
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
