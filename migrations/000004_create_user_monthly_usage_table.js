exports.up = (pgm) => {
  pgm.createTable('user_monthly_usage', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    year: { type: 'integer', notNull: true },
    month: { type: 'integer', notNull: true },
    messages_used: { type: 'integer', notNull: true, default: 0 },
    last_reset_date: { type: 'timestamp with time zone', default: pgm.func('NOW()') },
    created_at: { type: 'timestamp with time zone', default: pgm.func('NOW()') },
    updated_at: { type: 'timestamp with time zone', default: pgm.func('NOW()') },
  });

  pgm.addConstraint('user_monthly_usage', 'check_month_range', {
    check: 'month >= 1 AND month <= 12',
  });

  pgm.addConstraint('user_monthly_usage', 'unique_user_year_month', {
    unique: ['user_id', 'year', 'month'],
  });

  pgm.createIndex('user_monthly_usage', ['user_id', 'year', 'month']);
};

exports.down = (pgm) => {
  pgm.dropIndex('user_monthly_usage', ['user_id', 'year', 'month']);
  pgm.dropConstraint('user_monthly_usage', 'unique_user_year_month');
  pgm.dropConstraint('user_monthly_usage', 'check_month_range');
  pgm.dropTable('user_monthly_usage');
};

