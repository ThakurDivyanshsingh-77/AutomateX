import { body, validationResult } from 'express-validator';

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg || 'Validation failed',
      errors: errors.array().map((err) => ({ field: err.path, message: err.msg })),
    });
  }
  next();
};

export const createWorkflowValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Workflow name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Workflow name must be between 3 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array of strings'),

  handleValidationErrors,
];

export const updateWorkflowValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Workflow name must be between 3 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),

  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Invalid status value'),

  body('visibility')
    .optional()
    .isIn(['private', 'public'])
    .withMessage('Invalid visibility value'),

  handleValidationErrors,
];
