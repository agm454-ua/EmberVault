INSERT INTO users (username, email, password, birth_date, system_role)
VALUES 
    ('admin', 'agm454@alu.ua.es', '$2b$12$7B.RK6rqse4lmlmNH0tvCuOpg7bcmS0N3Md96qPxwxxpFSdjri5iK', '2004-04-08',
        (SELECT id FROM system_roles WHERE name='admin')
    ),

    ('user1', 'user1@example.com', '$2b$12$tXDay9A/wQkl./QK4pk38epLIFcjkPiuDouCTZ8ZWIpP1OVuiKM1a', '1900-01-01', -- password = user123
        (SELECT id FROM system_roles WHERE name='user')
    ),

    ('user2', 'user2@example.com', '$2b$12$0Z6dOtlY17.JmH9zvw5KEuI1ociT8qJkLtOpoDvsQ0OCiXOYzcU8y', '1900-01-01', -- password = user234
        (SELECT id FROM system_roles WHERE name='user')
    );
