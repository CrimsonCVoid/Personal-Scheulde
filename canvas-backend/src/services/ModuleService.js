const CanvasApiService = require('./CanvasApiService');
const database = require('../database/connection');
const logger = require('../utils/logger');

class ModuleService {
  constructor(user) {
    this.user = user;
    this.canvasApi = new CanvasApiService(user.canvas_domain, user.canvas_access_token);
  }

  async getModules(courseId, options = {}) {
    const { forceSync = false } = options;
    
    try {
      // Get local course record
      const course = await database('courses')
        .where({ canvas_course_id: courseId, user_id: this.user.id })
        .first();
        
      if (!course) {
        throw new Error('Course not found');
      }

      // Check if we need to sync
      const shouldSync = forceSync || this.shouldSync(course.last_synced_at);
      
      if (shouldSync) {
        await this.syncModules(course.id, courseId);
      }

      // Return cached modules with items
      const modules = await database('modules')
        .where({ course_id: course.id })
        .orderBy('position', 'asc');

      // Get module items for each module
      for (const module of modules) {
        module.items = await database('module_items')
          .where({ module_id: module.id })
          .orderBy('position', 'asc');
      }

      return modules;
    } catch (error) {
      logger.error('Failed to get modules:', error);
      throw error;
    }
  }

  async getModule(courseId, moduleId, options = {}) {
    const { includeItems = true } = options;
    
    try {
      const course = await database('courses')
        .where({ canvas_course_id: courseId, user_id: this.user.id })
        .first();
        
      if (!course) {
        throw new Error('Course not found');
      }

      const module = await database('modules')
        .where({ 
          canvas_module_id: moduleId, 
          course_id: course.id 
        })
        .first();

      if (!module) {
        // Try to fetch from Canvas and sync
        const canvasModule = await this.canvasApi.getModule(courseId, moduleId);
        return await this.syncSingleModule(course.id, canvasModule);
      }

      if (includeItems) {
        module.items = await database('module_items')
          .where({ module_id: module.id })
          .orderBy('position', 'asc');
      }

      return module;
    } catch (error) {
      logger.error('Failed to get module:', error);
      throw error;
    }
  }

  async createModule(courseId, moduleData) {
    try {
      // Create in Canvas first
      const canvasModule = await this.canvasApi.createModule(courseId, moduleData);
      
      // Get local course record
      const course = await database('courses')
        .where({ canvas_course_id: courseId, user_id: this.user.id })
        .first();
        
      if (!course) {
        throw new Error('Course not found');
      }

      // Save to local database
      const localModule = await this.syncSingleModule(course.id, canvasModule);
      
      return localModule;
    } catch (error) {
      logger.error('Failed to create module:', error);
      throw error;
    }
  }

  async updateModule(courseId, moduleId, updateData) {
    try {
      // Update in Canvas first
      const canvasModule = await this.canvasApi.updateModule(courseId, moduleId, updateData);
      
      // Get local course record
      const course = await database('courses')
        .where({ canvas_course_id: courseId, user_id: this.user.id })
        .first();
        
      if (!course) {
        throw new Error('Course not found');
      }

      // Update local database
      const localModule = await this.syncSingleModule(course.id, canvasModule);
      
      return localModule;
    } catch (error) {
      logger.error('Failed to update module:', error);
      throw error;
    }
  }

  async deleteModule(courseId, moduleId) {
    try {
      // Delete from Canvas first
      await this.canvasApi.deleteModule(courseId, moduleId);
      
      // Get local course record
      const course = await database('courses')
        .where({ canvas_course_id: courseId, user_id: this.user.id })
        .first();
        
      if (!course) {
        throw new Error('Course not found');
      }

      // Delete from local database
      await database('modules')
        .where({ 
          canvas_module_id: moduleId, 
          course_id: course.id 
        })
        .del();
        
      return true;
    } catch (error) {
      logger.error('Failed to delete module:', error);
      throw error;
    }
  }

  async reorderModules(courseId, moduleIds) {
    try {
      // Reorder in Canvas first
      const result = await this.canvasApi.reorderModules(courseId, moduleIds);
      
      // Update positions in local database
      const course = await database('courses')
        .where({ canvas_course_id: courseId, user_id: this.user.id })
        .first();
        
      if (course) {
        for (let i = 0; i < moduleIds.length; i++) {
          await database('modules')
            .where({ 
              canvas_module_id: moduleIds[i], 
              course_id: course.id 
            })
            .update({ position: i + 1 });
        }
      }
      
      return result;
    } catch (error) {
      logger.error('Failed to reorder modules:', error);
      throw error;
    }
  }

  async createModuleItem(courseId, moduleId, itemData) {
    try {
      // Create in Canvas first
      const canvasItem = await this.canvasApi.createModuleItem(courseId, moduleId, itemData);
      
      // Get local module record
      const course = await database('courses')
        .where({ canvas_course_id: courseId, user_id: this.user.id })
        .first();
        
      const module = await database('modules')
        .where({ 
          canvas_module_id: moduleId, 
          course_id: course.id 
        })
        .first();

      if (!module) {
        throw new Error('Module not found');
      }

      // Save to local database
      const localItem = await this.syncSingleModuleItem(module.id, canvasItem);
      
      return localItem;
    } catch (error) {
      logger.error('Failed to create module item:', error);
      throw error;
    }
  }

  async updateModuleItem(courseId, moduleId, itemId, updateData) {
    try {
      // Update in Canvas first
      const canvasItem = await this.canvasApi.updateModuleItem(courseId, moduleId, itemId, updateData);
      
      // Get local module record
      const course = await database('courses')
        .where({ canvas_course_id: courseId, user_id: this.user.id })
        .first();
        
      const module = await database('modules')
        .where({ 
          canvas_module_id: moduleId, 
          course_id: course.id 
        })
        .first();

      if (!module) {
        throw new Error('Module not found');
      }

      // Update local database
      const localItem = await this.syncSingleModuleItem(module.id, canvasItem);
      
      return localItem;
    } catch (error) {
      logger.error('Failed to update module item:', error);
      throw error;
    }
  }

  async deleteModuleItem(courseId, moduleId, itemId) {
    try {
      // Delete from Canvas first
      await this.canvasApi.deleteModuleItem(courseId, moduleId, itemId);
      
      // Get local module record
      const course = await database('courses')
        .where({ canvas_course_id: courseId, user_id: this.user.id })
        .first();
        
      const module = await database('modules')
        .where({ 
          canvas_module_id: moduleId, 
          course_id: course.id 
        })
        .first();

      if (module) {
        // Delete from local database
        await database('module_items')
          .where({ 
            canvas_item_id: itemId, 
            module_id: module.id 
          })
          .del();
      }
        
      return true;
    } catch (error) {
      logger.error('Failed to delete module item:', error);
      throw error;
    }
  }

  // SYNC METHODS
  async syncModules(courseId, canvasCourseId) {
    try {
      logger.info(`Syncing modules for course ${canvasCourseId}`);
      
      const canvasModules = await this.canvasApi.getModules(canvasCourseId);
      
      for (const canvasModule of canvasModules) {
        await this.syncSingleModule(courseId, canvasModule);
        
        // Sync module items if included
        if (canvasModule.items) {
          for (const item of canvasModule.items) {
            const localModule = await database('modules')
              .where({ 
                canvas_module_id: canvasModule.id, 
                course_id: courseId 
              })
              .first();
              
            if (localModule) {
              await this.syncSingleModuleItem(localModule.id, item);
            }
          }
        }
      }
      
      // Update course sync timestamp
      await database('courses')
        .where({ id: courseId })
        .update({ last_synced_at: new Date() });
        
      logger.info(`Successfully synced ${canvasModules.length} modules`);
    } catch (error) {
      logger.error('Failed to sync modules:', error);
      throw error;
    }
  }

  async syncSingleModule(courseId, canvasModule) {
    const moduleData = {
      canvas_module_id: canvasModule.id.toString(),
      course_id: courseId,
      name: canvasModule.name,
      description: canvasModule.description,
      position: canvasModule.position,
      workflow_state: canvasModule.workflow_state,
      unlock_at: canvasModule.unlock_at,
      prerequisites: JSON.stringify(canvasModule.prerequisites || []),
      requirement_count: JSON.stringify(canvasModule.requirement_count || {}),
      canvas_data: JSON.stringify(canvasModule),
      last_synced_at: new Date()
    };

    const existing = await database('modules')
      .where({ 
        canvas_module_id: canvasModule.id.toString(), 
        course_id: courseId 
      })
      .first();

    if (existing) {
      await database('modules')
        .where({ id: existing.id })
        .update(moduleData);
      return { ...existing, ...moduleData };
    } else {
      const [id] = await database('modules').insert(moduleData);
      return { id, ...moduleData };
    }
  }

  async syncSingleModuleItem(moduleId, canvasItem) {
    const itemData = {
      canvas_item_id: canvasItem.id.toString(),
      module_id: moduleId,
      title: canvasItem.title,
      type: canvasItem.type,
      content_id: canvasItem.content_id?.toString(),
      position: canvasItem.position,
      workflow_state: canvasItem.workflow_state,
      completion_requirement: JSON.stringify(canvasItem.completion_requirement || {}),
      canvas_data: JSON.stringify(canvasItem),
      last_synced_at: new Date()
    };

    const existing = await database('module_items')
      .where({ 
        canvas_item_id: canvasItem.id.toString(), 
        module_id: moduleId 
      })
      .first();

    if (existing) {
      await database('module_items')
        .where({ id: existing.id })
        .update(itemData);
      return { ...existing, ...itemData };
    } else {
      const [id] = await database('module_items').insert(itemData);
      return { id, ...itemData };
    }
  }

  shouldSync(lastSyncedAt) {
    if (!lastSyncedAt) return true;
    
    const syncInterval = parseInt(process.env.SYNC_INTERVAL_MINUTES) || 30;
    const now = new Date();
    const lastSync = new Date(lastSyncedAt);
    const diffMinutes = (now - lastSync) / (1000 * 60);
    
    return diffMinutes > syncInterval;
  }
}

module.exports = ModuleService;