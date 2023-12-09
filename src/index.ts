// index.ts
import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { AddressInfo } from 'net';
import { QueryBuilder } from 'knex';
import connection from './connection';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

const app = express();

app.use(express.json());
app.use(cors());


app.post('/signup', async (req: Request, res: Response) => {
  const { username, password, role } = req.body;

  try {
    const existingUser = await connection('users').where({ username }).first();

    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await connection('users').insert({
      username,
      password: hashedPassword,
      role,
    }).returning('*');

    res.status(201).json({
      id: newUser[0].id,
      username: newUser[0].username,
      role: newUser[0].role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const user = await connection('users').where({ username }).first();

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ userId: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET || 'secret');

    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /type_products
app.post('/type_products', async (req: Request, res: Response) => {
  const { nome, codigo, ativo } = req.body;
  const token = req.headers.authorization;

  try {
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Token not provided' });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string, username: string, role: string };

    if (decodedToken.role !== 'Admin') {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    const newTypeProduct = await connection('type_products').insert({
      nome,
      codigo,
      ativo,
    }).returning('*');

    res.status(201).json(newTypeProduct[0]);
  } catch (error) {
    console.error(error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /type_products
app.get('/type_products', async (req: Request, res: Response) => {
  const token = req.headers.authorization;
  const { filter, page = '1', limit = '10', order = 'asc' } = req.query;

  try {
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Token not provided' });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string, username: string, role: string };

    let query = connection('type_products').select('*');

    if (filter && typeof filter === 'string') {
      query = query.where('nome', 'like', `%${filter}%`);
    }

    if (order && (order === 'asc' || order === 'desc')) {
      query = query.orderBy('nome', order);
    }

    const typeProducts = await query.limit(Number(limit)).offset((Number(page) - 1) * Number(limit));

    res.status(200).json(typeProducts);
  } catch (error) {
    console.error(error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /type_products/:id
app.put('/type_products/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nome, codigo, ativo } = req.body;
  const token = req.headers.authorization;

  try {
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Token not provided' });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string, username: string, role: string };

    if (decodedToken.role !== 'Admin') {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    await connection('type_products')
      .where('id', id)
      .update({
        nome,
        codigo,
        ativo,
      });

    res.status(200).json({ message: 'Type product updated successfully.' });
  } catch (error) {
    console.error(error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /type_products/:id
app.delete('/type_products/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const token = req.headers.authorization;

  try {
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Token not provided' });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string, username: string, role: string };

    if (decodedToken.role !== 'Admin') {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    await connection('type_products')
      .where('id', id)
      .delete();

    res.status(200).json({ message: 'Type product deleted successfully.' });
  } catch (error) {
    console.error(error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// POST /produto
app.post('/produto', async (req: Request, res: Response) => {
  const { nome, tipo_produto, ativo } = req.body;
  const token = req.headers.authorization;

  try {
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Token not provided' });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string, username: string, role: string };

    if (decodedToken.role !== 'Admin') {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    const newProduto = await connection('produto').insert({
      nome,
      tipo_produto,
      ativo,
    }).returning('*');

    res.status(201).json(newProduto[0]);
  } catch (error) {
    console.error(error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /produto
app.get('/produto', async (req: Request, res: Response) => {
  const token = req.headers.authorization;
  const { filter, page = '1', limit = '10', order = 'asc' } = req.query;

  try {
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Token not provided' });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string, username: string, role: string };

    let query = connection('produto').select('*');

    if (filter && typeof filter === 'string') {
      query = query.where('nome', 'like', `%${filter}%`);
    }

    if (order && (order === 'asc' || order === 'desc')) {
      query = query.orderBy('nome', order);
    }

    const produtos = await query.limit(Number(limit)).offset((Number(page) - 1) * Number(limit));

    res.status(200).json(produtos);
  } catch (error) {
    console.error(error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// PUT /produto/:id
app.put('/produto/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nome, tipo_produto, ativo } = req.body;
  const token = req.headers.authorization;

  try {
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Token not provided' });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string, username: string, role: string };

    if (decodedToken.role !== 'Admin') {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    await connection('produto')
      .where('id', id)
      .update({
        nome,
        tipo_produto,
        ativo,
      });

    res.status(200).json({ message: 'Product updated successfully.' });
  } catch (error) {
    console.error(error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /produto/:id
app.delete('/produto/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const token = req.headers.authorization;

  try {
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Token not provided' });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string, username: string, role: string };

    if (decodedToken.role !== 'Admin') {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    await connection('produto')
      .where('id', id)
      .delete();

    res.status(200).json({ message: 'Product deleted successfully.' });
  } catch (error) {
    console.error(error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



const server = app.listen(process.env.PORT || 3003, () => {
  if (server) {
    const address = server.address() as AddressInfo;
    console.log(`Server is running in http://localhost:${address.port}`);
  } else {
    console.error(`Failure upon starting server.`);
  }
});
