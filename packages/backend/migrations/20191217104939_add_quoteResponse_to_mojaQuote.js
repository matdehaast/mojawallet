
exports.up = function(knex) {
  return knex.schema.table('mojaQuote', function (table) {
    table.string('quoteResponse').nullable()
  })
}

exports.down = function(knex) {
  return knex.schema.table('mojaQuote', function (table) {
    table.dropColumn('quoteResponse')
  })
}
