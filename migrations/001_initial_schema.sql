-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    subscription_tier VARCHAR(20) DEFAULT 'free',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Canvas projects
CREATE TABLE canvases (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    canvas_data JSONB, -- Stores drawing data
    thumbnail_url TEXT,
    is_public BOOLEAN DEFAULT false,
    collaboration_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI generations
CREATE TABLE ai_generations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    canvas_id INTEGER REFERENCES canvases(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    style VARCHAR(100),
    model_used VARCHAR(50) NOT NULL,
    image_url TEXT,
    generation_time_ms INTEGER,
    cost_credits INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Collaboration sessions
CREATE TABLE collaborations (
    id SERIAL PRIMARY KEY,
    canvas_id INTEGER REFERENCES canvases(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'editor', -- owner, editor, viewer
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(canvas_id, user_id)
);

-- Canvas versions (for undo/redo)
CREATE TABLE canvas_versions (
    id SERIAL PRIMARY KEY,
    canvas_id INTEGER REFERENCES canvases(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    canvas_data JSONB NOT NULL,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_canvases_owner ON canvases(owner_id);
CREATE INDEX idx_ai_generations_user ON ai_generations(user_id);
CREATE INDEX idx_ai_generations_status ON ai_generations(status);
CREATE INDEX idx_collaborations_canvas ON collaborations(canvas_id);
CREATE INDEX idx_canvas_versions_canvas ON canvas_versions(canvas_id);
