exports.up = function(knex) {
  return knex.schema
    // Users table for local authentication and Canvas user mapping
    .createTable('users', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(4))) || "-" || lower(hex(randomblob(2))) || "-4" || substr(lower(hex(randomblob(2))),2) || "-" || substr("89ab",abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || "-" || lower(hex(randomblob(6))))'));
      table.string('email').unique().notNullable();
      table.string('canvas_user_id').unique();
      table.string('canvas_access_token');
      table.string('canvas_refresh_token');
      table.timestamp('canvas_token_expires_at');
      table.string('canvas_domain');
      table.json('canvas_user_data');
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
      
      table.index(['email']);
      table.index(['canvas_user_id']);
    })
    
    // Canvas courses cache
    .createTable('courses', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(4))) || "-" || lower(hex(randomblob(2))) || "-4" || substr(lower(hex(randomblob(2))),2) || "-" || substr("89ab",abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || "-" || lower(hex(randomblob(6))))'));
      table.string('canvas_course_id').notNullable();
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.string('name').notNullable();
      table.string('course_code');
      table.text('description');
      table.string('workflow_state');
      table.timestamp('start_at');
      table.timestamp('end_at');
      table.json('canvas_data');
      table.timestamp('last_synced_at');
      table.timestamps(true, true);
      
      table.unique(['canvas_course_id', 'user_id']);
      table.index(['user_id']);
      table.index(['canvas_course_id']);
    })
    
    // Canvas modules cache
    .createTable('modules', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(4))) || "-" || lower(hex(randomblob(2))) || "-4" || substr(lower(hex(randomblob(2))),2) || "-" || substr("89ab",abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || "-" || lower(hex(randomblob(6))))'));
      table.string('canvas_module_id').notNullable();
      table.uuid('course_id').references('id').inTable('courses').onDelete('CASCADE');
      table.string('name').notNullable();
      table.text('description');
      table.integer('position');
      table.string('workflow_state');
      table.timestamp('unlock_at');
      table.json('prerequisites');
      table.json('requirement_count');
      table.json('canvas_data');
      table.timestamp('last_synced_at');
      table.timestamps(true, true);
      
      table.unique(['canvas_module_id', 'course_id']);
      table.index(['course_id']);
      table.index(['canvas_module_id']);
    })
    
    // Canvas assignments cache
    .createTable('assignments', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(4))) || "-" || lower(hex(randomblob(2))) || "-4" || substr(lower(hex(randomblob(2))),2) || "-" || substr("89ab",abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || "-" || lower(hex(randomblob(6))))'));
      table.string('canvas_assignment_id').notNullable();
      table.uuid('course_id').references('id').inTable('courses').onDelete('CASCADE');
      table.uuid('module_id').references('id').inTable('modules').onDelete('SET NULL');
      table.string('name').notNullable();
      table.text('description');
      table.timestamp('due_at');
      table.timestamp('unlock_at');
      table.timestamp('lock_at');
      table.decimal('points_possible', 10, 2);
      table.string('submission_types');
      table.string('workflow_state');
      table.integer('position');
      table.json('all_dates'); // For section overrides
      table.json('canvas_data');
      table.timestamp('last_synced_at');
      table.timestamps(true, true);
      
      table.unique(['canvas_assignment_id', 'course_id']);
      table.index(['course_id']);
      table.index(['module_id']);
      table.index(['due_at']);
    })
    
    // Module items (assignments, pages, etc.)
    .createTable('module_items', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(4))) || "-" || lower(hex(randomblob(2))) || "-4" || substr(lower(hex(randomblob(2))),2) || "-" || substr("89ab",abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || "-" || lower(hex(randomblob(6))))'));
      table.string('canvas_item_id').notNullable();
      table.uuid('module_id').references('id').inTable('modules').onDelete('CASCADE');
      table.string('title').notNullable();
      table.string('type'); // Assignment, Page, Discussion, etc.
      table.string('content_id'); // ID of the actual content (assignment_id, page_id, etc.)
      table.integer('position');
      table.string('workflow_state');
      table.json('completion_requirement');
      table.json('canvas_data');
      table.timestamp('last_synced_at');
      table.timestamps(true, true);
      
      table.unique(['canvas_item_id', 'module_id']);
      table.index(['module_id']);
      table.index(['type', 'content_id']);
    })
    
    // Enrollments cache
    .createTable('enrollments', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(4))) || "-" || lower(hex(randomblob(2))) || "-4" || substr(lower(hex(randomblob(2))),2) || "-" || substr("89ab",abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || "-" || lower(hex(randomblob(6))))'));
      table.string('canvas_enrollment_id').notNullable();
      table.uuid('course_id').references('id').inTable('courses').onDelete('CASCADE');
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.string('type'); // StudentEnrollment, TeacherEnrollment, etc.
      table.string('role');
      table.string('workflow_state');
      table.json('grades');
      table.json('canvas_data');
      table.timestamp('last_synced_at');
      table.timestamps(true, true);
      
      table.unique(['canvas_enrollment_id']);
      table.index(['course_id', 'user_id']);
      table.index(['user_id']);
    })
    
    // Sync jobs tracking
    .createTable('sync_jobs', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(4))) || "-" || lower(hex(randomblob(2))) || "-4" || substr(lower(hex(randomblob(2))),2) || "-" || substr("89ab",abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || "-" || lower(hex(randomblob(6))))'));
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.string('job_type').notNullable(); // full_sync, course_sync, module_sync, etc.
      table.string('status').defaultTo('pending'); // pending, running, completed, failed
      table.json('parameters');
      table.json('result');
      table.text('error_message');
      table.timestamp('started_at');
      table.timestamp('completed_at');
      table.timestamps(true, true);
      
      table.index(['user_id', 'status']);
      table.index(['job_type']);
    })
    
    // API rate limiting tracking
    .createTable('rate_limits', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(4))) || "-" || lower(hex(randomblob(2))) || "-4" || substr(lower(hex(randomblob(2))),2) || "-" || substr("89ab",abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || "-" || lower(hex(randomblob(6))))'));
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.string('endpoint');
      table.integer('requests_made').defaultTo(0);
      table.timestamp('window_start');
      table.timestamp('reset_at');
      table.timestamps(true, true);
      
      table.unique(['user_id', 'endpoint', 'window_start']);
      table.index(['user_id']);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('rate_limits')
    .dropTableIfExists('sync_jobs')
    .dropTableIfExists('enrollments')
    .dropTableIfExists('module_items')
    .dropTableIfExists('assignments')
    .dropTableIfExists('modules')
    .dropTableIfExists('courses')
    .dropTableIfExists('users');
};