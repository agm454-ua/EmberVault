INSERT INTO users (username, email, password, birth_date, system_role)
VALUES 
    ('admin', 'agm454@alu.ua.es', '$2a$10$woaA9tvuWUF6rN.MesIgduCrAPSPwmKXsvS5rT1rfqAPOR.kMTLVu', '2004-04-08',
        (SELECT id FROM system_roles WHERE name='admin')
    ),

    ('user1', 'user1@example.com', '$2a$10$9PxQ2qcQ5Y.Xe8ghELPwfu5n56wqV7na6PrAmydo/Np4OZZWv3rIa', '1900-01-01', -- password = User123!
        (SELECT id FROM system_roles WHERE name='user')
    ),

    ('user2', 'user2@example.com', '$2a$10$CjzuB3pcx5U0JCJ3RXh3v./SDTRhwL6SenjBGoRPVFkmiLJX52MYq', '1900-01-01', -- password = User234!
        (SELECT id FROM system_roles WHERE name='user')
    ),

    ('test', 'test@test.com', '$2a$10$ODNVeod70me/wRlbmdFRY.2myabgS.MtT8ihuQ9iLoXqzml3Crg8m', '2004-04-08',
        (SELECT id FROM system_roles WHERE name='user')
    );
