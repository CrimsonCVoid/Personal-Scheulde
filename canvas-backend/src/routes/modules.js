const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const ModuleService = require('../services/ModuleService');
const logger = require('../utils/logger');

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      details: errors.array()
    });
  }
  next();
};

// GET /api/modules/:courseId - Get all modules for a course
router.get('/:courseId',
  [
    param('courseId').isString().notEmpty(),
    query('sync').optional().isBoolean()
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { courseId } = req.params;
      const { sync = false } = req.query;
      
      const moduleService = new ModuleService(req.user);
      const modules = await moduleService.getModules(courseId, { forceSync: sync });
      
      res.json({
        success: true,
        data: modules,
        meta: {
          count: modules.length,
          courseId
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/modules/:courseId/:moduleId - Get specific module
router.get('/:courseId/:moduleId',
  [
    param('courseId').isString().notEmpty(),
    param('moduleId').isString().notEmpty(),
    query('include_items').optional().isBoolean()
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { courseId, moduleId } = req.params;
      const { include_items = true } = req.query;
      
      const moduleService = new ModuleService(req.user);
      const module = await moduleService.getModule(courseId, moduleId, { includeItems: include_items });
      
      if (!module) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Module not found'
        });
      }
      
      res.json({
        success: true,
        data: module
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/modules/:courseId - Create new module
router.post('/:courseId',
  [
    param('courseId').isString().notEmpty(),
    body('name').isString().isLength({ min: 1, max: 255 }),
    body('description').optional().isString(),
    body('position').optional().isInt({ min: 1 }),
    body('unlock_at').optional().isISO8601(),
    body('prerequisites').optional().isArray(),
    body('requirement_count').optional().isObject()
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { courseId } = req.params;
      const moduleData = req.body;
      
      const moduleService = new ModuleService(req.user);
      const module = await moduleService.createModule(courseId, moduleData);
      
      logger.info(`Module created: ${module.id} in course ${courseId}`, {
        userId: req.user.id,
        moduleId: module.id
      });
      
      res.status(201).json({
        success: true,
        data: module,
        message: 'Module created successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/modules/:courseId/:moduleId - Update module
router.put('/:courseId/:moduleId',
  [
    param('courseId').isString().notEmpty(),
    param('moduleId').isString().notEmpty(),
    body('name').optional().isString().isLength({ min: 1, max: 255 }),
    body('description').optional().isString(),
    body('position').optional().isInt({ min: 1 }),
    body('unlock_at').optional().isISO8601(),
    body('prerequisites').optional().isArray(),
    body('requirement_count').optional().isObject(),
    body('workflow_state').optional().isIn(['active', 'unpublished'])
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { courseId, moduleId } = req.params;
      const updateData = req.body;
      
      const moduleService = new ModuleService(req.user);
      const module = await moduleService.updateModule(courseId, moduleId, updateData);
      
      logger.info(`Module updated: ${moduleId} in course ${courseId}`, {
        userId: req.user.id,
        changes: Object.keys(updateData)
      });
      
      res.json({
        success: true,
        data: module,
        message: 'Module updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/modules/:courseId/:moduleId - Delete module
router.delete('/:courseId/:moduleId',
  [
    param('courseId').isString().notEmpty(),
    param('moduleId').isString().notEmpty()
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { courseId, moduleId } = req.params;
      
      const moduleService = new ModuleService(req.user);
      await moduleService.deleteModule(courseId, moduleId);
      
      logger.info(`Module deleted: ${moduleId} from course ${courseId}`, {
        userId: req.user.id
      });
      
      res.json({
        success: true,
        message: 'Module deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/modules/:courseId/reorder - Reorder modules
router.post('/:courseId/reorder',
  [
    param('courseId').isString().notEmpty(),
    body('module_ids').isArray().notEmpty(),
    body('module_ids.*').isString()
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { courseId } = req.params;
      const { module_ids } = req.body;
      
      const moduleService = new ModuleService(req.user);
      const result = await moduleService.reorderModules(courseId, module_ids);
      
      logger.info(`Modules reordered in course ${courseId}`, {
        userId: req.user.id,
        moduleCount: module_ids.length
      });
      
      res.json({
        success: true,
        data: result,
        message: 'Modules reordered successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/modules/:courseId/:moduleId/items - Create module item
router.post('/:courseId/:moduleId/items',
  [
    param('courseId').isString().notEmpty(),
    param('moduleId').isString().notEmpty(),
    body('title').isString().isLength({ min: 1, max: 255 }),
    body('type').isIn(['Assignment', 'Quiz', 'Page', 'Discussion', 'SubHeader', 'ExternalUrl', 'ExternalTool']),
    body('content_id').optional().isString(),
    body('position').optional().isInt({ min: 1 }),
    body('completion_requirement').optional().isObject()
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { courseId, moduleId } = req.params;
      const itemData = req.body;
      
      const moduleService = new ModuleService(req.user);
      const item = await moduleService.createModuleItem(courseId, moduleId, itemData);
      
      logger.info(`Module item created: ${item.id} in module ${moduleId}`, {
        userId: req.user.id,
        itemType: itemData.type
      });
      
      res.status(201).json({
        success: true,
        data: item,
        message: 'Module item created successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/modules/:courseId/:moduleId/items/:itemId - Update module item
router.put('/:courseId/:moduleId/items/:itemId',
  [
    param('courseId').isString().notEmpty(),
    param('moduleId').isString().notEmpty(),
    param('itemId').isString().notEmpty(),
    body('title').optional().isString().isLength({ min: 1, max: 255 }),
    body('position').optional().isInt({ min: 1 }),
    body('completion_requirement').optional().isObject()
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { courseId, moduleId, itemId } = req.params;
      const updateData = req.body;
      
      const moduleService = new ModuleService(req.user);
      const item = await moduleService.updateModuleItem(courseId, moduleId, itemId, updateData);
      
      logger.info(`Module item updated: ${itemId} in module ${moduleId}`, {
        userId: req.user.id,
        changes: Object.keys(updateData)
      });
      
      res.json({
        success: true,
        data: item,
        message: 'Module item updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/modules/:courseId/:moduleId/items/:itemId - Delete module item
router.delete('/:courseId/:moduleId/items/:itemId',
  [
    param('courseId').isString().notEmpty(),
    param('moduleId').isString().notEmpty(),
    param('itemId').isString().notEmpty()
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { courseId, moduleId, itemId } = req.params;
      
      const moduleService = new ModuleService(req.user);
      await moduleService.deleteModuleItem(courseId, moduleId, itemId);
      
      logger.info(`Module item deleted: ${itemId} from module ${moduleId}`, {
        userId: req.user.id
      });
      
      res.json({
        success: true,
        message: 'Module item deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;