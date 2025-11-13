import { Router } from 'express';
import {
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} from '../controllers/employeeController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Tất cả routes đều cần authentication
router.use(authenticate);

// GET all employees - cả admin và employee đều có thể xem
router.get('/', getAllEmployees);

// GET employee by id - cả admin và employee đều có thể xem
router.get('/:id', getEmployeeById);

// UPDATE employee - chỉ admin
router.put('/:id', authorize('ADMIN'), updateEmployee);

// DELETE employee - chỉ admin
router.delete('/:id', authorize('ADMIN'), deleteEmployee);

export default router;
