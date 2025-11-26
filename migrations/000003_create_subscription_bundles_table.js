exports.up = (pgm) => {
  pgm.createType('bundle_tier', ['Basic', 'Pro', 'Enterprise']);
  pgm.createType('billing_cycle', ['monthly', 'yearly']);

  pgm.createTable('subscription_bundles', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    tier: { type: 'bundle_tier', notNull: true },
    billing_cycle: { type: 'billing_cycle', notNull: true },
    max_messages: { type: 'integer', notNull: true },
    price: { type: 'decimal(10, 2)', notNull: true },
    start_date: { type: 'timestamp with time zone', notNull: true },
    end_date: { type: 'timestamp with time zone', notNull: true },
    renewal_date: { type: 'timestamp with time zone' },
    auto_renew: { type: 'boolean', notNull: true, default: false },
    is_active: { type: 'boolean', notNull: true, default: true },
    messages_used: { type: 'integer', notNull: true, default: 0 },
    created_at: { type: 'timestamp with time zone', default: pgm.func('NOW()') },
    updated_at: { type: 'timestamp with time zone', default: pgm.func('NOW()') },
  });

  pgm.createIndex('subscription_bundles', 'user_id');
  pgm.createIndex('subscription_bundles', ['user_id', 'is_active'], {
    where: 'is_active = true',
  });
  pgm.createIndex('subscription_bundles', 'renewal_date', {
    where: 'auto_renew = true',
  });
};

exports.down = (pgm) => {
  pgm.dropIndex('subscription_bundles', 'renewal_date');
  pgm.dropIndex('subscription_bundles', ['user_id', 'is_active']);
  pgm.dropIndex('subscription_bundles', 'user_id');
  pgm.dropTable('subscription_bundles');
  pgm.dropType('billing_cycle');
  pgm.dropType('bundle_tier');
};

