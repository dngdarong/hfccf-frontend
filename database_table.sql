-- HFCCF auth schema aligned to the current frontend system.
-- Database target: MySQL / MariaDB
--
-- This file is based on the actual Vue auth model in:
-- - src/mocks/users.json
-- - src/services/auth.js
-- - src/services/mappers/userMapper.js
-- - src/constants/roles.js
-- - src/constants/access.js
-- - src/services/accessControl.js
-- - src/mocks/sport/admin-dashboard-data.json
-- - src/mocks/sport/teams-management-data.json
--
-- Important:
-- 1. User IDs in this system are strings like `usr_001`, not bigint IDs.
-- 2. The role code `adminscholaship` is intentionally kept as-is because the
--    frontend currently uses that exact value.
-- 3. Frontend RBAC is scope + domain based, so roles should persist both.
-- 4. Sanctum-style tokens must therefore use a string `tokenable_id`.
-- 5. Profile, settings, and website-team data below are the backend contract for
--    the current frontend, so keep them aligned when the UI changes later.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `personal_access_tokens`;
DROP TABLE IF EXISTS `password_change_requests`;
DROP TABLE IF EXISTS `sport_standings`;
DROP TABLE IF EXISTS `sport_top_scorers`;
DROP TABLE IF EXISTS `sport_matches`;
DROP TABLE IF EXISTS `sport_tournament_alerts`;
DROP TABLE IF EXISTS `sport_players`;
DROP TABLE IF EXISTS `sport_teams`;
DROP TABLE IF EXISTS `sport_tournaments`;
DROP TABLE IF EXISTS `website_team_expertise`;
DROP TABLE IF EXISTS `website_team_departments`;
DROP TABLE IF EXISTS `departments`;
DROP TABLE IF EXISTS `user_permissions`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `role_permissions`;
DROP TABLE IF EXISTS `permissions`;
DROP TABLE IF EXISTS `roles`;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE `roles` (
  `code` VARCHAR(32) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `scope` ENUM('super_admin', 'admin', 'staff') NOT NULL,
  `domain_code` ENUM('global', 'english', 'preschool', 'scholarship', 'sport') NOT NULL,
  `department` VARCHAR(32) NOT NULL,
  `sort_order` TINYINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`code`),
  KEY `roles_scope_index` (`scope`),
  KEY `roles_domain_code_index` (`domain_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `permissions` (
  `code` VARCHAR(64) NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `role_permissions` (
  `role_code` VARCHAR(32) NOT NULL,
  `permission_code` VARCHAR(64) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`role_code`, `permission_code`),
  CONSTRAINT `fk_role_permissions_role`
    FOREIGN KEY (`role_code`) REFERENCES `roles` (`code`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_role_permissions_permission`
    FOREIGN KEY (`permission_code`) REFERENCES `permissions` (`code`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `users` (
  `id` VARCHAR(16) NOT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `username` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(32) DEFAULT NULL,
  `role_code` VARCHAR(32) NOT NULL,
  `department` VARCHAR(32) NOT NULL,
  `bio` TEXT DEFAULT NULL,
  `status` ENUM('active', 'pending', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
  `avatar` VARCHAR(2048) DEFAULT NULL,
  `password` VARCHAR(255) NOT NULL,
  `email_verified_at` TIMESTAMP NULL DEFAULT NULL,
  `last_login_at` TIMESTAMP NULL DEFAULT NULL,
  `remember_token` VARCHAR(100) DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_role_code_index` (`role_code`),
  KEY `users_status_index` (`status`),
  KEY `users_department_index` (`department`),
  CONSTRAINT `fk_users_role`
    FOREIGN KEY (`role_code`) REFERENCES `roles` (`code`)
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `departments` (
  `code` VARCHAR(32) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `display_order` TINYINT UNSIGNED NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`code`),
  KEY `departments_is_active_index` (`is_active`),
  KEY `departments_display_order_index` (`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `website_team_departments` (
  `code` VARCHAR(64) NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `expertise` JSON NOT NULL,
  `display_order` TINYINT UNSIGNED NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`code`),
  KEY `website_team_departments_is_active_index` (`is_active`),
  KEY `website_team_departments_display_order_index` (`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `website_team_expertise` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `department_code` VARCHAR(64) NOT NULL,
  `expertise_text` VARCHAR(191) NOT NULL,
  `display_order` TINYINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `website_team_expertise_department_order_unique` (`department_code`, `display_order`),
  KEY `website_team_expertise_department_index` (`department_code`),
  CONSTRAINT `fk_website_team_expertise_department`
    FOREIGN KEY (`department_code`) REFERENCES `website_team_departments` (`code`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `password_change_requests` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` VARCHAR(16) NOT NULL,
  `new_password_hash` VARCHAR(255) NOT NULL,
  `status` ENUM('pending', 'approved', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending',
  `approval_note` VARCHAR(255) DEFAULT NULL,
  `requested_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `reviewed_by` VARCHAR(16) DEFAULT NULL,
  `reviewed_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `password_change_requests_user_index` (`user_id`),
  KEY `password_change_requests_status_index` (`status`),
  KEY `password_change_requests_reviewed_by_index` (`reviewed_by`),
  CONSTRAINT `fk_password_change_requests_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_password_change_requests_reviewed_by`
    FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_permissions` (
  `user_id` VARCHAR(16) NOT NULL,
  `permission_code` VARCHAR(64) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`, `permission_code`),
  CONSTRAINT `fk_user_permissions_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_user_permissions_permission`
    FOREIGN KEY (`permission_code`) REFERENCES `permissions` (`code`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `personal_access_tokens` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tokenable_type` VARCHAR(255) NOT NULL DEFAULT 'App\\Models\\User',
  `tokenable_id` VARCHAR(16) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `token` VARCHAR(64) NOT NULL,
  `abilities` TEXT NULL,
  `last_used_at` TIMESTAMP NULL DEFAULT NULL,
  `expires_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_index` (`tokenable_type`, `tokenable_id`),
  CONSTRAINT `fk_personal_access_tokens_user`
    FOREIGN KEY (`tokenable_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sport module source entities currently used by the frontend.
-- Notes:
-- 1. Coach accounts already live in `users` with role_code = 'coach'.
-- 2. Dashboard "cards" such as total teams or upcoming matches are aggregate KPIs
--    and should usually be derived from source tables instead of stored directly.
-- 3. The current frontend mock data stores team/player names as strings, so the
--    schema below keeps that shape instead of over-normalizing prematurely.

CREATE TABLE `sport_tournaments` (
  `id` VARCHAR(16) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `subtitle` VARCHAR(255) DEFAULT NULL,
  `location` VARCHAR(191) DEFAULT NULL,
  `status` VARCHAR(32) NOT NULL,
  `planned_matches` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `sport_tournaments_status_index` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `sport_teams` (
  `id` VARCHAR(16) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `division` VARCHAR(100) NOT NULL,
  `coach_name` VARCHAR(191) DEFAULT NULL,
  `captain_name` VARCHAR(191) DEFAULT NULL,
  `players_count` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `status` ENUM('active', 'pending', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
  `venue` VARCHAR(191) DEFAULT NULL,
  `wins` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `draws` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `losses` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `points` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `sport_teams_status_index` (`status`),
  KEY `sport_teams_division_index` (`division`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Players are data records (not system users). Keep player lifecycle separate from user/account lifecycle.
-- This table is the backend contract for the Sport Admin "Player Information" UI.
CREATE TABLE `sport_players` (
  `id` VARCHAR(16) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  -- Profile image is stored as a URL/path (actual file storage handled by the backend).
  `profile_image` VARCHAR(2048) DEFAULT NULL,
  `phone` VARCHAR(32) DEFAULT NULL,
  `gender` ENUM('male', 'female', 'other') DEFAULT NULL,
  `age` TINYINT UNSIGNED DEFAULT NULL,

  -- Personal information (captured on the player record).
  `height_cm` SMALLINT UNSIGNED DEFAULT NULL,
  `weight_kg` DECIMAL(5, 2) UNSIGNED DEFAULT NULL,
  `preferred_foot` ENUM('Right', 'Left', 'Both') DEFAULT NULL,
  `blood_type` ENUM('A', 'B', 'AB', 'O') DEFAULT NULL,
  `village` VARCHAR(100) DEFAULT NULL,
  `commune` VARCHAR(100) DEFAULT NULL,
  `district` VARCHAR(100) DEFAULT NULL,
  `province` VARCHAR(100) DEFAULT NULL,
  `current_school` VARCHAR(191) DEFAULT NULL,
  `grade_year` VARCHAR(64) DEFAULT NULL,

  -- Sports profile & administrative status.
  `team_id` VARCHAR(16) DEFAULT NULL,
  `team_name` VARCHAR(191) NOT NULL,
  `division` VARCHAR(100) NOT NULL,
  `primary_position` VARCHAR(64) DEFAULT NULL,
  `registration_status` ENUM('registered', 'pending', 'unregistered') NOT NULL DEFAULT 'registered',

  -- Player record status (separate from system users).
  `jersey_number` SMALLINT UNSIGNED DEFAULT NULL,
  `status` ENUM('active', 'pending', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
  `matches_played` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `goals_scored` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `sport_players_team_index` (`team_id`),
  KEY `sport_players_primary_position_index` (`primary_position`),
  KEY `sport_players_status_index` (`status`),
  KEY `sport_players_registration_status_index` (`registration_status`),
  KEY `sport_players_gender_index` (`gender`),
  KEY `sport_players_division_index` (`division`),
  CONSTRAINT `fk_sport_players_team`
    FOREIGN KEY (`team_id`) REFERENCES `sport_teams` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `sport_tournament_alerts` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tournament_id` VARCHAR(16) NOT NULL,
  `alert_type` ENUM('info', 'warning', 'error', 'success') NOT NULL,
  `message` VARCHAR(255) NOT NULL,
  `display_order` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `sport_tournament_alerts_tournament_index` (`tournament_id`),
  CONSTRAINT `fk_sport_tournament_alerts_tournament`
    FOREIGN KEY (`tournament_id`) REFERENCES `sport_tournaments` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `sport_matches` (
  `id` VARCHAR(16) NOT NULL,
  `tournament_id` VARCHAR(16) DEFAULT NULL,
  `home_team_name` VARCHAR(191) NOT NULL,
  `away_team_name` VARCHAR(191) NOT NULL,
  `venue` VARCHAR(191) DEFAULT NULL,
  `match_group` ENUM('live', 'today', 'general') NOT NULL DEFAULT 'general',
  `status` ENUM('scheduled', 'live', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled',
  `display_time_label` VARCHAR(64) DEFAULT NULL,
  `live_minute` VARCHAR(16) DEFAULT NULL,
  `display_order` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `sport_matches_tournament_index` (`tournament_id`),
  KEY `sport_matches_status_index` (`status`),
  KEY `sport_matches_group_index` (`match_group`),
  CONSTRAINT `fk_sport_matches_tournament`
    FOREIGN KEY (`tournament_id`) REFERENCES `sport_tournaments` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `sport_top_scorers` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tournament_id` VARCHAR(16) DEFAULT NULL,
  `player_name` VARCHAR(191) NOT NULL,
  `team_name` VARCHAR(191) NOT NULL,
  `goals` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `display_order` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `sport_top_scorers_tournament_index` (`tournament_id`),
  CONSTRAINT `fk_sport_top_scorers_tournament`
    FOREIGN KEY (`tournament_id`) REFERENCES `sport_tournaments` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `sport_standings` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tournament_id` VARCHAR(16) DEFAULT NULL,
  `position` SMALLINT UNSIGNED NOT NULL,
  `team_name` VARCHAR(191) NOT NULL,
  `played` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `wins` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `draws` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `losses` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `goals_for` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `goals_against` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `goal_difference` VARCHAR(16) NOT NULL DEFAULT '0',
  `points` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sport_standings_tournament_position_unique` (`tournament_id`, `position`),
  KEY `sport_standings_tournament_index` (`tournament_id`),
  CONSTRAINT `fk_sport_standings_tournament`
    FOREIGN KEY (`tournament_id`) REFERENCES `sport_tournaments` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `roles` (`code`, `name`, `scope`, `domain_code`, `department`, `sort_order`) VALUES
  ('superadmin', 'Super Admin', 'super_admin', 'global', 'Operations', 1),
  ('adminenglish', 'English Admin', 'admin', 'english', 'Education', 2),
  ('adminpreschool', 'Preschool Admin', 'admin', 'preschool', 'Education', 3),
  ('adminscholaship', 'Scholarship Admin', 'admin', 'scholarship', 'Education', 4),
  ('adminsport', 'Sport Admin', 'admin', 'sport', 'Sports', 5),
  ('teacher-english', 'English Teacher', 'staff', 'english', 'Education', 6),
  ('teacher-preschool', 'Preschool Teacher', 'staff', 'preschool', 'Education', 7),
  ('teacher-scholarship', 'Scholarship Teacher', 'staff', 'scholarship', 'Education', 8),
  ('coach', 'Coach', 'staff', 'sport', 'Sports', 9);

INSERT INTO `permissions` (`code`, `name`) VALUES
  ('all:*', 'Full system access'),
  ('athletes:read', 'Read athletes'),
  ('dashboard:read', 'Read dashboard'),
  ('programs:write', 'Manage programs'),
  ('reports:read', 'Read reports'),
  ('settings:read', 'Read settings'),
  ('tasks:read', 'Read tasks'),
  ('tasks:write', 'Manage tasks'),
  ('training:write', 'Manage training'),
  ('users:read', 'Read users'),
  ('users:write', 'Manage users');

INSERT INTO `role_permissions` (`role_code`, `permission_code`) VALUES
  ('superadmin', 'all:*'),

  ('adminenglish', 'dashboard:read'),
  ('adminenglish', 'users:read'),
  ('adminenglish', 'reports:read'),
  ('adminenglish', 'programs:write'),

  ('adminpreschool', 'dashboard:read'),
  ('adminpreschool', 'users:read'),
  ('adminpreschool', 'users:write'),
  ('adminpreschool', 'reports:read'),
  ('adminpreschool', 'settings:read'),

  ('adminscholaship', 'dashboard:read'),
  ('adminscholaship', 'users:read'),
  ('adminscholaship', 'users:write'),
  ('adminscholaship', 'reports:read'),
  ('adminscholaship', 'settings:read'),

  ('adminsport', 'dashboard:read'),
  ('adminsport', 'users:read'),
  ('adminsport', 'reports:read'),
  ('adminsport', 'programs:write'),

  ('coach', 'dashboard:read'),
  ('coach', 'athletes:read'),
  ('coach', 'training:write'),

  ('teacher-english', 'dashboard:read'),
  ('teacher-english', 'tasks:read'),
  ('teacher-english', 'tasks:write'),

  ('teacher-preschool', 'dashboard:read'),
  ('teacher-preschool', 'tasks:read'),
  ('teacher-preschool', 'tasks:write'),

  ('teacher-scholarship', 'dashboard:read'),
  ('teacher-scholarship', 'tasks:read'),
  ('teacher-scholarship', 'tasks:write');

INSERT INTO `departments` (`code`, `name`, `display_order`, `is_active`) VALUES
  ('operations', 'Operations', 1, 1),
  ('education', 'Education', 2, 1),
  ('sports', 'Sports', 3, 1),
  ('administration', 'Administration', 4, 1);

INSERT INTO `website_team_departments` (`code`, `name`, `expertise`, `display_order`, `is_active`) VALUES
  (
    'ui-ux-design',
    'UI/UX Design',
    JSON_ARRAY(
      'Interface layout and visual hierarchy',
      'User journey planning and wireframing',
      'Accessibility-focused design review'
    ),
    1,
    1
  ),
  (
    'frontend-development',
    'Frontend Development',
    JSON_ARRAY(
      'Reusable Vue components and page structure',
      'Responsive layouts and interaction states',
      'State handling and UI integration'
    ),
    2,
    1
  ),
  (
    'backend-development',
    'Backend Development',
    JSON_ARRAY(
      'API design and data flow',
      'Authentication and permission logic',
      'System integration and maintenance'
    ),
    3,
    1
  ),
  (
    'quality-assurance',
    'Quality Assurance',
    JSON_ARRAY(
      'Functional testing and regression checks',
      'Bug reporting and verification',
      'Release readiness review'
    ),
    4,
    1
  ),
  (
    'project-coordination',
    'Project Coordination',
    JSON_ARRAY(
      'Feature planning and delivery tracking',
      'Cross-team communication',
      'Scope, timeline, and handoff coordination'
    ),
    5,
    1
  );

INSERT INTO `website_team_expertise` (`department_code`, `expertise_text`, `display_order`) VALUES
  ('ui-ux-design', 'Interface layout and visual hierarchy', 1),
  ('ui-ux-design', 'User journey planning and wireframing', 2),
  ('ui-ux-design', 'Accessibility-focused design review', 3),
  ('frontend-development', 'Reusable Vue components and page structure', 1),
  ('frontend-development', 'Responsive layouts and interaction states', 2),
  ('frontend-development', 'State handling and UI integration', 3),
  ('backend-development', 'API design and data flow', 1),
  ('backend-development', 'Authentication and permission logic', 2),
  ('backend-development', 'System integration and maintenance', 3),
  ('quality-assurance', 'Functional testing and regression checks', 1),
  ('quality-assurance', 'Bug reporting and verification', 2),
  ('quality-assurance', 'Release readiness review', 3),
  ('project-coordination', 'Feature planning and delivery tracking', 1),
  ('project-coordination', 'Cross-team communication', 2),
  ('project-coordination', 'Scope, timeline, and handoff coordination', 3);

INSERT INTO `sport_tournaments` (`id`, `title`, `subtitle`, `location`, `status`, `planned_matches`) VALUES
  (
    'tour_001',
    'Inter-Club Summer Showcase',
    'Final week structure, fixtures, and broadcast-ready highlights.',
    'Phnom Penh Sports Complex',
    'live',
    14
  );

INSERT INTO `sport_tournament_alerts` (`tournament_id`, `alert_type`, `message`, `display_order`) VALUES
  ('tour_001', 'warning', 'Hydration stations require restocking before Saturday matches.', 1),
  ('tour_001', 'info', 'Live stream overlay graphics are scheduled for deployment tomorrow.', 2);

INSERT INTO `sport_matches` (
  `id`,
  `tournament_id`,
  `home_team_name`,
  `away_team_name`,
  `venue`,
  `match_group`,
  `status`,
  `display_time_label`,
  `live_minute`,
  `display_order`
) VALUES
  ('match_001', 'tour_001', 'Team A', 'Team B', 'City Stadium', 'live', 'live', NULL, '65', 1),
  ('match_002', 'tour_001', 'Team C', 'Team D', 'National Arena', 'live', 'live', NULL, '42', 2),
  ('match_003', 'tour_001', 'Team Q', 'Team R', 'West Wing', 'live', 'live', NULL, '12', 3),
  ('match_004', 'tour_001', 'Team S', 'Team T', 'Main Field', 'live', 'live', NULL, '88', 4),
  ('match_005', 'tour_001', 'Team U', 'Team V', 'North Park', 'live', 'live', NULL, '25', 5),
  ('match_006', 'tour_001', 'Team E', 'Team F', NULL, 'today', 'scheduled', '3:00 PM', NULL, 1),
  ('match_007', 'tour_001', 'Team G', 'Team H', NULL, 'today', 'scheduled', '5:30 PM', NULL, 2),
  ('match_008', 'tour_001', 'Team I', 'Team J', NULL, 'today', 'scheduled', '7:00 PM', NULL, 3),
  ('match_009', 'tour_001', 'Team K', 'Team L', NULL, 'today', 'scheduled', '8:30 PM', NULL, 4),
  ('match_010', 'tour_001', 'Team M', 'Team N', NULL, 'today', 'scheduled', '9:00 PM', NULL, 5),
  ('match_011', 'tour_001', 'Team O', 'Team P', NULL, 'today', 'scheduled', '10:30 PM', NULL, 6);

INSERT INTO `sport_top_scorers` (`tournament_id`, `player_name`, `team_name`, `goals`, `display_order`) VALUES
  ('tour_001', 'Player A', 'Team A', 6, 1),
  ('tour_001', 'Player B', 'Team B', 5, 2),
  ('tour_001', 'Player C', 'Team C', 4, 3);

INSERT INTO `sport_standings` (
  `tournament_id`,
  `position`,
  `team_name`,
  `played`,
  `wins`,
  `draws`,
  `losses`,
  `goals_for`,
  `goals_against`,
  `goal_difference`,
  `points`
) VALUES
  ('tour_001', 1, 'Team A', 4, 3, 1, 0, 9, 3, '+6', 10),
  ('tour_001', 2, 'Team B', 4, 2, 2, 0, 7, 4, '+3', 8),
  ('tour_001', 3, 'Team C', 4, 2, 1, 1, 6, 5, '+1', 7),
  ('tour_001', 4, 'Team D', 4, 2, 0, 2, 5, 5, '0', 6);

INSERT INTO `sport_teams` (
  `id`,
  `name`,
  `division`,
  `coach_name`,
  `captain_name`,
  `players_count`,
  `status`,
  `venue`,
  `wins`,
  `draws`,
  `losses`,
  `points`
) VALUES
  ('team_001', 'Falcon United', 'U-18 Premier', 'Dara Sok', 'Vanna Lim', 18, 'active', 'Main Field', 7, 1, 1, 22),
  ('team_002', 'River Panthers', 'U-18 Premier', 'Kunthea Mean', 'Piseth Chan', 17, 'active', 'North Pitch', 6, 2, 1, 20),
  ('team_003', 'Golden Tigers', 'U-16 Elite', 'Malis Kim', 'Sovann Roth', 16, 'pending', 'Training Hall B', 4, 2, 2, 14),
  ('team_004', 'Blue Comets', 'U-16 Elite', 'Sreyleak Hong', 'Kanika Pov', 15, 'active', 'West Arena', 5, 1, 2, 16),
  ('team_005', 'Summit Strikers', 'Senior Development', 'Panhara Lim', 'Ravy Hong', 20, 'active', 'South Stadium', 8, 0, 1, 24),
  ('team_006', 'Harbor Rangers', 'Senior Development', 'Pisey Mean', 'Kimheng Pov', 19, 'inactive', 'Dockside Ground', 2, 3, 4, 9),
  ('team_007', 'Victory Academy', 'U-14 Future', 'Nita Chhun', 'Mony Pen', 14, 'pending', 'Academy Court', 3, 2, 2, 11),
  ('team_008', 'Lotus Warriors', 'U-14 Future', 'Sokunthea Nop', 'Thyda Keo', 13, 'active', 'East Pavilion', 6, 0, 1, 18),
  ('team_009', 'Crown Legends', 'Girls Competitive', 'Mony Pov', 'Sophal Em', 16, 'active', 'Central Arena', 5, 2, 1, 17),
  ('team_010', 'Skyline Youth', 'Girls Competitive', 'Thyda Pen', 'Bopha Meng', 15, 'inactive', 'Indoor Dome', 1, 2, 5, 5);

-- Seed login accounts aligned to the current mock system.
-- Passwords are bcrypt hashes of the frontend mock passwords.
INSERT INTO `users` (
  `id`,
  `first_name`,
  `last_name`,
  `username`,
  `email`,
  `phone`,
  `role_code`,
  `department`,
  `status`,
  `avatar`,
  `password`,
  `last_login_at`,
  `created_at`,
  `updated_at`
) VALUES
  (
    'usr_001',
    'Vanna',
    'Nop',
    'Vanna Nop',
    'superadmin01@hfccf.org',
    '+855 12 301 001',
    'superadmin',
    'Operations',
    'active',
    'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80',
    '$2y$10$VDxiTyF8hTrUu9rcWfcAveVDiHxBP5NdngXzfVCalxnrOt8oqlLOG',
    '2026-03-04 04:15:00',
    '2026-02-01 08:00:00',
    '2026-02-01 08:00:00'
  ),
  (
    'usr_016',
    'Sovann',
    'Lim',
    'Sovann Lim',
    'preschool.admin01@hfccf.org',
    '+855 12 316 016',
    'adminpreschool',
    'Education',
    'active',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
    '$2y$10$DL4pVR9wQwhWbiB.UqWUteKxr.mA0nELKCblW1LWNGTxV6w.fLKaG',
    '2026-03-03 04:15:00',
    '2026-02-16 08:00:00',
    '2026-02-16 08:00:00'
  ),
  (
    'usr_031',
    'Sokun',
    'Nop',
    'Sokun Nop',
    'scholarship.admin01@hfccf.org',
    '+855 12 331 031',
    'adminscholaship',
    'Education',
    'active',
    'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80',
    '$2y$10$JFyQX2264zF7398Hhf7.zOXyVQutg2T/pMZ0yJ5KZTp2c.NMNpI9a',
    '2026-03-02 04:15:00',
    '2026-02-04 08:00:00',
    '2026-02-04 08:00:00'
  ),
  (
    'usr_046',
    'Sophea',
    'Lim',
    'Sophea Lim',
    'english.admin01@hfccf.org',
    '+855 12 346 046',
    'adminenglish',
    'Education',
    'active',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
    '$2y$10$FPHRt1Qo.Bqdz66ebsxok.HowfnX23ivq95NXFFltbQRINlnmsH2O',
    '2026-03-01 04:15:00',
    '2026-02-19 08:00:00',
    '2026-02-19 08:00:00'
  ),
  (
    'usr_061',
    'Pisey',
    'Nop',
    'Pisey Nop',
    'sport.admin01@hfccf.org',
    '+855 12 361 061',
    'adminsport',
    'Sports',
    'active',
    'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80',
    '$2y$10$.ABQclzC/hcDA76xiptxeuNmMQBppVFkhRJXnLo2Mr9JFTBG0/s2a',
    '2026-03-08 04:15:00',
    '2026-02-07 08:00:00',
    '2026-02-07 08:00:00'
  ),
  (
    'usr_076',
    'Rina',
    'Lim',
    'Rina Lim',
    'coach01@hfccf.org',
    '+855 12 376 076',
    'coach',
    'Sports',
    'active',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
    '$2y$10$0xolL2LnIuMQXe7W0l1.nu4vjDUgK1X38Ne./LJhk0tFxXrnzZ8fK',
    '2026-03-07 04:15:00',
    '2026-02-22 08:00:00',
    '2026-02-22 08:00:00'
  ),
  (
    'usr_091',
    'Sreypov',
    'Nop',
    'Sreypov Nop',
    'teacher.english01@hfccf.org',
    '+855 12 391 091',
    'teacher-english',
    'Education',
    'active',
    'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80',
    '$2y$10$ZhQvc5g8xmR798XPkHtX.OJAFPU20VZqVjqwmu1KMCZWrfGY416hy',
    '2026-03-06 04:15:00',
    '2026-02-10 08:00:00',
    '2026-02-10 08:00:00'
  ),
  (
    'usr_106',
    'Vannak',
    'Lim',
    'Vannak Lim',
    'teacher.preschool01@hfccf.org',
    '+855 12 406 106',
    'teacher-preschool',
    'Education',
    'active',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
    '$2y$10$8Yhy10mQzt0AS9hkzIrF4.wvhAr3spix6cJqfUTzd89RmBC.GRAXe',
    '2026-03-05 04:15:00',
    '2026-02-25 08:00:00',
    '2026-02-25 08:00:00'
  ),
  (
    'usr_121',
    'Nita',
    'Nop',
    'Nita Nop',
    'teacher.scholarship01@hfccf.org',
    '+855 12 421 121',
    'teacher-scholarship',
    'Education',
    'active',
    'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80',
    '$2y$10$XVIt6GQJliG6e6phQumQeeD0gbWdEzH/fEUSeetq.8Ttj6Gxj1BWG',
    '2026-03-04 04:15:00',
    '2026-02-13 08:00:00',
    '2026-02-13 08:00:00'
  );

-- Seed direct user permissions from the role defaults so API responses can
-- expose permission arrays without custom per-user grants yet.
INSERT INTO `user_permissions` (`user_id`, `permission_code`)
SELECT `u`.`id`, `rp`.`permission_code`
FROM `users` AS `u`
INNER JOIN `role_permissions` AS `rp`
  ON `rp`.`role_code` = `u`.`role_code`;

-- Query shape to match the frontend user model:
-- SELECT
--   u.id,
--   u.first_name AS firstName,
--   u.last_name AS lastName,
--   u.username,
--   u.email,
--   u.phone,
--   u.role_code AS role,
--   r.scope,
--   r.domain_code AS domain,
--   u.department,
--   u.bio,
--   u.status,
--   u.avatar,
--   u.created_at AS createdAt,
--   u.last_login_at AS lastLoginAt,
--   JSON_ARRAYAGG(up.permission_code) AS role_permission
-- FROM users u
-- INNER JOIN roles r ON r.code = u.role_code
-- LEFT JOIN user_permissions up ON up.user_id = u.id
-- GROUP BY u.id;

-- Current Sport frontend data shape:
-- 1. Coaches come from `users` filtered by role_code = 'coach'.
-- 2. Teams management comes from `sport_teams`.
-- 3. Player information comes from `sport_players` (players are not users).
-- 4. Tournament banner, alerts, live matches, today's matches, top scorers,
--    and standings come from the `sport_*` tournament tables above.
