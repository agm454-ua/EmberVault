-- Ensure test user exists and is admin for tests
INSERT INTO users (username, email, password, birth_date, system_role)
VALUES (
    'test',
    'test@test.com',
    '$2a$10$ODNVeod70me/wRlbmdFRY.2myabgS.MtT8ihuQ9iLoXqzml3Crg8m',
    '2004-04-08',
    (
        SELECT id
        FROM system_roles
        WHERE name = 'admin'
    )
)
ON CONFLICT (email) DO NOTHING;

UPDATE users
SET system_role = (SELECT id FROM system_roles WHERE name = 'admin')
WHERE email = 'test@test.com';

-- Seed resources owned by test user
DO $$
DECLARE
    v_user_id UUID;
    v_root_folder UUID;
    v_docs_folder UUID;
    v_images_folder UUID;
    v_videos_folder UUID;
    v_projects_folder UUID;

    v_resource_id UUID;
    v_resource_owner_role_id UUID;
BEGIN
    -- Get user
    SELECT id, root_folder
    INTO v_user_id, v_root_folder
    FROM users
    WHERE email = 'test@test.com';

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User test@test.com not found';
    END IF;

    SELECT id
    INTO v_resource_owner_role_id
    FROM resource_roles
    WHERE name = 'owner';

    ----------------------------------------------------------------------

    -- Documents Folder
    INSERT INTO resources (
        name,
        parent_folder,
        state
    )
    VALUES (
        'Documents',
        v_root_folder,
        'ready'
    )
    RETURNING id INTO v_docs_folder;

    INSERT INTO folders (id)
    VALUES (v_docs_folder);

    INSERT INTO user_is_resource_role_for_resource (user_id, resource_role, resource_id)
    VALUES (v_user_id, v_resource_owner_role_id, v_docs_folder);

    -- Images Folder
    INSERT INTO resources (
        name,
        parent_folder,
        state
    )
    VALUES (
        'Images',
        v_root_folder,
        'ready'
    )
    RETURNING id INTO v_images_folder;

    INSERT INTO folders (id)
    VALUES (v_images_folder);

    INSERT INTO user_is_resource_role_for_resource (user_id, resource_role, resource_id)
    VALUES (v_user_id, v_resource_owner_role_id, v_images_folder);

    -- Videos Folder
    INSERT INTO resources (
        name,
        parent_folder,
        state
    )
    VALUES (
        'Videos',
        v_root_folder,
        'ready'
    )
    RETURNING id INTO v_videos_folder;

    INSERT INTO folders (id)
    VALUES (v_videos_folder);

    INSERT INTO user_is_resource_role_for_resource (user_id, resource_role, resource_id)
    VALUES (v_user_id, v_resource_owner_role_id, v_videos_folder);

    -- Projects Folder
    INSERT INTO resources (
        name,
        parent_folder,
        state
    )
    VALUES (
        'Projects',
        v_root_folder,
        'ready'
    )
    RETURNING id INTO v_projects_folder;

    INSERT INTO folders (id)
    VALUES (v_projects_folder);

    INSERT INTO user_is_resource_role_for_resource (user_id, resource_role, resource_id)
    VALUES (v_user_id, v_resource_owner_role_id, v_projects_folder);


    ----------------------------------------------------------------------

    -- File: Resume.pdf
    INSERT INTO resources (
        name,
        parent_folder,
        state
    )
    VALUES (
        'Resume.pdf',
        v_docs_folder,
        'ready'
    )
    RETURNING id INTO v_resource_id;

    INSERT INTO files (
        id,
        mime_type,
        size_bytes,
        storage_path,
        checksum
    )
    VALUES (
        v_resource_id,
        'application/pdf',
        245760,
        'some_url',
        md5(random()::text)
    );

    INSERT INTO user_is_resource_role_for_resource (user_id, resource_role, resource_id)
    VALUES (v_user_id, v_resource_owner_role_id, v_resource_id);

    -- File: presentation.pdf
    INSERT INTO resources (
        name,
        parent_folder,
        state
    )
    VALUES (
        'presentation.pdf',
        v_docs_folder,
        'ready'
    )
    RETURNING id INTO v_resource_id;

    INSERT INTO files (
        id,
        mime_type,
        size_bytes,
        storage_path,
        checksum
    )
    VALUES (
        v_resource_id,
        'application/pdf',
        24242424,
        'some_url',
        md5(random()::text)
    );

    INSERT INTO user_is_resource_role_for_resource (user_id, resource_role, resource_id)
    VALUES (v_user_id, v_resource_owner_role_id, v_resource_id);

    -- File: Notes.txt
    INSERT INTO resources (
        name,
        parent_folder,
        state
    )
    VALUES (
        'Notes.txt',
        v_docs_folder,
        'ready'
    )
    RETURNING id INTO v_resource_id;

    INSERT INTO files (
        id,
        mime_type,
        size_bytes,
        storage_path,
        checksum
    )
    VALUES (
        v_resource_id,
        'text/plain',
        8192,
        'some_url',
        md5(random()::text)
    );

    INSERT INTO user_is_resource_role_for_resource (user_id, resource_role, resource_id)
    VALUES (v_user_id, v_resource_owner_role_id, v_resource_id);

    -- File: README.md
    INSERT INTO resources (
        name,
        parent_folder,
        state
    )
    VALUES (
        'README.md',
        v_docs_folder,
        'ready'
    )
    RETURNING id INTO v_resource_id;

    INSERT INTO files (
        id,
        mime_type,
        size_bytes,
        storage_path,
        checksum
    )
    VALUES (
        v_resource_id,
        'text/plain',
        8192,
        'some_url',
        md5(random()::text)
    );

    INSERT INTO user_is_resource_role_for_resource (user_id, resource_role, resource_id)
    VALUES (v_user_id, v_resource_owner_role_id, v_resource_id);

    -- File: vacation.jpg
    INSERT INTO resources (
        name,
        parent_folder,
        state
    )
    VALUES (
        'vacation.jpg',
        v_images_folder,
        'ready'
    )
    RETURNING id INTO v_resource_id;

    INSERT INTO files (
        id,
        mime_type,
        size_bytes,
        storage_path,
        checksum,
        thumbnail_path
    )
    VALUES (
        v_resource_id,
        'image/jpeg',
        3145728,
        'some_url',
        md5(random()::text),
        'some_url'
    );

    INSERT INTO user_is_resource_role_for_resource (user_id, resource_role, resource_id)
    VALUES (v_user_id, v_resource_owner_role_id, v_resource_id);

    -- File: photo.jpg
    INSERT INTO resources (
        name,
        parent_folder,
        state
    )
    VALUES (
        'photo.jpg',
        v_images_folder,
        'ready'
    )
    RETURNING id INTO v_resource_id;

    INSERT INTO files (
        id,
        mime_type,
        size_bytes,
        storage_path,
        checksum,
        thumbnail_path
    )
    VALUES (
        v_resource_id,
        'image/jpeg',
        3145728,
        'some_url',
        md5(random()::text),
        'some_url'
    );

    INSERT INTO user_is_resource_role_for_resource (user_id, resource_role, resource_id)
    VALUES (v_user_id, v_resource_owner_role_id, v_resource_id);


    -- File: photo2.jpg
    INSERT INTO resources (
        name,
        parent_folder,
        state
    )
    VALUES (
        'photo2.jpg',
        v_images_folder,
        'ready'
    )
    RETURNING id INTO v_resource_id;

    INSERT INTO files (
        id,
        mime_type,
        size_bytes,
        storage_path,
        checksum,
        thumbnail_path
    )
    VALUES (
        v_resource_id,
        'image/jpeg',
        3145728,
        'some_url',
        md5(random()::text),
        'some_url'
    );

    INSERT INTO user_is_resource_role_for_resource (user_id, resource_role, resource_id)
    VALUES (v_user_id, v_resource_owner_role_id, v_resource_id);


    -- File: photo3.jpg
    INSERT INTO resources (
        name,
        parent_folder,
        state
    )
    VALUES (
        'photo3.jpg',
        v_images_folder,
        'ready'
    )
    RETURNING id INTO v_resource_id;

    INSERT INTO files (
        id,
        mime_type,
        size_bytes,
        storage_path,
        checksum,
        thumbnail_path
    )
    VALUES (
        v_resource_id,
        'image/jpeg',
        2123421,
        'some_url',
        md5(random()::text),
        'some_url'
    );

    INSERT INTO user_is_resource_role_for_resource (user_id, resource_role, resource_id)
    VALUES (v_user_id, v_resource_owner_role_id, v_resource_id);

    
    -- File: photo4.jpg
    INSERT INTO resources (
        name,
        parent_folder,
        state
    )
    VALUES (
        'photo4.jpg',
        v_images_folder,
        'ready'
    )
    RETURNING id INTO v_resource_id;

    INSERT INTO files (
        id,
        mime_type,
        size_bytes,
        storage_path,
        checksum,
        thumbnail_path
    )
    VALUES (
        v_resource_id,
        'image/jpeg',
        15151515,
        'some_url',
        md5(random()::text),
        'some_url'
    );

    INSERT INTO user_is_resource_role_for_resource (user_id, resource_role, resource_id)
    VALUES (v_user_id, v_resource_owner_role_id, v_resource_id);

    
    -- File: photo5.jpg
    INSERT INTO resources (
        name,
        parent_folder,
        state
    )
    VALUES (
        'photo5.jpg',
        v_images_folder,
        'ready'
    )
    RETURNING id INTO v_resource_id;

    INSERT INTO files (
        id,
        mime_type,
        size_bytes,
        storage_path,
        checksum,
        thumbnail_path
    )
    VALUES (
        v_resource_id,
        'image/jpeg',
        2323234,
        'some_url',
        md5(random()::text),
        'some_url'
    );

    INSERT INTO user_is_resource_role_for_resource (user_id, resource_role, resource_id)
    VALUES (v_user_id, v_resource_owner_role_id, v_resource_id);


    
    -- File: image1.png
    INSERT INTO resources (
        name,
        parent_folder,
        state
    )
    VALUES (
        'image1.png',
        v_images_folder,
        'ready'
    )
    RETURNING id INTO v_resource_id;

    INSERT INTO files (
        id,
        mime_type,
        size_bytes,
        storage_path,
        checksum,
        thumbnail_path
    )
    VALUES (
        v_resource_id,
        'image/png',
        2323234,
        'some_url',
        md5(random()::text),
        'some_url'
    );

    INSERT INTO user_is_resource_role_for_resource (user_id, resource_role, resource_id)
    VALUES (v_user_id, v_resource_owner_role_id, v_resource_id);

   
    -- File: image2.png
    INSERT INTO resources (
        name,
        parent_folder,
        state
    )
    VALUES (
        'image2.png',
        v_images_folder,
        'ready'
    )
    RETURNING id INTO v_resource_id;

    INSERT INTO files (
        id,
        mime_type,
        size_bytes,
        storage_path,
        checksum,
        thumbnail_path
    )
    VALUES (
        v_resource_id,
        'image/png',
        2323234,
        'some_url',
        md5(random()::text),
        'some_url'
    );

    INSERT INTO user_is_resource_role_for_resource (user_id, resource_role, resource_id)
    VALUES (v_user_id, v_resource_owner_role_id, v_resource_id);
   
    -- File: image3.png
    INSERT INTO resources (
        name,
        parent_folder,
        state
    )
    VALUES (
        'image3.png',
        v_images_folder,
        'ready'
    )
    RETURNING id INTO v_resource_id;

    INSERT INTO files (
        id,
        mime_type,
        size_bytes,
        storage_path,
        checksum,
        thumbnail_path
    )
    VALUES (
        v_resource_id,
        'image/png',
        2323234,
        'some_url',
        md5(random()::text),
        'some_url'
    );

    INSERT INTO user_is_resource_role_for_resource (user_id, resource_role, resource_id)
    VALUES (v_user_id, v_resource_owner_role_id, v_resource_id);

    -- File: logo.svg
    INSERT INTO resources (
        name,
        parent_folder,
        state
    )
    VALUES (
        'logo.svg',
        v_images_folder,
        'ready'
    )
    RETURNING id INTO v_resource_id;

    INSERT INTO files (
        id,
        mime_type,
        size_bytes,
        storage_path,
        checksum,
        thumbnail_path
    )
    VALUES (
        v_resource_id,
        'image/svg+xml',
        2323234,
        'some_url',
        md5(random()::text),
        'some_url'
    );

    INSERT INTO user_is_resource_role_for_resource (user_id, resource_role, resource_id)
    VALUES (v_user_id, v_resource_owner_role_id, v_resource_id);


    -- File: demo.mp4
    INSERT INTO resources (
        name,
        parent_folder,
        state
    )
    VALUES (
        'demo.mp4',
        v_videos_folder,
        'ready'
    )
    RETURNING id INTO v_resource_id;

    INSERT INTO files (
        id,
        mime_type,
        size_bytes,
        storage_path,
        checksum,
        thumbnail_path
    )
    VALUES (
        v_resource_id,
        'video/mp4',
        1521561242,
        'some_url',
        md5(random()::text),
        'some_url'
    );

    INSERT INTO user_is_resource_role_for_resource (user_id, resource_role, resource_id)
    VALUES (v_user_id, v_resource_owner_role_id, v_resource_id);


    -- File: funny-fails-compilation.mp4
    INSERT INTO resources (
        name,
        parent_folder,
        state
    )
    VALUES (
        'funny-fails-compilation.mp4',
        v_videos_folder,
        'ready'
    )
    RETURNING id INTO v_resource_id;

    INSERT INTO files (
        id,
        mime_type,
        size_bytes,
        storage_path,
        checksum,
        thumbnail_path
    )
    VALUES (
        v_resource_id,
        'video/mp4',
        634563142,
        'some_url',
        md5(random()::text),
        'some_url'
    );

    INSERT INTO user_is_resource_role_for_resource (user_id, resource_role, resource_id)
    VALUES (v_user_id, v_resource_owner_role_id, v_resource_id);

    -- File: project-plan.docx
    INSERT INTO resources (
        name,
        parent_folder,
        state
    )
    VALUES (
        'project-plan.docx',
        v_projects_folder,
        'ready'
    )
    RETURNING id INTO v_resource_id;

    INSERT INTO files (
        id,
        mime_type,
        size_bytes,
        storage_path,
        checksum
    )
    VALUES (
        v_resource_id,
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        102400,
        'some_url',
        md5(random()::text)
    );

    INSERT INTO user_is_resource_role_for_resource (user_id, resource_role, resource_id)
    VALUES (v_user_id, v_resource_owner_role_id, v_resource_id);

    
    -- File: document1.docx
    INSERT INTO resources (
        name,
        parent_folder,
        state
    )
    VALUES (
        'document1.docx',
        v_projects_folder,
        'ready'
    )
    RETURNING id INTO v_resource_id;

    INSERT INTO files (
        id,
        mime_type,
        size_bytes,
        storage_path,
        checksum
    )
    VALUES (
        v_resource_id,
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        111400,
        'some_url',
        md5(random()::text)
    );

    INSERT INTO user_is_resource_role_for_resource (user_id, resource_role, resource_id)
    VALUES (v_user_id, v_resource_owner_role_id, v_resource_id);

    -- File: Q1.xlsx
    INSERT INTO resources (
        name,
        parent_folder,
        state
    )
    VALUES (
        'Q1.xlsx',
        v_projects_folder,
        'ready'
    )
    RETURNING id INTO v_resource_id;

    INSERT INTO files (
        id,
        mime_type,
        size_bytes,
        storage_path,
        checksum
    )
    VALUES (
        v_resource_id,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        12345,
        'some_url',
        md5(random()::text)
    );

    INSERT INTO user_is_resource_role_for_resource (user_id, resource_role, resource_id)
    VALUES (v_user_id, v_resource_owner_role_id, v_resource_id);

    
    -- File: load-test-results.json
    INSERT INTO resources (
        name,
        parent_folder,
        state
    )
    VALUES (
        'load-test-results.json',
        v_projects_folder,
        'ready'
    )
    RETURNING id INTO v_resource_id;

    INSERT INTO files (
        id,
        mime_type,
        size_bytes,
        storage_path,
        checksum
    )
    VALUES (
        v_resource_id,
        'application/json',
        16959835,
        'some_url',
        md5(random()::text)
    );

    INSERT INTO user_is_resource_role_for_resource (user_id, resource_role, resource_id)
    VALUES (v_user_id, v_resource_owner_role_id, v_resource_id);


END $$;
