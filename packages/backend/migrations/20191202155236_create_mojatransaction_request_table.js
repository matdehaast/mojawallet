
exports.up = function(knex) {
  return knex.schema
    .createTable('mojatransaction_request', function (table) {
       table.increments('id').primary()
       table.string('serializedRequest')
       table.boolean('valid')
    })
  
};

exports.down = function(knex) {
  return knex.schema
      .dropTableIfExists("mojatransaction_request")
};
