exports.up = (pgm) => {
  pgm.createTable('users', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    email: { type: 'varchar(255)', notNull: true, unique: true },
    created_at: { type: 'timestamp with time zone', default: pgm.func('NOW()') },
    updated_at: { type: 'timestamp with time zone', default: pgm.func('NOW()') },
  });

  pgm.createIndex('users', 'email');
};

exports.down = (pgm) => {
  pgm.dropIndex('users', 'email');
  pgm.dropTable('users');
};

