
exports.up = function(knex) {
  return knex.schema
    .createTable('mojaquote', function (table) {
       table.increments('id').primary()
       table.uuid('quoteId')
       table.uuid('transactionId')
       table.string('serializedQuote')
    })
};

exports.down = function(knex) {
  return knex.schema
      .dropTableIfExists("mojaquote")
};
