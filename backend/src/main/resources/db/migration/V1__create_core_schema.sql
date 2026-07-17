CREATE TABLE users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    wechat_openid VARCHAR(64) NOT NULL,
    wechat_unionid VARCHAR(64) NULL,
    nickname VARCHAR(64) NOT NULL DEFAULT '',
    avatar_url VARCHAR(512) NULL,
    phone VARCHAR(32) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    deleted TINYINT(1) NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_openid (wechat_openid),
    KEY idx_users_unionid (wechat_unionid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE family_groups (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(80) NOT NULL,
    owner_user_id BIGINT UNSIGNED NOT NULL,
    invite_code VARCHAR(32) NOT NULL,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    deleted TINYINT(1) NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE KEY uk_family_groups_invite_code (invite_code),
    KEY idx_family_groups_owner (owner_user_id),
    CONSTRAINT fk_family_groups_owner FOREIGN KEY (owner_user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE family_members (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    family_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'MEMBER',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    joined_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    UNIQUE KEY uk_family_members_family_user (family_id, user_id),
    KEY idx_family_members_user (user_id),
    CONSTRAINT fk_family_members_family FOREIGN KEY (family_id) REFERENCES family_groups (id),
    CONSTRAINT fk_family_members_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE pets (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    family_id BIGINT UNSIGNED NOT NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    name VARCHAR(64) NOT NULL,
    species VARCHAR(20) NOT NULL,
    breed VARCHAR(100) NULL,
    gender VARCHAR(20) NOT NULL DEFAULT 'UNKNOWN',
    birth_date DATE NULL,
    weight DECIMAL(6,2) NULL,
    avatar_object_key VARCHAR(512) NULL,
    hobbies VARCHAR(500) NULL,
    health_score SMALLINT UNSIGNED NOT NULL DEFAULT 100,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    deleted TINYINT(1) NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    KEY idx_pets_family (family_id),
    KEY idx_pets_created_by (created_by),
    CONSTRAINT fk_pets_family FOREIGN KEY (family_id) REFERENCES family_groups (id),
    CONSTRAINT fk_pets_creator FOREIGN KEY (created_by) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE health_records (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    pet_id BIGINT UNSIGNED NOT NULL,
    record_date DATE NOT NULL,
    feeding_amount DECIMAL(8,2) NULL,
    water_level VARCHAR(20) NULL,
    walk_distance DECIMAL(8,2) NULL,
    weight DECIMAL(6,2) NULL,
    stool_status VARCHAR(20) NULL,
    mood_status VARCHAR(20) NULL,
    notes VARCHAR(1000) NULL,
    recorded_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    UNIQUE KEY uk_health_records_pet_date (pet_id, record_date),
    KEY idx_health_records_date (record_date),
    KEY idx_health_records_recorder (recorded_by),
    CONSTRAINT fk_health_records_pet FOREIGN KEY (pet_id) REFERENCES pets (id),
    CONSTRAINT fk_health_records_recorder FOREIGN KEY (recorded_by) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tasks (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    family_id BIGINT UNSIGNED NOT NULL,
    pet_id BIGINT UNSIGNED NULL,
    task_scope VARCHAR(20) NOT NULL DEFAULT 'PET',
    name VARCHAR(120) NOT NULL,
    scheduled_time TIME NULL,
    recurrence_rule VARCHAR(255) NULL,
    assignee_user_id BIGINT UNSIGNED NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    notes VARCHAR(1000) NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    deleted TINYINT(1) NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    KEY idx_tasks_family_time (family_id, scheduled_time),
    KEY idx_tasks_pet (pet_id),
    KEY idx_tasks_assignee (assignee_user_id),
    CONSTRAINT fk_tasks_family FOREIGN KEY (family_id) REFERENCES family_groups (id),
    CONSTRAINT fk_tasks_pet FOREIGN KEY (pet_id) REFERENCES pets (id),
    CONSTRAINT fk_tasks_assignee FOREIGN KEY (assignee_user_id) REFERENCES users (id),
    CONSTRAINT fk_tasks_creator FOREIGN KEY (created_by) REFERENCES users (id),
    CONSTRAINT chk_tasks_scope_pet CHECK ((task_scope = 'SHARED' AND pet_id IS NULL) OR (task_scope = 'PET' AND pet_id IS NOT NULL))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE task_completions (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    task_id BIGINT UNSIGNED NOT NULL,
    task_date DATE NOT NULL,
    completed_by BIGINT UNSIGNED NOT NULL,
    completed_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    notes VARCHAR(500) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_task_completions_task_date (task_id, task_date),
    KEY idx_task_completions_user (completed_by),
    CONSTRAINT fk_task_completions_task FOREIGN KEY (task_id) REFERENCES tasks (id),
    CONSTRAINT fk_task_completions_user FOREIGN KEY (completed_by) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE family_activities (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    family_id BIGINT UNSIGNED NOT NULL,
    actor_user_id BIGINT UNSIGNED NOT NULL,
    activity_type VARCHAR(40) NOT NULL,
    target_type VARCHAR(40) NULL,
    target_id BIGINT UNSIGNED NULL,
    summary VARCHAR(255) NOT NULL,
    detail_json JSON NULL,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    KEY idx_family_activities_family_created (family_id, created_at),
    KEY idx_family_activities_actor (actor_user_id),
    CONSTRAINT fk_family_activities_family FOREIGN KEY (family_id) REFERENCES family_groups (id),
    CONSTRAINT fk_family_activities_actor FOREIGN KEY (actor_user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE recognition_records (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    pet_id BIGINT UNSIGNED NULL,
    image_object_key VARCHAR(512) NOT NULL,
    predicted_species VARCHAR(40) NULL,
    predicted_breed VARCHAR(100) NULL,
    confidence DECIMAL(6,5) NULL,
    result_json JSON NULL,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    KEY idx_recognition_records_user_created (user_id, created_at),
    KEY idx_recognition_records_pet (pet_id),
    CONSTRAINT fk_recognition_records_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_recognition_records_pet FOREIGN KEY (pet_id) REFERENCES pets (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
