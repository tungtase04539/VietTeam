import { Router } from 'express';
import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  updateEmployeeRole,
} from '../controllers/employeeController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Tất cả routes đều cần authentication
router.use(authenticate);

// CREATE employee - chỉ admin
router.post('/', authorize('ADMIN'), createEmployee);

// GET all employees - cả admin và employee đều có thể xem
router.get('/', getAllEmployees);

// GET employee by id - cả admin và employee đều có thể xem
router.get('/:id', getEmployeeById);

// UPDATE employee - chỉ admin
router.put('/:id', authorize('ADMIN'), updateEmployee);

// UPDATE employee role - chỉ admin
router.patch('/:id/role', authorize('ADMIN'), updateEmployeeRole);

// DELETE employee - chỉ admin
router.delete('/:id', authorize('ADMIN'), deleteEmployee);

export default router;
