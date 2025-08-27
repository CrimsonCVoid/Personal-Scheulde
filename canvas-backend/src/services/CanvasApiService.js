const axios = require('axios');
const logger = require('../utils/logger');
const RateLimiter = require('../utils/rateLimiter');

class CanvasApiService {
  constructor(canvasDomain, accessToken) {
    this.canvasDomain = canvasDomain;
    this.accessToken = accessToken;
    this.baseURL = `${canvasDomain}/api/v1`;
    this.rateLimiter = new RateLimiter();
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000
    });

    // Request interceptor for rate limiting
    this.client.interceptors.request.use(async (config) => {
      await this.rateLimiter.waitForSlot();
      logger.debug(`Canvas API Request: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        logger.debug(`Canvas API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        logger.error(`Canvas API Error: ${error.response?.status} ${error.config?.url}`, {
          error: error.response?.data,
          status: error.response?.status
        });
        return Promise.reject(error);
      }
    );
  }

  // COURSES
  async getCourses(params = {}) {
    const defaultParams = {
      enrollment_state: 'active',
      per_page: 100,
      include: ['term', 'course_progress', 'storage_quota_used_mb']
    };
    
    try {
      const response = await this.client.get('/courses', {
        params: { ...defaultParams, ...params }
      });
      return this.handlePaginatedResponse(response);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch courses');
    }
  }

  async getCourse(courseId, include = []) {
    try {
      const response = await this.client.get(`/courses/${courseId}`, {
        params: { include }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Failed to fetch course ${courseId}`);
    }
  }

  async createCourse(courseData) {
    try {
      const response = await this.client.post('/accounts/self/courses', {
        course: courseData
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to create course');
    }
  }

  async updateCourse(courseId, courseData) {
    try {
      const response = await this.client.put(`/courses/${courseId}`, {
        course: courseData
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Failed to update course ${courseId}`);
    }
  }

  // MODULES
  async getModules(courseId, params = {}) {
    const defaultParams = {
      include: ['items', 'content_details'],
      per_page: 100
    };

    try {
      const response = await this.client.get(`/courses/${courseId}/modules`, {
        params: { ...defaultParams, ...params }
      });
      return this.handlePaginatedResponse(response);
    } catch (error) {
      throw this.handleError(error, `Failed to fetch modules for course ${courseId}`);
    }
  }

  async getModule(courseId, moduleId, include = ['items']) {
    try {
      const response = await this.client.get(`/courses/${courseId}/modules/${moduleId}`, {
        params: { include }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Failed to fetch module ${moduleId}`);
    }
  }

  async createModule(courseId, moduleData) {
    try {
      const response = await this.client.post(`/courses/${courseId}/modules`, {
        module: moduleData
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Failed to create module in course ${courseId}`);
    }
  }

  async updateModule(courseId, moduleId, moduleData) {
    try {
      const response = await this.client.put(`/courses/${courseId}/modules/${moduleId}`, {
        module: moduleData
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Failed to update module ${moduleId}`);
    }
  }

  async deleteModule(courseId, moduleId) {
    try {
      const response = await this.client.delete(`/courses/${courseId}/modules/${moduleId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Failed to delete module ${moduleId}`);
    }
  }

  async reorderModules(courseId, moduleIds) {
    try {
      const response = await this.client.post(`/courses/${courseId}/modules/reorder`, {
        order: moduleIds
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Failed to reorder modules in course ${courseId}`);
    }
  }

  // MODULE ITEMS
  async getModuleItems(courseId, moduleId, params = {}) {
    const defaultParams = {
      include: ['content_details'],
      per_page: 100
    };

    try {
      const response = await this.client.get(`/courses/${courseId}/modules/${moduleId}/items`, {
        params: { ...defaultParams, ...params }
      });
      return this.handlePaginatedResponse(response);
    } catch (error) {
      throw this.handleError(error, `Failed to fetch items for module ${moduleId}`);
    }
  }

  async createModuleItem(courseId, moduleId, itemData) {
    try {
      const response = await this.client.post(`/courses/${courseId}/modules/${moduleId}/items`, {
        module_item: itemData
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Failed to create module item in module ${moduleId}`);
    }
  }

  async updateModuleItem(courseId, moduleId, itemId, itemData) {
    try {
      const response = await this.client.put(`/courses/${courseId}/modules/${moduleId}/items/${itemId}`, {
        module_item: itemData
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Failed to update module item ${itemId}`);
    }
  }

  async deleteModuleItem(courseId, moduleId, itemId) {
    try {
      const response = await this.client.delete(`/courses/${courseId}/modules/${moduleId}/items/${itemId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Failed to delete module item ${itemId}`);
    }
  }

  // ASSIGNMENTS
  async getAssignments(courseId, params = {}) {
    const defaultParams = {
      include: ['all_dates', 'overrides', 'submission'],
      per_page: 100
    };

    try {
      const response = await this.client.get(`/courses/${courseId}/assignments`, {
        params: { ...defaultParams, ...params }
      });
      return this.handlePaginatedResponse(response);
    } catch (error) {
      throw this.handleError(error, `Failed to fetch assignments for course ${courseId}`);
    }
  }

  async getAssignment(courseId, assignmentId, include = ['all_dates']) {
    try {
      const response = await this.client.get(`/courses/${courseId}/assignments/${assignmentId}`, {
        params: { include }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Failed to fetch assignment ${assignmentId}`);
    }
  }

  async createAssignment(courseId, assignmentData) {
    try {
      const response = await this.client.post(`/courses/${courseId}/assignments`, {
        assignment: assignmentData
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Failed to create assignment in course ${courseId}`);
    }
  }

  async updateAssignment(courseId, assignmentId, assignmentData) {
    try {
      const response = await this.client.put(`/courses/${courseId}/assignments/${assignmentId}`, {
        assignment: assignmentData
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Failed to update assignment ${assignmentId}`);
    }
  }

  async deleteAssignment(courseId, assignmentId) {
    try {
      const response = await this.client.delete(`/courses/${courseId}/assignments/${assignmentId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Failed to delete assignment ${assignmentId}`);
    }
  }

  // BULK OPERATIONS
  async bulkUpdateAssignmentDates(courseId, updates) {
    const results = [];
    const errors = [];

    for (const update of updates) {
      try {
        const result = await this.updateAssignment(courseId, update.assignmentId, {
          due_at: update.dueAt,
          unlock_at: update.unlockAt,
          lock_at: update.lockAt
        });
        results.push(result);
      } catch (error) {
        errors.push({
          assignmentId: update.assignmentId,
          error: error.message
        });
      }
    }

    return { results, errors };
  }

  // ENROLLMENTS
  async getEnrollments(courseId, params = {}) {
    const defaultParams = {
      per_page: 100,
      include: ['user', 'grades']
    };

    try {
      const response = await this.client.get(`/courses/${courseId}/enrollments`, {
        params: { ...defaultParams, ...params }
      });
      return this.handlePaginatedResponse(response);
    } catch (error) {
      throw this.handleError(error, `Failed to fetch enrollments for course ${courseId}`);
    }
  }

  async enrollUser(courseId, userId, enrollmentData) {
    try {
      const response = await this.client.post(`/courses/${courseId}/enrollments`, {
        enrollment: {
          user_id: userId,
          ...enrollmentData
        }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Failed to enroll user ${userId} in course ${courseId}`);
    }
  }

  // PLANNER
  async getPlannerItems(startDate, endDate, contextCodes = []) {
    try {
      const params = {
        start_date: startDate,
        end_date: endDate,
        per_page: 100
      };

      if (contextCodes.length > 0) {
        params.context_codes = contextCodes;
      }

      const response = await this.client.get('/planner/items', { params });
      return this.handlePaginatedResponse(response);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch planner items');
    }
  }

  // CALENDAR EVENTS
  async getCalendarEvents(startDate, endDate, contextCodes = [], type = 'assignment') {
    try {
      const params = {
        start_date: startDate,
        end_date: endDate,
        type,
        per_page: 100
      };

      if (contextCodes.length > 0) {
        contextCodes.forEach(code => {
          params[`context_codes[]`] = code;
        });
      }

      const response = await this.client.get('/calendar_events', { params });
      return this.handlePaginatedResponse(response);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch calendar events');
    }
  }

  // UTILITY METHODS
  async handlePaginatedResponse(response) {
    let allData = response.data;
    let nextUrl = this.getNextPageUrl(response.headers.link);

    while (nextUrl) {
      try {
        const nextResponse = await this.client.get(nextUrl);
        allData = allData.concat(nextResponse.data);
        nextUrl = this.getNextPageUrl(nextResponse.headers.link);
      } catch (error) {
        logger.warn('Failed to fetch next page:', error.message);
        break;
      }
    }

    return allData;
  }

  getNextPageUrl(linkHeader) {
    if (!linkHeader) return null;
    
    const links = linkHeader.split(',');
    const nextLink = links.find(link => link.includes('rel="next"'));
    
    if (nextLink) {
      const match = nextLink.match(/<([^>]+)>/);
      return match ? match[1].replace(this.baseURL, '') : null;
    }
    
    return null;
  }

  handleError(error, message) {
    const canvasError = {
      message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      originalError: error.message
    };

    logger.error('Canvas API Error:', canvasError);
    
    return new Error(`${message}: ${error.response?.data?.message || error.message}`);
  }
}

module.exports = CanvasApiService;