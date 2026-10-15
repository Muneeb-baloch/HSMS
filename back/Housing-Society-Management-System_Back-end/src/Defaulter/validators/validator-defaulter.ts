import { body, param, query, ValidationChain } from 'express-validator';
import { DefaulterStatus } from '../models/models-defaulter-workflow';

export const validateGetDefaulters = (): ValidationChain[] => [
  query('search').optional().trim().isLength({ max: 200 }).withMessage('Search must be at most 200 characters'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('status').optional().isIn(Object.values(DefaulterStatus)).withMessage('Invalid status'),

  query('minAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum amount must be a positive number'),

  query('maxAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum amount must be a positive number'),

  query('minDays')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum days must be a non-negative integer'),

  query('maxDays')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum days must be a non-negative integer'),

  query('sortBy')
    .optional()
    .isIn(['daysOverdue', 'totalOverdue', 'installmentsOverdue', 'billsOverdue'])
    .withMessage('Invalid sort field'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be either "asc" or "desc"'),
];

export const validateFileIdParam = (): ValidationChain[] => [
  param('fileId')
    .trim()
    .notEmpty()
    .withMessage('File ID is required')
    .isMongoId()
    .withMessage('Invalid File ID'),
];

export const validateSetStatusOverride = (): ValidationChain[] => [
  body('status')
    .optional({ nullable: true })
    .isIn(Object.values(DefaulterStatus))
    .withMessage('Invalid status'),
];

export const validateSetRemarks = (): ValidationChain[] => [
  body('remarks')
    .notEmpty()
    .withMessage('Remarks are required')
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Remarks cannot exceed 1000 characters'),
];

export const validateSendNotice = (): ValidationChain[] => [
  body('noticeType')
    .notEmpty()
    .withMessage('Notice type is required')
    .isIn(['WARNING', 'FINAL', 'LEGAL'])
    .withMessage('Notice type must be WARNING, FINAL, or LEGAL'),

  body('noticeContent')
    .notEmpty()
    .withMessage('Notice content is required')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Notice content must be between 10 and 2000 characters'),

  body('sendMethod')
    .notEmpty()
    .withMessage('Send method is required')
    .isIn(['EMAIL', 'SMS', 'LETTER', 'ALL'])
    .withMessage('Send method must be EMAIL, SMS, LETTER, or ALL'),
];
