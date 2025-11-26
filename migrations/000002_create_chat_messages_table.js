exports.up = (pgm) => {
  pgm.createTable('chat_messages', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    question: { type: 'text', notNull: true },
    answer: { type: 'text', notNull: true },
    tokens_used: { type: 'integer', notNull: true, default: 0 },
    created_at: { type: 'timestamp with time zone', default: pgm.func('NOW()') },
  });

  pgm.createIndex('chat_messages', 'user_id');
  pgm.createIndex('chat_messages', 'created_at', { order: 'DESC' });
};

exports.down = (pgm) => {
  pgm.dropIndex('chat_messages', 'created_at');
  pgm.dropIndex('chat_messages', 'user_id');
  pgm.dropTable('chat_messages');
};

