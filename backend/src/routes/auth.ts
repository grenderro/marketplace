import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';

const router = Router();

router.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { address } = req.body;
        console.log('Login attempt for address:', address);
        
        if (!address) {
            res.status(400).json({ error: 'Address required' });
            return;
        }
        
        // Get repository directly
        const repo = AppDataSource.getRepository(User);
        console.log('Repository initialized');
        
        let user = await repo.findOne({ where: { address } });
        console.log('User lookup result:', user);
        
        if (!user) {
            console.log('Creating new user...');
            user = repo.create({ address });
            console.log('User object created:', user);
            await repo.save(user);
            console.log('User saved successfully');
        }
        
        const token = jwt.sign(
            { address }, 
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );
        
        res.json({ token, user });
    } catch (error: any) {
        console.error('Login error details:', error);
        res.status(500).json({ 
            error: 'Internal server error', 
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

export default router;
